import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { STATE_COOKIE, googleAuthUrl, isGoogleConfigured } from "@/lib/google";

export async function GET(request) {
  await requireUser();

  if (!isGoogleConfigured()) {
    return NextResponse.redirect(new URL("/sites?google=not_configured", request.url));
  }

  const state = randomBytes(32).toString("hex");
  const response = NextResponse.redirect(googleAuthUrl(request.nextUrl.origin, state));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/google",
    maxAge: 600,
  });
  return response;
}
