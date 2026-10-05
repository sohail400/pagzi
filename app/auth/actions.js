"use server";

import { redirect } from "next/navigation";
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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) return { error: friendlyError(error), values };
  if (data.session) redirect("/admin");

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

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}
