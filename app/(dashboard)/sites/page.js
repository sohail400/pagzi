import { requireUser } from "@/lib/auth";
import { getConnection, isAccessRevoked, listProperties } from "@/lib/google";
import { selectProfile, socialLinksOf } from "@/lib/profile";
import { inkFor, STYLE_DEFAULTS } from "@/lib/style";
import { getSitesWithTraffic } from "@/lib/traffic";
import SitesManager from "./SitesManager";

export const metadata = {
  title: "Sites · pagzi.online",
};

const NOTICES = {
  connected: { type: "success", text: "Google Search Console is connected. Choose the sites to show below." },
  cancelled: { type: "info", text: "You cancelled the Google connection. Nothing was changed." },
  missing_permission: {
    type: "error",
    text: "pagzi.online needs permission to view your Search Console data. Please connect again and tick that box on Google’s screen.",
  },
  expired: { type: "error", text: "That connection attempt expired. Please try again." },
  failed: { type: "error", text: "We couldn’t connect to Google. Please try again." },
  not_configured: {
    type: "error",
    text: "Google connection isn’t set up yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local.",
  },
};

function withTimeout(promise, milliseconds) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), milliseconds);
    }),
  ]);
}

async function loadGoogle(userId) {
  let connection;
  try {
    connection = await withTimeout(getConnection(userId), 8000);
  } catch (error) {
    console.error("Loading Google connection failed:", error);
    return { connection: null, properties: null, googleWarning: "Google Search Console took too long to answer. Your saved sites are still here." };
  }
  if (!connection) return { connection: null, properties: null, googleWarning: null };

  try {
    const properties = await withTimeout(listProperties(connection.refreshToken), 8000);
    return { connection: { email: connection.email, status: "ok" }, properties, googleWarning: null };
  } catch (error) {
    if (!isAccessRevoked(error)) console.error("Listing Search Console sites failed:", error);
    const status = isAccessRevoked(error) ? "revoked" : "error";
    return {
      connection: { email: connection.email, status },
      properties: null,
      googleWarning: status === "revoked" ? null : "Google Search Console took too long to answer. Your saved sites are still here.",
    };
  }
}

export default async function SitesPage({ searchParams }) {
  const { supabase, userId } = await requireUser();
  const { google } = await searchParams;

  const profileColumns =
    "name, bio, location, avatar_url, x_url, linkedin_url, instagram_url, youtube_url, github_url, email_url, chart_clicks, chart_impressions, font_style, card_color, page_color, text_color, share_color";
  const [{ connection, properties, googleWarning }, profile, sitesResult] = await Promise.all([
    loadGoogle(userId),
    selectProfile(supabase, userId, profileColumns),
    getSitesWithTraffic(supabase, userId)
      .then((sites) => ({ sites, error: null }))
      .catch((error) => {
        console.error("Loading sites failed:", error);
        return { sites: null, error };
      }),
  ]);
  const sites = sitesResult.sites;
  const sitesError = sitesResult.error;
  const profileRow = profile.data;
  const previewProfile = {
    name: profileRow?.name || "Your name",
    bio: profileRow?.bio || "",
    location: profileRow?.location || "",
    avatarUrl: profileRow?.avatar_url || "",
    links: socialLinksOf(profileRow ?? {}),
    chartClicks: profileRow?.chart_clicks || STYLE_DEFAULTS.chartClicks,
    chartImpressions: profileRow?.chart_impressions || STYLE_DEFAULTS.chartImpressions,
    font: profileRow?.font_style || STYLE_DEFAULTS.font,
    card: profileRow?.card_color || STYLE_DEFAULTS.card,
    page: profileRow?.page_color || STYLE_DEFAULTS.page,
    text: inkFor(profileRow?.page_color || STYLE_DEFAULTS.page, profileRow?.text_color),
    share: profileRow?.share_color || STYLE_DEFAULTS.share,
  };

  return (
    <main className="px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-3xl font-bold tracking-[-0.035em] text-white">Sites</p>
          <p className="mt-2 text-sm leading-6 text-stone-400">
            Connect Google Search Console and choose which websites appear on your page.
          </p>
        </div>

        {sitesError ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            The connection timed out, so your sites could not be loaded. They are still saved. Refresh the page.
          </p>
        ) : (
          <SitesManager
            connection={connection}
            properties={properties}
            sites={sites}
            profile={previewProfile}
            notice={NOTICES[google] ?? (googleWarning ? { type: "info", text: googleWarning } : null)}
          />
        )}
      </div>
    </main>
  );
}
