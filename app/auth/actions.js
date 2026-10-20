"use server";

import { redirect } from "next/navigation";
import { authOrigin, rememberPlan } from "@/lib/confirm-link";
import { billingPath } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendlyError(error) {
  if (error.status === 0 || error.name === "AuthRetryableFetchError") {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  switch (error.code) {
    case "invalid_credentials":
      return "Incorrect email or password.";
    case "email_not_confirmed":
      return "Please confirm your email address first. Check your inbox for the confirmation link.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts. Please wait a few minutes and try again.";
    default:
      return error.message || "Something went wrong. Please try again.";
  }
}

export async function signup(previousState, formData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = { name, email };

  if (!name || name.length > 80) return { error: "Please enter your name (up to 80 characters).", values };
  if (!EMAIL_PATTERN.test(email)) return { error: "Please enter a valid email address.", values };
  if (password.length < 8) return { error: "Your password must be at least 8 characters.", values };
  if (formData.get("terms") !== "on") return { error: "Please accept the terms and privacy policy.", values };

  const origin = await authOrigin();
  const destination = billingPath(formData.get("plan"));
  await rememberPlan(formData.get("plan"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: `${origin}/auth/confirm` },
  });

  if (error) return { error: friendlyError(error), values };
  if (data.session) redirect(destination);

  return { success: true, email };
}

export async function login(previousState, formData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = { email };

  if (!EMAIL_PATTERN.test(email) || !password) {
    return { error: "Please enter your email and password.", values };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: friendlyError(error), values };

  redirect(billingPath(formData.get("plan")));
}

export async function requestPasswordReset(previousState, formData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) return { error: "Please enter a valid email address.", values: { email } };

  const origin = await authOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm/recovery`,
  });

  if (error) return { error: friendlyError(error), values: { email } };
  return { success: true, email };
}

export async function updatePassword(previousState, formData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) return { error: "Your password must be at least 8 characters." };
  if (password !== confirm) return { error: "Those passwords don't match." };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: friendlyError(error) };

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}
