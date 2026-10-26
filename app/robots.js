const ORIGIN = "https://pagzi.online";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/sites", "/settings", "/style", "/publish", "/launch-reel", "/auth"],
    },
    sitemap: `${ORIGIN}/sitemap.xml`,
  };
}
