import { hasFullAccess } from "@/lib/access";
import { isPublished, USERNAME_PATTERN } from "@/lib/profile";
import { createPublicClient } from "@/lib/supabase/public";

const ORIGIN = "https://pagzi.online";

const PAGES = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.4 },
  { path: "/support", changeFrequency: "monthly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/refund", changeFrequency: "yearly", priority: 0.2 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.2 },
];

const RESERVED = new Set(PAGES.map((page) => page.path.slice(1)).filter(Boolean));

async function publicProfiles() {
  try {
    const supabase = createPublicClient();
    let columns = ["username", "published_at", "paid_at", "plan", "plan_expires_at", "updated_at"];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const result = await supabase.from("profiles").select(columns.join(", "));
      if (!result.error) return result.data || [];
      const detail = `${result.error.message ?? ""} ${result.error.details ?? ""} ${result.error.hint ?? ""}`;
      const missing = columns.find((column) => detail.includes(column));
      if (!missing) {
        console.error("Sitemap profile query failed:", result.error.message);
        return [];
      }
      columns = columns.filter((column) => column !== missing);
    }
  } catch (error) {
    console.error("Sitemap profiles failed:", error);
  }
  return [];
}

export default async function sitemap() {
  const now = new Date();
  const pages = PAGES.map((page) => ({
    url: `${ORIGIN}${page.path === "/" ? "" : page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
  const profiles = await publicProfiles();
  const people = profiles
    .filter((profile) => {
      const username = String(profile.username || "").toLowerCase();
      return USERNAME_PATTERN.test(username) && !RESERVED.has(username) && isPublished(profile) && hasFullAccess(profile);
    })
    .map((profile) => ({
      url: `${ORIGIN}/${profile.username}`,
      lastModified: profile.updated_at ? new Date(profile.updated_at) : now,
      changeFrequency: "daily",
      priority: 0.8,
    }));

  return [...pages, ...people];
}
