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

async function afterSignIn() {
  const cookieStore = await cookies();
  const plan = cookieStore.get(PLAN_COOKIE)?.value;
  cookieStore.delete(PLAN_COOKIE);
  redirect(isPlanId(plan) ? `/settings?plan=${plan}` : "/admin");
}

function providerPhoto(user) {
  const url = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";
  return typeof url === "string" && url.startsWith("https://") && url.length <= 1000 ? url : "";
}

export async function finishOAuth(request) {
  const code = new URL(request.url).searchParams.get("code");
  if (!code) redirect("/login?error=google_failed");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data?.user) redirect("/login?error=google_failed");

  const photo = providerPhoto(data.user);
  if (photo) {
    const { error: photoError } = await supabase
      .from("profiles")
      .update({ avatar_url: photo })
      .eq("id", data.user.id)
      .is("avatar_url", null);
    if (photoError) console.error("Saving the Google photo failed:", photoError);
  }

  await afterSignIn();
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
      await afterSignIn();
    }
    redirect("/login?error=confirm_failed");
  }

  redirect("/login?error=invalid_link");
}
