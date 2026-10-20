import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isPlanId } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export const PLAN_COOKIE = "pagzi_plan";

export async function authOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  if (origin && /^https?:\/\//.test(origin)) return origin.replace(/\/$/, "");
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  if (!host) return "https://pagzi.online";
  const proto = headerStore.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

export async function rememberPlan(plan) {
  const cookieStore = await cookies();
  if (!isPlanId(plan)) {
    cookieStore.delete(PLAN_COOKIE);
    return;
  }
  cookieStore.set(PLAN_COOKIE, plan, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });
}

export async function confirmFromEmail(request, { recovery = false } = {}) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (code || (tokenHash && type)) {
    const supabase = await createClient();
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) {
      if (recovery || type === "recovery") redirect("/reset-password");
      const cookieStore = await cookies();
      const plan = cookieStore.get(PLAN_COOKIE)?.value;
      cookieStore.delete(PLAN_COOKIE);
      redirect(isPlanId(plan) ? `/settings?plan=${plan}` : "/admin");
    }
    redirect("/login?error=confirm_failed");
  }

  redirect("/login?error=invalid_link");
}
