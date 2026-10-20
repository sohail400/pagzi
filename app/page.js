import Link from "next/link";
import AnalyticsCard from "@/components/AnalyticsCard";
import BrandMark from "@/components/BrandMark";
import LandingClaim from "@/components/LandingClaim";
import LandingPreview from "@/components/LandingPreview";
import ProductDemo from "@/components/ProductDemo";
import ShowcaseWall from "@/components/ShowcaseWall";
import SiteFooter from "@/components/SiteFooter";
import StyleDemo from "@/components/StyleDemo";
import { PLAN_OPTIONS } from "@/lib/plans";
import { EARLY_SPOT_LIMIT, earlySpotCount } from "@/lib/payments";
import { PROFILE_COLUMNS, socialLinksOf } from "@/lib/profile";
import { inkFor, STYLE_DEFAULTS } from "@/lib/style";
import { createPublicClient } from "@/lib/supabase/public";
import { getSitesWithTraffic } from "@/lib/traffic";

const SHOWCASE_USERNAME = "sohail";

export const revalidate = 120;

const PINK_BUTTON =
  "btn btn-save h-12 w-full rounded-xl border-0 px-7 font-semibold text-white shadow-none sm:w-auto";

const FEATURES = [
  "Build trust with verified Google Search Console data",
  "Get a dofollow backlink to your website",
  "Updates automatically",
  "Share your indie hacking journey",
  "Customize your charts, colors and fonts",
  "Use your own custom domain",
  "24 themes and 13 fonts",
];

function featureParts(line) {
  const parts = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let last = 0;
  for (const match of line.matchAll(pattern)) {
    if (match.index > last) parts.push({ text: line.slice(last, match.index), bold: false });
    parts.push({ text: match[1], bold: true });
    last = match.index + match[0].length;
  }
  if (last < line.length) parts.push({ text: line.slice(last), bold: false });
  return parts;
}

function sampleDays() {
  return Array.from({ length: 365 }, (_, index) => {
    const date = new Date("2026-10-10T00:00:00Z");
    date.setUTCDate(date.getUTCDate() - (364 - index));
    return {
      date: date.toISOString().slice(0, 10),
      clicks: Math.round(40 + Math.sin(index / 3) * 25 + (index % 17)),
      impressions: Math.round(800 + Math.cos(index / 4) * 200 + index * 4),
    };
  });
}

function hasTraffic(days) {
  return days?.some((day) => day.clicks > 0 || day.impressions > 0);
}

async function loadProfile(supabase) {
  let list = `id, ${PROFILE_COLUMNS}`.split(",").map((column) => column.trim()).filter(Boolean);
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const result = await supabase.from("profiles").select(list.join(", ")).eq("username", SHOWCASE_USERNAME).maybeSingle();
    if (!result.error) return result.data;
    const detail = `${result.error.message ?? ""} ${result.error.details ?? ""} ${result.error.hint ?? ""}`;
    const missing = list.find((column) => detail.includes(column));
    if (!missing) {
      console.error("Landing profile query failed:", result.error.message);
      return null;
    }
    list = list.filter((column) => column !== missing);
  }
  return null;
}

async function loadShowcase() {
  try {
    const supabase = createPublicClient();
    const profile = await loadProfile(supabase);
    if (!profile) return null;

    let loaded = [];
    try {
      loaded = await getSitesWithTraffic(supabase, profile.id);
    } catch (error) {
      console.error("Landing showcase traffic failed:", error);
    }

    const fallback = sampleDays();
    let sampleCharts = false;
    const sites = loaded.map((site) => {
      const real = hasTraffic(site.days);
      if (!real) sampleCharts = true;
      return {
        id: site.id,
        name: site.anonymous ? "" : site.name,
        description: site.anonymous ? "" : site.description || "",
        logoUrl: site.anonymous ? "" : site.logo_url || "",
        category: site.anonymous ? "" : site.category || "",
        status: site.anonymous || !site.show_status ? "" : site.status || "",
        anonymous: Boolean(site.anonymous),
        chart: site.chart || "area",
        sample: !real,
        days: real ? site.days : fallback,
      };
    });

    return {
      profile: {
        avatarUrl: profile.avatar_url || "",
        name: profile.name || profile.username,
        location: profile.location || "",
        bio: profile.bio || "",
        links: socialLinksOf(profile),
      },
      style: {
        chartClicks: profile.chart_clicks || STYLE_DEFAULTS.chartClicks,
        chartImpressions: profile.chart_impressions || STYLE_DEFAULTS.chartImpressions,
        font: profile.font_style || STYLE_DEFAULTS.font,
        card: profile.card_color || STYLE_DEFAULTS.card,
        page: profile.page_color || STYLE_DEFAULTS.page,
        text: inkFor(profile.page_color || STYLE_DEFAULTS.page, profile.text_color),
        share: profile.share_color || STYLE_DEFAULTS.share,
      },
      font: profile.font_style || "inter",
      sites,
      sampleCharts,
      featured: sites[0] ? { ...sites[0] } : null,
      previewSites: sites.map((site) => ({ ...site, days: site.days.slice(-28) })),
    };
  } catch (error) {
    console.error("Landing showcase failed:", error);
    return null;
  }
}

