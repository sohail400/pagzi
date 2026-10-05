import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const PROTECTED_PATHS = ["/admin", "/settings"];
const AUTH_PATHS = ["/login", "/signup"];
const CACHE_HEADERS = ["cache-control", "expires", "pragma"];

function matches(pathname, paths) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function redirectTo(pathname, request, supabaseResponse) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const response = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  CACHE_HEADERS.forEach((header) => {
    const value = supabaseResponse.headers.get(header);
    if (value) response.headers.set(header, value);
  });
  return response;
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

  if (!isSignedIn && matches(pathname, PROTECTED_PATHS)) {
    return redirectTo("/login", request, supabaseResponse);
  }
  if (isSignedIn && matches(pathname, AUTH_PATHS)) {
    return redirectTo("/admin", request, supabaseResponse);
  }

  return supabaseResponse;
}
