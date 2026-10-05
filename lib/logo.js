import "server-only";

const HOST = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;
const DAY = 24 * 60 * 60 * 1000;
const cache = new Map();

export function isPublicDomain(domain) {
  return HOST.test(domain) && !/^\d{1,3}(\.\d{1,3}){3}$/.test(domain) && !domain.endsWith(".local");
}

function isSafeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && isPublicDomain(url.hostname);
  } catch {
    return false;
  }
}

async function fetchBytes(url, maxBytes) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(5000),
    headers: { "User-Agent": "indie.site" },
  });
  if (!response.ok || !isSafeUrl(response.url)) return null;
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length || buffer.length > maxBytes) return null;
  const type = (response.headers.get("content-type") ?? "").split(";")[0].trim();
  return { body: buffer, type };
}

function decodeDataUri(uri) {
  const match = /^data:([^,;]+)?(?:;base64)?,(.*)$/s.exec(uri);
  if (!match) return null;
  const type = match[1] || "application/octet-stream";
  const encoded = match[2];
  try {
    const body = uri.includes(";base64,") ? Buffer.from(encoded, "base64") : Buffer.from(decodeURIComponent(encoded));
    return body.length && body.length < 200_000 ? { body, type } : null;
  } catch {
    return null;
  }
}

function linkTags(html) {
  const tags = [];
  const marker = /<link\b/gi;
  let match;
  while ((match = marker.exec(html))) {
    let quote = "";
    let end = match.index + match[0].length;
    for (; end < html.length; end++) {
      const char = html[end];
      if (quote) {
        if (char === quote) quote = "";
      } else if (char === '"' || char === "'") quote = char;
      else if (char === ">") break;
    }
    tags.push(html.slice(match.index, end + 1));
  }
  return tags;
}

function bestIcon(html, pageUrl) {
  const icons = [];
  for (const tag of linkTags(html)) {
    const rel = /rel=["']([^"']+)["']/i.exec(tag)?.[1] ?? "";
    if (!/\bicon\b/i.test(rel)) continue;
    const href = /href=["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href || href.startsWith("javascript:")) continue;
    const size = Number(/sizes=["'](\d+)/i.exec(tag)?.[1] ?? (/apple/i.test(rel) ? 180 : 0));
    icons.push({ href, size });
  }
  icons.sort((a, b) => b.size - a.size);
  const icon = icons[0];
  if (!icon) return null;
  if (icon.href.startsWith("data:")) return icon.href;
  try {
    return new URL(icon.href, pageUrl).href;
  } catch {
    return null;
  }
}

async function fetchLogo(domain) {
  const page = await fetchBytes(`https://${domain}/`, 500_000).catch(() => null);
  const html = page?.type.includes("html") ? page.body.toString("utf8") : "";
  const icon = html ? bestIcon(html, `https://${domain}/`) : null;

  if (icon?.startsWith("data:")) return decodeDataUri(icon);
  if (icon && isSafeUrl(icon)) {
    const image = await fetchBytes(icon, 200_000).catch(() => null);
    if (image?.type.startsWith("image/")) return image;
  }

  const fallback = await fetchBytes(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`, 100_000).catch(() => null);
  return fallback?.type.startsWith("image/") ? fallback : null;
}

export async function loadLogo(domain) {
  const hit = cache.get(domain);
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = await fetchLogo(domain);
  cache.set(domain, { value, expires: Date.now() + (value ? DAY : 10 * 60 * 1000) });
  return value;
}
