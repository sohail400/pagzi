import "server-only";
import { after } from "next/server";
import { fetchDailyTraffic, getConnection, isAccessRevoked, isRateLimited } from "@/lib/google";
import { addIsoDays, chartSeries, completeThrough, pacificDate } from "@/lib/search-console";
import { createAdminClient } from "@/lib/supabase/admin";

export const CHART_DAYS = 365;
// A few extra days, because Search Console data arrives about 2–3 days late.
const KEEP_DAYS = 380;
const STALE_AFTER_MS = 6 * 60 * 60 * 1000;
const RETRY_AFTER_MS = 15 * 60 * 1000;
// Syncs from before this time only saved about 90 days, so they run once more for the longer ranges.
const LONG_HISTORY_SINCE = Date.parse("2026-10-05T13:00:00Z");
// Rows saved before this were not limited to Web search. One later sync replaces them.
const WEB_SEARCH_SINCE = Date.parse("2026-10-20T08:45:00.000Z");

function needsStoredRefresh(syncedAt) {
  return !syncedAt || syncedAt < LONG_HISTORY_SINCE || syncedAt < WEB_SEARCH_SINCE;
}

function retryStamp(error) {
  const wait = isAccessRevoked(error) || error?.response?.status === 403 ? STALE_AFTER_MS : RETRY_AFTER_MS;
  let stamp = Date.now() - STALE_AFTER_MS + wait;
  // A failure during the one-time Web refresh must not be read as "still on the old query".
  if (Date.now() < WEB_SEARCH_SINCE) stamp = Math.max(stamp, WEB_SEARCH_SINCE);
  return new Date(stamp).toISOString();
}

function successStamp() {
  return new Date(Math.max(Date.now(), WEB_SEARCH_SINCE + 1000)).toISOString();
}

async function syncSite(admin, site, refreshToken) {
  const today = pacificDate();
  const oldest = addIsoDays(today, -KEEP_DAYS);
  let rows;
  try {
    rows = await fetchDailyTraffic(refreshToken, site.property, oldest, today);
  } catch (error) {
    await admin.from("sites").update({ last_synced_at: retryStamp(error) }).eq("id", site.id);
    throw error;
  }

  if (rows.length) {
    const { error } = await admin
      .from("site_traffic_daily")
      .upsert(rows.map((row) => ({ site_id: site.id, ...row })), { onConflict: "site_id,date" });
    if (error) throw error;
    const { error: gapError } = await admin
      .from("site_traffic_daily")
      .delete()
      .eq("site_id", site.id)
      .gte("date", oldest)
      .lte("date", today)
      .not("date", "in", `(${rows.map((row) => row.date).join(",")})`);
    if (gapError) throw gapError;
  } else {
    const { error } = await admin.from("site_traffic_daily").delete().eq("site_id", site.id).gte("date", oldest).lte("date", today);
    if (error) throw error;
  }
  const { error: trimError } = await admin.from("site_traffic_daily").delete().eq("site_id", site.id).lt("date", oldest);
  if (trimError) throw trimError;
  const { error: stampError } = await admin.from("sites").update({ last_synced_at: successStamp() }).eq("id", site.id);
  if (stampError) throw stampError;
}

// A first visit still waits when a site has never stored the long history.
// Later refreshes run after the page is sent, so a 6-hour update does not hold the screen.
export async function syncTrafficForVisit(userId) {
  const admin = createAdminClient();
  const { data: sites, error } = await admin.from("sites").select("last_synced_at").eq("user_id", userId);
  if (error) throw error;

  const now = Date.now();
  let blocking = false;
  let stale = false;
  for (const site of sites ?? []) {
    const syncedAt = site.last_synced_at ? Date.parse(site.last_synced_at) : 0;
    if (needsStoredRefresh(syncedAt)) blocking = true;
    if (!syncedAt || now - syncedAt > STALE_AFTER_MS) stale = true;
  }
  if (!stale && !blocking) return;
  if (blocking) {
    await syncStaleSites(userId);
    return;
  }
  after(() => {
    syncStaleSites(userId).catch((error) => console.error("Syncing traffic failed:", error));
  });
}

// Refreshes a user's sites whose data is older than a few hours (or never fetched).
export async function syncStaleSites(userId) {
  const admin = createAdminClient();
  const { data: sites, error } = await admin.from("sites").select("id, property, last_synced_at").eq("user_id", userId);
  if (error) throw error;

  const due = (sites ?? []).filter((site) => {
    const syncedAt = site.last_synced_at ? Date.parse(site.last_synced_at) : 0;
    return needsStoredRefresh(syncedAt) || Date.now() - syncedAt > STALE_AFTER_MS;
  });
  if (!due.length) return;

  const connection = await getConnection(userId);
  if (!connection) return;

  const results = await Promise.allSettled(due.map((site) => syncSite(admin, site, connection.refreshToken)));
  results.forEach((result, index) => {
    if (result.status === "rejected" && !isAccessRevoked(result.reason) && !isRateLimited(result.reason)) {
      console.error(`Syncing traffic for ${due[index].property} failed:`, result.reason);
    }
  });
}

export async function getSitesWithTraffic(supabase, userId) {
  const { data: sites, error } = await supabase
    .from("sites")
    .select("id, property, name, description, anonymous, logo_url, category, status, show_status, chart")
    .eq("user_id", userId)
    .order("created_at");
  if (error) throw error;

  const oldest = addIsoDays(pacificDate(), -KEEP_DAYS);
  const end = completeThrough();
  return Promise.all(
    sites.map(async (site) => {
      const { data: rows, error: rowsError } = await supabase
        .from("site_traffic_daily")
        .select("date, clicks, impressions")
        .eq("site_id", site.id)
        .gte("date", oldest)
        .order("date");
      if (rowsError) throw rowsError;
      return { ...site, days: chartSeries(rows, end, CHART_DAYS) };
    })
  );
}
