import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { hasFullAccess, selectAccess } from "@/lib/access";
import { isPlanId } from "@/lib/plans";
import { APP_DOMAIN, isAppHost, isAppPath, requestHostname } from "@/lib/custom-domain";

const PROTECTED_PATHS = ["/admin", "/sites", "/settings", "/style", "/publish"];
const PAID_PATHS = ["/admin", "/sites", "/style", "/publish"];
const AUTH_PATHS = ["/login", "/signup"];
const CACHE_HEADERS = ["cache-control", "expires", "pragma"];

function matches(pathname, paths) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function withSession(response, supabaseResponse) {
  supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  CACHE_HEADERS.forEach((header) => {
    const value = supabaseResponse.headers.get(header);
    if (value) response.headers.set(header, value);
  });
  return response;
}

function redirectTo(pathname, request, supabaseResponse, search = "") {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search;
  return withSession(NextResponse.redirect(url), supabaseResponse);
}

async function customDomainResponse(request, supabase, supabaseResponse) {
  const hostname = requestHostname(request);
  if (isAppHost(hostname)) return null;

  const { pathname } = request.nextUrl;
  if (isAppPath(pathname)) {
    const url = new URL(pathname + request.nextUrl.search, `https://${APP_DOMAIN}`);
    return withSession(NextResponse.redirect(url), supabaseResponse);
  }
  if (pathname !== "/") return null;

  const { data, error } = await supabase.from("profiles").select("username").eq("custom_domain", hostname).maybeSingle();
  if (error || !data?.username) {
    return withSession(
      new NextResponse("This domain is not connected to a page.", { status: 404 }),
      supabaseResponse,
    );
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${data.username}`;
  return withSession(NextResponse.rewrite(url), supabaseResponse);
}

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return supabaseResponse;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([header, value]) => supabaseResponse.headers.set(header, value));
      },
    },
  });

  // Nothing may run between creating the client and getClaims(), or sessions can be lost.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims);
  const { pathname } = request.nextUrl;

  const customResponse = await customDomainResponse(request, supabase, supabaseResponse);
  if (customResponse) return customResponse;

  if (!isSignedIn && matches(pathname, PROTECTED_PATHS)) {
    return redirectTo("/login", request, supabaseResponse);
  }
  if (isSignedIn && matches(pathname, PAID_PATHS)) {
    const profile = await selectAccess(supabase, data.claims.sub);
    if (profile.error || !hasFullAccess(profile.data)) {
      return redirectTo("/settings", request, supabaseResponse, "checkout=required");
    }
  }
  if (isSignedIn && matches(pathname, AUTH_PATHS)) {
    const plan = request.nextUrl.searchParams.get("plan");
    if (isPlanId(plan)) return redirectTo("/settings", request, supabaseResponse, `plan=${plan}`);
    return redirectTo("/admin", request, supabaseResponse);
  }

  return supabaseResponse;
}
