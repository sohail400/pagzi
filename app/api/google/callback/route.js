import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { STATE_COOKIE, exchangeCode, revokeToken, saveConnection } from "@/lib/google";

function sameState(a, b) {
  return Boolean(a && b) && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function GET(request) {
  const { userId } = await requireUser();
  const params = request.nextUrl.searchParams;

  const finish = (status) => {
    const response = NextResponse.redirect(new URL(`/sites?google=${status}`, request.url));
    response.cookies.set(STATE_COOKIE, "", { path: "/api/google", maxAge: 0 });
    return response;
  };

  if (params.get("error")) return finish("cancelled");

  const code = params.get("code");
  if (!code || !sameState(params.get("state"), request.cookies.get(STATE_COOKIE)?.value)) {
    return finish("expired");
  }

  try {
    const { email, refreshToken, hasSearchConsoleAccess } = await exchangeCode(request.nextUrl.origin, code);

    if (!hasSearchConsoleAccess) {
      if (refreshToken) await revokeToken(refreshToken).catch(() => {});
      return finish("missing_permission");
    }
    if (!refreshToken) return finish("failed");

    await saveConnection(userId, { email, refreshToken });
  } catch (error) {
    console.error("Google Search Console connection failed:", error);
    return finish("failed");
  }

  return finish("connected");
}