async function loadEarlySpots() {
  try {
    return await earlySpotCount();
  } catch (error) {
    console.error("Early spot count failed:", error?.code, error?.message, error?.details, error?.hint);
    return { left: EARLY_SPOT_LIMIT, soldOut: false };
  }
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#ff4fa3]">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12.5 9.2 17 19 7"
      />
    </svg>
  );
}

export default async function LandingPage() {
  const [showcase, early] = await Promise.all([loadShowcase(), loadEarlySpots()]);

  return (
    <div className="min-h-screen bg-[#1F1F1F] font-sans text-stone-100">
      <div id="top" className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="landing-glow pointer-events-none absolute inset-0" />
      <header className="navbar relative mx-auto max-w-6xl px-5 py-5 sm:px-8">
        <div className="navbar-start">
          <a
            href="#top"
            className="link flex items-center gap-2 text-lg font-bold tracking-tight text-white no-underline"
            aria-label="Pagzi home"
          >
            <BrandMark />
            Pagzi
          </a>
        </div>
        <div className="navbar-end gap-5">
          <a href="#pricing" className="text-sm font-medium text-stone-300 hover:text-white">
            Pricing
          </a>
          <Link href="/signup" className="hidden text-sm font-medium text-stone-300 hover:text-white sm:inline">
            Sign up
          </Link>
          <Link
            href="/login"
            className="btn btn-sm h-9 rounded-full border border-white/20 bg-transparent px-4 font-semibold text-stone-100 shadow-none hover:border-white/40 hover:bg-white/10"
          >
            Log in
          </Link>
        </div>
      </header>

        <section className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-12 lg:py-16">
          <LandingPreview
            profile={showcase?.profile}
            sites={showcase?.previewSites || []}
            sampleCharts={showcase?.sampleCharts}
            font={showcase?.font}
          />
          <div className="order-1 lg:order-2">
            <h1 className="max-w-xl text-4xl font-bold leading-[1.05] tracking-[-0.045em] text-white sm:text-6xl">
              Show your real website growth.
              <span className="mt-2 block">Not a screenshot.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-stone-300 sm:text-lg">
              Connect Google Search Console and get one public page with your real clicks and impressions. Share it with
              your audience, clients, and buyers.
            </p>
            <LandingClaim />
            <p className="mt-4 text-sm text-stone-500">
              <Link href={`/${SHOWCASE_USERNAME}`} className="font-semibold text-stone-300 hover:text-white">
                See an example
              </Link>
            </p>
          </div>
        </section>
      </div>

      <main>
        <section className="bg-[#2A2A2A] px-5 py-12 text-center sm:px-8 sm:py-20 lg:py-28">
          <h2 className="text-3xl font-bold tracking-[-0.035em] text-white sm:text-5xl">
            Everything you build, in one place.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-stone-300">
            Your profile, your websites, and your Search Console growth, together on one page you can share.
          </p>
        </section>

        {showcase?.profile && (
          <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-12 lg:py-28">
            <div className="order-2 lg:order-2">
              <h2 className="text-3xl font-bold leading-tight tracking-[-0.035em] text-white sm:text-5xl">
                Create Your Own Website Profile
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-stone-300">
                Add your name, photo, location, and bio. Connect Google Search Console to showcase your website clicks,
                impressions, and growth in one beautiful, shareable profile.
              </p>
              <Link href="/signup" className={`${PINK_BUTTON} mt-8`}>
                Create Your Page →
              </Link>
            </div>
            <div className="order-1 min-w-0 lg:order-1">
              <ProductDemo
                profile={showcase.profile}
                site={(showcase.previewSites || []).find((item) => item.name === "norskalkulator.com") || showcase.previewSites?.[0]}
                sample={Boolean(((showcase.previewSites || []).find((item) => item.name === "norskalkulator.com") || showcase.previewSites?.[0])?.sample)}
              />
            </div>
          </section>
        )}

        {showcase?.profile && (
          <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8 sm:py-20 lg:py-28">
            <div className="order-2 max-w-xl lg:order-1">
              <h2 className="text-3xl font-bold leading-tight tracking-[-0.035em] text-white sm:text-5xl">
                Make Your Page Your Own
              </h2>
              <p className="mt-5 text-base leading-7 text-stone-300">
                Customize your page with beautiful themes, chart styles, card colors, and fonts. See every change live
                and create a profile that matches your personal style.
              </p>
              <Link href="/signup" className={`${PINK_BUTTON} mt-8`}>
                Create your page →
              </Link>
            </div>
            <div className="order-1 min-w-0 lg:order-2 lg:mt-4">
              <StyleDemo
                profile={showcase.profile}
                site={(showcase.previewSites || []).find((item) => item.name === "norskalkulator.com") || showcase.previewSites?.[0]}
                style={showcase.style}
              />
            </div>
          </section>
        )}

        <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-12 lg:py-28">
          <div className="order-2 lg:order-2">
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.035em] text-white sm:text-5xl">
              Show how each site is growing.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-stone-300">
              Connect Search Console and each website gets its own chart of clicks and impressions. Hover a point to
              read the day.
            </p>
            <Link href="/signup" className={`${PINK_BUTTON} mt-8`}>
              Create your page →
            </Link>
          </div>
          <div className="order-1 min-w-0 lg:order-1">
            {showcase?.featured ? (
              <>
                <AnalyticsCard
                  name={showcase.featured.name}
                  description={showcase.featured.description}
                  logoUrl={showcase.featured.logoUrl}
                  category={showcase.featured.category}
                  status={showcase.featured.status}
                  anonymous={showcase.featured.anonymous}
                  chart="combined"
                  clicksColor={STYLE_DEFAULTS.chartClicks}
                  impressionsColor={STYLE_DEFAULTS.chartImpressions}
                  cardColor="#FAFAF9"
                  days={showcase.featured.days}
                  demo
                  bordered={false}
                />
                {showcase.featured.sample && (
                  <p className="mt-3 text-center text-xs text-stone-500">Sample chart numbers</p>
                )}
              </>
            ) : (
              <p className="px-4 py-16 text-center text-sm text-stone-400">The example chart will appear with the example page.</p>
            )}
          </div>
        </section>

        <ShowcaseWall
          name={showcase?.profile?.name || "Your name"}
          place={showcase?.profile?.location || ""}
          sites={(showcase?.sites || []).map((site) => site.name).filter(Boolean)}
        />

        <section id="pricing" className="scroll-mt-8 border-y border-white/10 px-5 py-12 sm:px-8 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-bold tracking-[-0.035em] text-white sm:text-5xl">
              One page. One price.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-center text-base leading-7 text-stone-300">
              No subscription.
            </p>
            <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-3">
              {PLAN_OPTIONS.map((plan) => {
                const soldOut = plan.id === "early" && early.soldOut;
                return (
                  <div
                    key={plan.id}
                    className={`flex h-full flex-col rounded-[2rem] bg-[#1F1F1F] p-7 sm:p-9 ${plan.limited ? "border border-[#ff4fa3]" : "border border-white/10"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold uppercase tracking-wider text-[#ff4fa3]">{plan.name}</p>
                      {plan.limited && (
                        <span className="rounded-full border border-[#ff4fa3] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#ff4fa3]">
                          Limited
                        </span>
                      )}
                    </div>
                    <p className="mt-4 text-6xl font-bold tracking-[-0.05em] text-white">${plan.price}</p>
                    <p className="mt-3 text-sm font-medium leading-6 text-white">{plan.detail}</p>
                    {plan.id === "early" && (
                      <p className="mt-2 text-sm leading-6 text-stone-400">
                        {soldOut ? "Sold out" : `${early.left} of ${EARLY_SPOT_LIMIT} spots left`}
                      </p>
                    )}
                    <div className="mt-auto pt-8">
                      {soldOut ? (
                        <button type="button" disabled className="btn btn-save h-12 w-full cursor-not-allowed rounded-xl border-0 px-7 font-semibold text-white shadow-none">
                          Get my page
                        </button>
                      ) : (
                        <Link href={`/signup?plan=${plan.id}`} className="btn btn-save h-12 w-full rounded-xl border-0 px-7 font-semibold text-white shadow-none">
                          Get my page
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 rounded-[2rem] bg-[#2A2A2A] p-7 sm:p-9">
              <p className="text-2xl font-bold tracking-tight text-white">What you get</p>
              <ul className="mt-6 space-y-3">
                {FEATURES.map((line) => (
                  <li key={line} className="flex items-start gap-3 text-base leading-7 text-stone-200">
                    <Check />
                    <span>
                      {featureParts(line).map((part) =>
                        part.bold ? (
                          <span key={part.text} className="font-semibold text-white underline decoration-white/40 underline-offset-4">
                            {part.text}
                          </span>
                        ) : (
                          part.text
                        )
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
