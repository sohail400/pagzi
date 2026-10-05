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
];

export function initials(name, email = "") {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length) return words.slice(0, 2).map((word) => word[0].toUpperCase()).join("");
  return email.slice(0, 1).toUpperCase() || "?";
}

export function socialLinksOf(profile) {
  return SOCIAL_LINKS.filter((link) => profile[link.key]).map((link) => ({
    label: link.label,
    url: profile[link.key],
  }));
}
