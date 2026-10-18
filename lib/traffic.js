import "server-only";
import { fetchDailyTraffic, getConnection, isAccessRevoked } from "@/lib/google";
import { createAdminClient } from "@/lib/supabase/admin";

export const CHART_DAYS = 365;
// A few extra days, because Search Console data arrives about 2–3 days late.
const KEEP_DAYS = 380;
const STALE_AFTER_MS = 6 * 60 * 60 * 1000;
// Syncs from before this time only saved about 90 days, so they run once more for the longer ranges.
const LONG_HISTORY_SINCE = Date.parse("2026-10-05T13:00:00Z");

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function daysAgo(days, from = new Date()) {
  const date = new Date(from);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

async function syncSite(admin, site, refreshToken) {
  // Mark as synced first, so a failing site is retried every few hours instead of on every visit.
  await admin.from("sites").update({ last_synced_at: new Date().toISOString() }).eq("id", site.id);

  const oldest = isoDate(daysAgo(KEEP_DAYS));
  const rows = await fetchDailyTraffic(refreshToken, site.property, oldest, isoDate(new Date()));
  if (rows.length) {
    const { error } = await admin
      .from("site_traffic_daily")
      .upsert(rows.map((row) => ({ site_id: site.id, ...row })), { onConflict: "site_id,date" });
    if (error) throw error;
  }
  await admin.from("site_traffic_daily").delete().eq("site_id", site.id).lt("date", oldest);
}

// Refreshes a user's sites whose data is older than a few hours (or never fetched).
export async function syncStaleSites(userId) {
  const admin = createAdminClient();
  const { data: sites, error } = await admin.from("sites").select("id, property, last_synced_at").eq("user_id", userId);
  if (error) throw error;

  const due = sites.filter((site) => {
    const syncedAt = site.last_synced_at ? Date.parse(site.last_synced_at) : 0;
    return !syncedAt || syncedAt < LONG_HISTORY_SINCE || Date.now() - syncedAt > STALE_AFTER_MS;
  });
  if (!due.length) return;

  const connection = await getConnection(userId);
  if (!connection) return;

  const results = await Promise.allSettled(due.map((site) => syncSite(admin, site, connection.refreshToken)));
  results.forEach((result, index) => {
    if (result.status === "rejected" && !isAccessRevoked(result.reason)) {
      console.error(`Syncing traffic for ${due[index].property} failed:`, result.reason);
    }
  });
}

// The last CHART_DAYS days of traffic, with missing days filled in as zero.
// Search Console's own chart stops about 2 days ago, so the ranges line up with it.
function fillDays(rows) {
  const byDate = new Map(rows.map((row) => [String(row.date).slice(0, 10), row]));
  const latestStored = rows.length ? String(rows.at(-1).date).slice(0, 10) : isoDate(daysAgo(1));
  const completeThrough = isoDate(daysAgo(2));
  const end = new Date(`${latestStored < completeThrough ? latestStored : completeThrough}T00:00:00Z`);

  return Array.from({ length: CHART_DAYS }, (_, index) => {
    const date = isoDate(daysAgo(CHART_DAYS - 1 - index, end));
    const row = byDate.get(date);
    return { date, clicks: row?.clicks ?? 0, impressions: row?.impressions ?? 0 };
  });
}

export async function getSitesWithTraffic(supabase, userId) {
  const { data: sites, error } = await supabase
    .from("sites")
    .select("id, property, name, description, anonymous, logo_url, category, status, show_status, chart")
    .eq("user_id", userId)
    .order("created_at");
  if (error) throw error;

  const oldest = isoDate(daysAgo(KEEP_DAYS));
  return Promise.all(
    sites.map(async (site) => {
      const { data: rows, error: rowsError } = await supabase
        .from("site_traffic_daily")
        .select("date, clicks, impressions")
        .eq("site_id", site.id)
        .gte("date", oldest)
        .order("date");
      if (rowsError) throw rowsError;
      return { ...site, days: fillDays(rows) };
    })
  );
}
