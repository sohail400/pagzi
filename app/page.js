import Link from "next/link";
import AnalyticsCard from "@/components/AnalyticsCard";
import BrandMark from "@/components/BrandMark";
import LandingClaim from "@/components/LandingClaim";
import LandingPreview from "@/components/LandingPreview";
import PayButton from "@/components/PayButton";
import ProductDemo from "@/components/ProductDemo";
import ShowcaseWall from "@/components/ShowcaseWall";
import SiteFooter from "@/components/SiteFooter";
import StyleDemo from "@/components/StyleDemo";
import { isBuilderAccount } from "@/lib/payments";
import { PROFILE_COLUMNS, socialLinksOf } from "@/lib/profile";
import { STYLE_DEFAULTS } from "@/lib/style";
import { createClient } from "@/lib/supabase/server";
import { getSitesWithTraffic } from "@/lib/traffic";

const SHOWCASE_USERNAME = "sohail";

const PINK_BUTTON =
  "btn btn-save h-12 w-full rounded-xl border-0 px-7 font-semibold text-white shadow-none sm:w-auto";

const FEATURES = [
  ["Show growth with ", "Search Console"],
  ["Build trust with ", "real clicks"],
  ["Customizable ", "charts and colors"],
  ["Custom domain"],
  ["Search engines follow your ", "links"],
  ["24 themes and 13 fonts"],
];

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
    console.error("Landing profile query failed:", result.error.message);
    const missing = list.find((column) => detail.includes(column));
    if (!missing) return null;
    list = list.filter((column) => column !== missing);
  }
  return null;
}

async function loadShowcase() {
  try {
    const supabase = await createClient();
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
        text: profile.text_color || STYLE_DEFAULTS.text,
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

async function loadViewer() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (!data?.claims?.sub) return { signedIn: false, paid: false, builder: false };
    const profile = await supabase.from("profiles").select("username, paid_at").eq("id", data.claims.sub).maybeSingle();
    const builder = isBuilderAccount(profile.data?.username);
    return { signedIn: true, paid: Boolean(profile.data?.paid_at) || builder, builder };
  } catch (error) {
    console.error("Landing viewer failed:", error);
    return { signedIn: false, paid: false, builder: false };
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
  const showcase = await loadShowcase();
  const viewer = await loadViewer();

  return (
    <div className="min-h-screen bg-[#1F1F1F] font-sans text-stone-100">
      <header className="navbar mx-auto max-w-6xl px-5 py-5 sm:px-8">
        <div className="navbar-start">
          <a
            href="#top"
            className="link flex items-center gap-2 text-lg font-bold tracking-tight text-white no-underline"
            aria-label="pagzi.online home"
          >
            <BrandMark />
            pagzi.online
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

      <main id="top">
        <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-12 lg:py-16">
          <LandingPreview
            profile={showcase?.profile}
            sites={showcase?.previewSites || []}
            sampleCharts={showcase?.sampleCharts}
            font={showcase?.font}
          />
          <div className="order-1 lg:order-2">
            <h1 className="max-w-xl text-4xl font-bold leading-[1.05] tracking-[-0.045em] text-white sm:text-6xl">
              Turn Your Website Growth Into Your Story.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-stone-300 sm:text-lg">
              Showcase your projects, track Google Search Console clicks and impressions, and share your journey as a
              website owner or indie hacker.
            </p>
            <LandingClaim />
            <p className="mt-4 text-sm text-stone-500">
              <Link href={`/${SHOWCASE_USERNAME}`} className="font-semibold text-stone-300 hover:text-white">
                See an example
              </Link>
            </p>
          </div>
        </section>

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
              $9 once for the first 30 people. No subscription.
            </p>
            <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="order-2 rounded-[2rem] bg-[#2A2A2A] p-7 sm:p-9 lg:order-1">
                <p className="text-2xl font-bold tracking-tight text-white">What you get</p>
                <ul className="mt-6 space-y-3">
                  {FEATURES.map(([text, emphasis]) => (
                    <li key={text + (emphasis || "")} className="flex items-start gap-3 text-base leading-7 text-stone-200">
                      <Check />
                      <span>
                        {text}
                        {emphasis && <span className="font-semibold text-white underline decoration-white/40 underline-offset-4">{emphasis}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-1 flex flex-col rounded-[2rem] border border-[#ff4fa3] bg-[#1F1F1F] p-7 sm:p-9 lg:order-2">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#ff4fa3]">First 30 users</p>
                <p className="mt-4 text-6xl font-bold tracking-[-0.05em] text-white">$9</p>
                <p className="mt-3 text-sm font-medium leading-6 text-white">One-time payment, no subscription.</p>
                <p className="mt-2 text-sm leading-6 text-stone-400">
                  This price is only for the first 30 people. After that, it goes up. Pay once and the page stays yours.
                </p>
                {viewer.signedIn ? (
                  <PayButton paid={viewer.paid} complimentary={viewer.builder} className={`${PINK_BUTTON} mt-8 w-full`} />
                ) : (
                  <Link href="/signup" className={`${PINK_BUTTON} mt-8 w-full`}>
                    Create your page
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
