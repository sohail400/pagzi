export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9_-]{2,29}$/;

export const LIMITS = { name: 80, bio: 300, location: 80, url: 200 };

export const SOCIAL_LINKS = [
  { key: "x_url", label: "X", hosts: ["x.com", "twitter.com"], placeholder: "https://x.com/username" },
  {
    key: "linkedin_url",
    label: "LinkedIn",
    hosts: ["linkedin.com"],
    placeholder: "https://linkedin.com/in/username",
  },
  {
    key: "instagram_url",
    label: "Instagram",
    hosts: ["instagram.com"],
    placeholder: "https://instagram.com/username",
  },
  {
    key: "youtube_url",
    label: "YouTube",
    hosts: ["youtube.com", "youtu.be"],
    placeholder: "https://youtube.com/@channel",
  },
  { key: "github_url", label: "GitHub", hosts: ["github.com"], placeholder: "https://github.com/username" },
  { key: "email_url", label: "Email", kind: "email", placeholder: "you@example.com" },
];

export const PROFILE_COLUMNS = [
  "username",
  "name",
  "bio",
  "location",
  "avatar_url",
  "chart_clicks",
  "chart_impressions",
  "font_style",
  "card_color",
  "page_color",
  "text_color",
  "share_color",
  "custom_domain",
  "published_at",
  ...SOCIAL_LINKS.map((link) => link.key),
].join(", ");

export const STYLE_SAVED_COOKIE = "pagzi_style_saved";

export function isPublished(profile) {
  if (!profile) return false;
  if (!Object.prototype.hasOwnProperty.call(profile, "published_at")) return Boolean(profile.username);
  return Boolean(profile.published_at);
}

export function profileDetailsReady(profile) {
  const username = String(profile?.username ?? "").trim().toLowerCase();
  return USERNAME_PATTERN.test(username) && Boolean(String(profile?.name ?? "").trim() && String(profile?.bio ?? "").trim() && String(profile?.location ?? "").trim());
}

export async function selectProfile(supabase, userId, columns) {
  let list = columns.split(",").map((column) => column.trim()).filter(Boolean);
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const result = await supabase.from("profiles").select(list.join(", ")).eq("id", userId).maybeSingle();
    if (!result.error) return result;
    const detail = `${result.error.message ?? ""} ${result.error.details ?? ""} ${result.error.hint ?? ""}`;
    const optional = ["dodo_customer_id", "plan_expires_at", "plan"];
    const missing = list.find((column) => detail.includes(column))
      || (!result.error.message ? list.find((column) => optional.includes(column)) : "");
    if (!missing) return result;
    list = list.filter((column) => column !== missing);
  }
  return { data: null, error: { message: "Could not load profile." } };
}

export async function fetchProfile(supabase, userId) {
  return selectProfile(supabase, userId, PROFILE_COLUMNS);
}

export function initials(name, email = "") {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length) return words.slice(0, 2).map((word) => word[0].toUpperCase()).join("");
  return email.slice(0, 1).toUpperCase() || "?";
}

export function socialLinksOf(profile) {
  return SOCIAL_LINKS.filter((link) => profile[link.key]).map((link) => ({
    key: link.key,
    label: link.label,
    url: profile[link.key],
  }));
}
