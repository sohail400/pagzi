import LandingClaim from "@/components/LandingClaim";
import { isDarkHex } from "@/lib/style";

const LOOKS = [
  { page: "#FFFFFF", text: "#18181B", share: "#18181B" },
  { page: "#FFF7ED", text: "#431407", share: "#F97316" },
  { page: "#1E1B4B", text: "#F5F3FF", share: "#C4B5FD" },
  { page: "#0F172A", text: "#E2E8F0", share: "#38BDF8" },
  { page: "#ECFDF5", text: "#064E3B", share: "#059669" },
  { page: "#F5F0E8", text: "#292524", share: "#B45309" },
  { page: "#FFF1F2", text: "#4C0519", share: "#F43F5E" },
  { page: "#1F1F1F", text: "#F5F5F4", share: "#E7E5E4" },
  { page: "#F0F9FF", text: "#0C4A6E", share: "#0EA5E9" },
  { page: "#1C1917", text: "#FFFBEB", share: "#F59E0B" },
  { page: "#052E16", text: "#ECFDF5", share: "#4ADE80" },
  { page: "#FFFBEB", text: "#1C1917", share: "#D97706" },
];

const SPARKS = [
  "M2 28 C18 26 22 8 38 12 S58 30 74 16 98 6 118 14",
  "M2 22 C16 24 24 30 40 20 S62 6 80 14 100 28 118 10",
  "M2 16 C20 18 28 8 44 14 S66 28 84 18 104 8 118 18",
  "M2 26 C14 20 30 6 46 16 S70 30 88 12 106 8 118 20",
];

function WallPhone({ look, name, place, site, spark }) {
  const dark = isDarkHex(look.page);
  const card = dark ? "#292524" : "#FFFFFF";
  const ink = dark ? "#FAFAF9" : "#1C1917";
  const muted = dark ? "rgba(250,250,249,0.62)" : "rgba(28,25,23,0.55)";
  const shareInk = isDarkHex(look.share) ? "#FFFFFF" : "#1C1917";

  return (
    <div className="rounded-[1.7rem] bg-white/80 p-1 shadow-[0_22px_50px_rgba(0,0,0,0.28)] ring-1 ring-black/10">
      <div className="overflow-hidden rounded-[1.35rem] px-3 pb-3 pt-3.5" style={{ backgroundColor: look.page, color: look.text }}>
        <div className="mb-3 flex items-center justify-between">
          <span className="h-1 w-8 rounded-full bg-current opacity-30" />
          <span className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ backgroundColor: look.share, color: shareInk }}>
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V5m0 0 3 3M12 5 9 8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 13v5h10v-5" />
            </svg>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            style={{ backgroundColor: look.share, color: shareInk }}
          >
            {name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold leading-none">{name}</p>
            {place && (
              <p className="mt-1 truncate text-[10px] leading-none" style={{ color: muted }}>
                {place}
              </p>
            )}
          </div>
        </div>
        <div className="mt-3 rounded-xl px-2.5 py-2 shadow-sm" style={{ backgroundColor: card, color: ink }}>
          <p className="truncate text-[11px] font-semibold leading-none">{site}</p>
          <svg viewBox="0 0 120 36" className="mt-1.5 h-8 w-full" aria-hidden="true">
            <path d={spark} fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M2 30 C20 28 34 22 52 24 S86 18 118 8" fill="none" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function ShowcaseWall({ name = "Your name", place = "", sites = [] }) {
  const labels = sites.length ? sites : ["yoursite.com"];
  const phones = LOOKS.map((look, index) => ({
    look,
    site: labels[index % labels.length],
    spark: SPARKS[index % SPARKS.length],
  }));

  return (
    <section className="relative isolate min-h-[36rem] overflow-hidden bg-[#12141c] py-20 sm:min-h-[44rem] sm:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="showcase-drift absolute inset-x-[-8%] -top-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {phones.map((phone, index) => (
            <div key={`${phone.look.page}-${phone.site}-${index}`} className={index % 2 === 0 ? "translate-y-10" : ""}>
              <WallPhone look={phone.look} name={name} place={place} site={phone.site} spark={phone.spark} />
            </div>
          ))}
        </div>
        <div className="showcase-veil absolute inset-0" />
      </div>

      <div className="relative mx-auto max-w-lg px-5 text-center">
        <div className="bg-transparent px-5 py-8 sm:px-8 sm:py-10">
          <h2 className="text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl">Showcase your websites.</h2>
          <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-stone-200">
            One page for your name, your sites, and the growth behind them.
          </p>
          <LandingClaim stacked />
        </div>
      </div>
    </section>
  );
}
