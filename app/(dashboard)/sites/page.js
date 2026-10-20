import { loadOwner, requireUser } from "@/lib/auth";
import { getConnection } from "@/lib/google";
import { socialLinksOf } from "@/lib/profile";
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

export default async function SitesPage({ searchParams }) {
  const sessionPromise = requireUser();
  const ownerPromise = loadOwner();
  const [owner, connection, sitesResult, query] = await Promise.all([
    ownerPromise,
    sessionPromise.then(({ userId }) =>
      withTimeout(getConnection(userId), 8000).catch((error) => {
        console.error("Loading Google connection failed:", error);
        return null;
      }),
    ),
    sessionPromise.then(({ supabase, userId }) =>
      getSitesWithTraffic(supabase, userId)
        .then((sites) => ({ sites, error: null }))
        .catch((error) => {
          console.error("Loading sites failed:", error);
          return { sites: null, error };
        }),
    ),
    searchParams,
  ]);
  const { google } = query;
  const { profile } = owner;
  const sites = sitesResult.sites;
  const sitesError = sitesResult.error;
  const previewProfile = {
    name: profile?.name || "Your name",
    bio: profile?.bio || "",
    location: profile?.location || "",
    avatarUrl: profile?.avatar_url || "",
    links: socialLinksOf(profile ?? {}),
    chartClicks: profile?.chart_clicks || STYLE_DEFAULTS.chartClicks,
    chartImpressions: profile?.chart_impressions || STYLE_DEFAULTS.chartImpressions,
    font: profile?.font_style || STYLE_DEFAULTS.font,
    card: profile?.card_color || STYLE_DEFAULTS.card,
    page: profile?.page_color || STYLE_DEFAULTS.page,
    text: inkFor(profile?.page_color || STYLE_DEFAULTS.page, profile?.text_color),
    share: profile?.share_color || STYLE_DEFAULTS.share,
  };
  const googleConnection = connection ? { email: connection.email, status: "ok" } : null;

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
            connection={googleConnection}
            sites={sites}
            profile={previewProfile}
            notice={NOTICES[google] ?? null}
          />
        )}
      </div>
    </main>
  );
}
