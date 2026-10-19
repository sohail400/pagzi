export const APP_DOMAIN = "pagzi.online";

const APP_PATHS = ["/login", "/signup", "/admin", "/sites", "/settings", "/style", "/publish", "/forgot-password", "/reset-password", "/auth"];

export function requestHostname(request) {
  const raw = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  return raw.split(",")[0].trim().toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
}

export function isAppHost(hostname) {
  if (!hostname) return true;
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]") return true;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) return true;
  if (hostname === APP_DOMAIN || hostname.endsWith(`.${APP_DOMAIN}`)) return true;
  if (hostname.endsWith(".vercel.app")) return true;
  return false;
}

export function isAppPath(pathname) {
  return APP_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function dnsName(domain) {
  const labels = String(domain ?? "").split(".").filter(Boolean);
  if (labels.length <= 2) return "@";
  return labels[0];
}
