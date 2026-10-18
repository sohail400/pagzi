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
        <div className={`relative pb-5 pt-12 ${compact ? "px-3" : "px-4"}`}>
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
          {profile.bio && <p className="mt-3 text-sm leading-5 opacity-90">{profile.bio}</p>}
          <SocialLinks links={profile.links} className="mt-3" color={textColor} hideOnMobile={["email_url"]} />
          {cards.length > 0 ? (
            <div className={compact ? "mt-1.5 space-y-2.5 md:mt-4" : "mt-5 space-y-3"}>
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
                  compact={compact}
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
