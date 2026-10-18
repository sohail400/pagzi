export const CHART_PRESETS = [
  { id: "classic", name: "Classic Blue & Orange", clicks: "#2563EB", impressions: "#F97316" },
  { id: "slate", name: "Slate & Cyan", clicks: "#334155", impressions: "#06B6D4" },
  { id: "forest", name: "Forest & Gray", clicks: "#059669", impressions: "#64748B" },
  { id: "lime", name: "Midnight & Lime", clicks: "#111827", impressions: "#A3E635" },
  { id: "purple", name: "Black & Purple", clicks: "#000000", impressions: "#8B5CF6" },
  { id: "gold", name: "Midnight & Gold", clicks: "#1E293B", impressions: "#F59E0B" },
  { id: "mono", name: "Black & White", clicks: "#000000", impressions: "#FFFFFF" },
];

export const FONTS = [
  { id: "inter", label: "Inter", family: "var(--font-inter), sans-serif" },
  { id: "outfit", label: "Outfit", family: "var(--font-outfit), sans-serif" },
  { id: "space", label: "Space Grotesk", family: "var(--font-space), sans-serif" },
  { id: "dm", label: "DM Sans", family: "var(--font-dm-sans), sans-serif" },
  { id: "poppins", label: "Poppins", family: "var(--font-poppins), sans-serif" },
  { id: "nunito", label: "Nunito", family: "var(--font-nunito), sans-serif" },
  { id: "fraunces", label: "Fraunces", family: "var(--font-fraunces), serif" },
  { id: "playfair", label: "Playfair Display", family: "var(--font-playfair), serif" },
  { id: "lora", label: "Lora", family: "var(--font-lora), serif" },
  { id: "newsreader", label: "Newsreader", family: "var(--font-newsreader), serif" },
  { id: "plex", label: "IBM Plex Mono", family: "var(--font-plex), monospace" },
  { id: "caveat", label: "Caveat", family: "var(--font-caveat), cursive" },
];

export const PAGE_SWATCHES = ["#1F1F1F", "#FFFFFF", "#F5F5F4", "#ECFDF5", "#EFF6FF", "#111827"];
export const CARD_SWATCHES = ["#FFFFFF", "#FAFAF9", "#FFF7ED", "#F8FAFC", "#1C1917", "#111827"];

export const THEMES = [
  { id: "pink", page: "#F3F4F6", text: "#1C1917", share: "#FF4FA3" },
  { id: "violet", page: "#F4F4F5", text: "#18181B", share: "#7C3AED" },
  { id: "blue", page: "#F8FAFC", text: "#0F172A", share: "#2563EB" },
  { id: "green", page: "#F4F4F5", text: "#14532D", share: "#10B981" },
  { id: "rose", page: "#FFF1F2", text: "#4C0519", share: "#F43F5E" },
  { id: "sky", page: "#F0F9FF", text: "#0C4A6E", share: "#0EA5E9" },
  { id: "indigo", page: "#EEF2FF", text: "#1E1B4B", share: "#4F46E5" },
  { id: "orange", page: "#FFF7ED", text: "#431407", share: "#F97316" },
  { id: "gold", page: "#FFFBEB", text: "#1C1917", share: "#D97706" },
  { id: "sand", page: "#F5F0E8", text: "#292524", share: "#B45309" },
  { id: "white", page: "#FFFFFF", text: "#18181B", share: "#18181B" },
  { id: "ink", page: "#1F1F1F", text: "#F5F5F4", share: "#E7E5E4" },
  { id: "night", page: "#111827", text: "#F9FAFB", share: "#F9FAFB" },
  { id: "navy", page: "#0F172A", text: "#E2E8F0", share: "#38BDF8" },
  { id: "forest", page: "#052E16", text: "#ECFDF5", share: "#4ADE80" },
  { id: "plum", page: "#1E1B4B", text: "#F5F3FF", share: "#C4B5FD" },
  { id: "wine", page: "#1C1917", text: "#FFF1F2", share: "#FB7185" },
  { id: "ember", page: "#1C1917", text: "#FFFBEB", share: "#F59E0B" },
  { id: "slate", page: "#E5E7EB", text: "#111827", share: "#6366F1" },
  { id: "cyan", page: "#ECFEFF", text: "#164E63", share: "#06B6D4" },
  { id: "red", page: "#FEF2F2", text: "#450A0A", share: "#DC2626" },
  { id: "yellow", page: "#FEFCE8", text: "#1C1917", share: "#CA8A04" },
  { id: "mint", page: "#ECFDF5", text: "#064E3B", share: "#059669" },
  { id: "charcoal", page: "#27272A", text: "#FAFAFA", share: "#A1A1AA" },
];

export const STYLE_DEFAULTS = {
  chartClicks: "#2563EB",
  chartImpressions: "#F97316",
  font: "inter",
  card: "#FFFFFF",
  page: "#1F1F1F",
  text: "#F5F5F4",
  share: "#E7E5E4",
};

export function normalizeHex(value) {
  const hex = String(value ?? "").trim();
  const withHash = hex.startsWith("#") ? hex : `#${hex}`;
  return /^#[0-9A-Fa-f]{6}$/.test(withHash) ? withHash.toUpperCase() : null;
}

export function sameHex(a, b) {
  return normalizeHex(a) === normalizeHex(b);
}

export function presetFor(clicks, impressions) {
  return CHART_PRESETS.find((preset) => sameHex(preset.clicks, clicks) && sameHex(preset.impressions, impressions)) ?? null;
}

export function fontOf(id) {
  return FONTS.find((font) => font.id === id) ?? FONTS[0];
}

export function themeOf(page, text, share) {
  return (
    THEMES.find((theme) => sameHex(theme.page, page) && sameHex(theme.text, text) && sameHex(theme.share, share)) ?? null
  );
}

export function isDarkHex(value) {
  const hex = normalizeHex(value);
  if (!hex) return false;
  const number = parseInt(hex.slice(1), 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;
  return (red * 299 + green * 587 + blue * 114) / 1000 < 150;
}

const PREVIEW_END = new Date("2026-10-10T00:00:00Z");

export const PREVIEW_DAYS = Array.from({ length: 28 }, (_, index) => {
  const date = new Date(PREVIEW_END);
  date.setUTCDate(PREVIEW_END.getUTCDate() - (27 - index));
  return {
    date: date.toISOString().slice(0, 10),
    clicks: Math.round(55 + Math.sin(index / 2.4) * 28 + index * 0.6),
    impressions: Math.round(900 + Math.cos(index / 3) * 240 + index * 16),
  };
});
