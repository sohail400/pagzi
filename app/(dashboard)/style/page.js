import { loadOwner, requireUser } from "@/lib/auth";
import { socialLinksOf } from "@/lib/profile";
import { inkFor, STYLE_DEFAULTS } from "@/lib/style";
import { getSitesWithTraffic } from "@/lib/traffic";
import StyleEditor from "./StyleEditor";

export const metadata = {
  title: "Style · pagzi.online",
};

export default async function StylePage() {
  const sessionPromise = requireUser();
  const ownerPromise = loadOwner();
  const sitesPromise = sessionPromise.then(({ supabase, userId }) =>
    getSitesWithTraffic(supabase, userId).catch((loadError) => {
      console.error("Loading sites for the style preview failed:", loadError);
      return [];
    }),
  );
  const [{ profile: data, profileError }, sites] = await Promise.all([ownerPromise, sitesPromise]);

  const saved = {
    chartClicks: data?.chart_clicks || STYLE_DEFAULTS.chartClicks,
    chartImpressions: data?.chart_impressions || STYLE_DEFAULTS.chartImpressions,
    font: data?.font_style || STYLE_DEFAULTS.font,
    card: data?.card_color || STYLE_DEFAULTS.card,
    page: data?.page_color || STYLE_DEFAULTS.page,
    text: inkFor(data?.page_color || STYLE_DEFAULTS.page, data?.text_color),
    share: data?.share_color || STYLE_DEFAULTS.share,
    name: data?.name || "Your name",
    bio: data?.bio || "",
    location: data?.location || "",
    avatarUrl: data?.avatar_url || "",
    links: socialLinksOf(data ?? {}),
  };

  return (
    <main className="px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-3xl font-bold tracking-[-0.035em] text-white">Style</p>
          <p className="mt-2 text-sm leading-6 text-stone-400">
            Choose how your public page looks. The preview updates as you change it.
          </p>
        </div>
        {profileError ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            We couldn’t load your style. Please refresh the page.
          </p>
        ) : (
          <StyleEditor
            saved={saved}
            sites={sites.map((site) => ({
              id: site.id,
              name: site.name,
              description: site.description || "",
              anonymous: Boolean(site.anonymous),
              logoUrl: site.logo_url || "",
              category: site.category || "",
              status: site.show_status ? site.status || "" : "",
              chart: site.chart || "area",
              days: site.days,
            }))}
          />
        )}
      </div>
    </main>
  );
}
