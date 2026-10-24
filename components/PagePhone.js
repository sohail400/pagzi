import AnalyticsCard from "@/components/AnalyticsCard";
import Avatar from "@/components/Avatar";
import SocialLinks from "@/components/SocialLinks";
import { PREVIEW_DAYS, fontOf, isDarkHex } from "@/lib/style";

const SAMPLE_SITE = {
  id: "sample",
  name: "yoursite.com",
  description: "A short description of this website",
  category: "Productivity",
  status: "Active",
  chart: "area",
  days: PREVIEW_DAYS,
  anonymous: false,
  logoUrl: "",
};

export default function PagePhone({
  profile,
  page,
  background = "",
  text,
  share,
  font,
  clicks,
  impressions,
  card,
  sites = [],
  sample = false,
  compact = false,
}) {
  const textColor = text || (isDarkHex(page) ? "#F5F5F4" : "#1C1917");
  const shareColor = share || "#E7E5E4";
  const shareInk = isDarkHex(shareColor) ? "#ffffff" : "#1c1917";
  const lightPage = !isDarkHex(page);
  const nameColor = lightPage ? "text-black" : "";
  const mutedColor = lightPage ? "text-stone-500" : "text-stone-400";
  const cards = sites.length ? sites : sample ? [SAMPLE_SITE] : [];

  return (
    <div className="mockup-phone">
      <div className="mockup-phone-camera"></div>
      <div
        className="mockup-phone-display"
        style={{
          backgroundColor: page,
          color: textColor,
          backgroundImage: background || "none",
          fontFamily: fontOf(font).family,
          overflowY: "auto",
          transition: "background-color 700ms ease, color 700ms ease",
        }}
      >
        <div className={`relative ${compact ? "px-4 pb-6 pt-10" : "px-4 pb-5 pt-12"}`}>
          {compact ? (
            <div className="flex items-start gap-4">
                <Avatar src={profile.avatarUrl} name={profile.name} className="w-[4.75rem] shrink-0 shadow-sm" textClassName="text-2xl" />
                <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                  <div className="min-w-0 pt-1">
                    <p className={`truncate text-xl font-bold leading-tight tracking-tight ${nameColor}`}>{profile.name}</p>
                    {profile.location && (
                      <p className={`mt-3 flex items-center gap-1.5 text-[13px] leading-none ${mutedColor}`}>
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
                          <circle cx="12" cy="10" r="2.2" />
                        </svg>
                        <span className="truncate">{profile.location}</span>
                      </p>
                    )}
                  </div>
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm"
                    style={{ backgroundColor: shareColor, color: shareInk }}
                  >
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current stroke-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V5m0 0 3.5 3.5M12 5 8.5 8.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12.5V18a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-5.5" />
                    </svg>
                  </span>
                </div>
              </div>
          ) : (
            <>
              <span
                aria-hidden="true"
                className="absolute right-3 top-12 z-10 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
                style={{ backgroundColor: shareColor, color: shareInk }}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V5m0 0 3.5 3.5M12 5 8.5 8.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12.5V18a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-5.5" />
                </svg>
              </span>
              <Avatar src={profile.avatarUrl} name={profile.name} className="w-16" textClassName="text-xl" />
              <p className="mt-3 text-2xl font-bold leading-none tracking-tight">{profile.name}</p>
              {profile.location && <p className="mt-2 text-sm opacity-70">{profile.location}</p>}
            </>
          )}
          {profile.bio && (
            <p className={compact ? `mt-6 text-[15px] font-normal leading-6 ${mutedColor}` : "mt-3 text-sm leading-5 opacity-90"}>
              {profile.bio}
            </p>
          )}
          <SocialLinks links={profile.links} className={compact ? "mt-4" : "mt-3"} color={textColor} flush={compact} hideOnMobile={compact ? [] : ["email_url"]} />
          {cards.length > 0 ? (
            <div className={compact ? "mt-10 space-y-5" : "mt-5 space-y-3"}>
              {cards.map((site) => (
                <AnalyticsCard
                  key={`${site.id}-${clicks}-${impressions}-${card}`}
                  anonymous={site.anonymous}
                  name={site.anonymous ? "" : site.name}
                  description={site.anonymous ? "" : site.description}
                  logoUrl={site.anonymous ? "" : site.logoUrl}
                  category={site.anonymous ? "" : site.category}
                  status={site.anonymous ? "" : site.status}
                  chart={site.chart || "area"}
                  clicksColor={clicks}
                  impressionsColor={impressions}
                  cardColor={card}
                  days={site.days}
                  compact={false}
                  mobileCompact={false}
                  phone={compact}
                />
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm leading-5 opacity-70">Your sites will appear here once you add them.</p>
          )}
        </div>
      </div>
    </div>
  );
}
