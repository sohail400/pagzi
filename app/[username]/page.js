import { notFound } from "next/navigation";
import { cache } from "react";
import AnalyticsCard from "@/components/AnalyticsCard";
import Avatar from "@/components/Avatar";
import ShareButton from "@/components/ShareButton";
import SocialLinks from "@/components/SocialLinks";
import { hasFullAccess } from "@/lib/access";
import { isPublished, PROFILE_COLUMNS, socialLinksOf, USERNAME_PATTERN } from "@/lib/profile";
import { fontOf, inkFor, STYLE_DEFAULTS } from "@/lib/style";
import { createClient } from "@/lib/supabase/server";
import { getSitesWithTraffic, syncStaleSites } from "@/lib/traffic";

function siteHref(name) {
  const host = String(name || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(host)) return "";
  return `https://${host}`;
}

const getProfile = cache(async (username) => {
  const normalized = username.toLowerCase();
  if (!USERNAME_PATTERN.test(normalized)) return null;

  const supabase = await createClient();
  let columns = `id, ${PROFILE_COLUMNS}, paid_at`;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const result = await supabase.from("profiles").select(columns).eq("username", normalized).maybeSingle();
    if (!result.error) return result.data;
    const missing = ["paid_at", "published_at", "text_color", "share_color", "custom_domain"].find((column) =>
      `${result.error.message ?? ""}`.includes(column)
    );
    if (!missing || !columns.includes(missing)) {
      console.error("Loading a public profile failed:", result.error);
      return null;
    }
    columns = columns.replace(new RegExp(`,\\s*${missing}\\b`), "");
  }
  return null;
});

async function loadSites(userId) {
  try {
    return await getSitesWithTraffic(await createClient(), userId);
  } catch (error) {
    console.error("Loading public traffic failed:", error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile || !hasFullAccess(profile) || !isPublished(profile)) return { title: "Page not found · pagzi.online" };

  const displayName = profile.name || `@${profile.username}`;
  return {
    title: `${displayName} · pagzi.online`,
    description: profile.bio || `${displayName} on pagzi.online`,
  };
}

export default async function ProfilePage({ params }) {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile || !hasFullAccess(profile) || !isPublished(profile)) notFound();

  const links = socialLinksOf(profile);
  const pageColor = profile.page_color || STYLE_DEFAULTS.page;
  const textColor = inkFor(pageColor, profile.text_color);
  const shareColor = profile.share_color || STYLE_DEFAULTS.share;
  const shareUrl = profile.custom_domain
    ? `https://${profile.custom_domain}`
    : `https://pagzi.online/${profile.username}`;
  // Sync first so the chart is not drawn from an older, shorter history.
  await syncStaleSites(profile.id).catch((error) => console.error("Syncing traffic failed:", error));
  const sites = await loadSites(profile.id);

  return (
    <div
      className="min-h-screen px-4 py-6 sm:py-12"
      style={{ backgroundColor: pageColor, color: textColor, fontFamily: fontOf(profile.font_style).family }}
    >
      <div className="mx-auto grid w-full max-w-6xl items-start gap-10 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <div className="flex w-full flex-col gap-4 lg:sticky lg:top-8">
          <div className="flex items-center gap-4">
            <div className="shrink-0 self-start">
              <Avatar
                src={profile.avatar_url}
                name={profile.name}
                className="w-16 shadow-sm lg:w-28"
                textClassName="text-xl lg:text-3xl"
              />
            </div>
            <div className="flex min-w-0 flex-1 items-start justify-between gap-3 lg:hidden">
              <div className="min-w-0">
                <p className="truncate text-2xl font-bold leading-none tracking-tight">
                  {profile.name || `@${profile.username}`}
                </p>
                {profile.location && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm opacity-70">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 fill-current">
                      <path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                    </svg>
                    <span className="truncate">{profile.location}</span>
                  </p>
                )}
              </div>
              <ShareButton username={profile.username} title={profile.name || profile.username} color={shareColor} href={shareUrl} />
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-3">
            <p className="hidden text-3xl font-bold leading-none tracking-tight lg:block lg:text-4xl">
              {profile.name || `@${profile.username}`}
            </p>
            {profile.location && (
              <p className="hidden items-center gap-1.5 text-sm opacity-70 lg:flex">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 fill-current">
                  <path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                </svg>
                {profile.location}
              </p>
            )}
            {profile.bio && (
              <p className="max-w-lg whitespace-pre-line break-words text-sm font-medium leading-relaxed opacity-90 sm:text-base">
                {profile.bio}
              </p>
            )}
            <SocialLinks links={links} flush color={textColor} />
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-5 hidden justify-end lg:flex">
            <ShareButton username={profile.username} title={profile.name || profile.username} color={shareColor} href={shareUrl} />
          </div>
          {sites.length > 0 && (
          <div className="grid gap-2.5 lg:grid-cols-2 lg:gap-4">
            {sites.map((site) => (
              <AnalyticsCard
                key={site.id}
                anonymous={site.anonymous}
                siteUrl={site.anonymous ? "" : siteHref(site.name)}
                name={site.anonymous ? "" : site.name}
                description={site.anonymous ? "" : site.description}
                logoUrl={site.anonymous ? "" : site.logo_url}
                category={site.anonymous ? "" : site.category}
                status={site.anonymous || !site.show_status ? "" : site.status}
                chart={site.chart || "area"}
                clicksColor={profile.chart_clicks || STYLE_DEFAULTS.chartClicks}
                impressionsColor={profile.chart_impressions || STYLE_DEFAULTS.chartImpressions}
                cardColor={profile.card_color || STYLE_DEFAULTS.card}
                days={site.days}
                mobileCompact
              />
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
