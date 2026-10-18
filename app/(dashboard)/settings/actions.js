"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasFullAccess } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { getConnection, revokeToken } from "@/lib/google";
import { USERNAME_PATTERN } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateUsername(previousState, formData) {
  const { supabase, userId } = await requireUser();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();

  if (!USERNAME_PATTERN.test(username)) {
    return { error: "Usernames need 3–30 characters: lowercase letters, numbers, - or _ (starting with a letter or number)." };
  }

  const { error } = await supabase.from("profiles").update({ username }).eq("id", userId);
  if (error) {
    if (error.code === "23505") return { error: "That username is already taken. Please choose another one." };
    if (error.code === "23514") return { error: "That username isn't available. Please choose another one." };
    return { error: "We couldn't update your username. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true, username };
}

function checkedDomain(value) {
  const host = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "");

  if (!host) return { domain: null };
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(host)) {
    return { error: "Enter a domain like example.com." };
  }
  if (host === "pagzi.online" || host.endsWith(".pagzi.online")) {
    return { error: "Use a domain you own. pagzi.online is already your page address." };
  }
  return { domain: host };
}

export async function updateCustomDomain(previousState, formData) {
  const { supabase, userId } = await requireUser();
  const profile = await supabase.from("profiles").select("username, paid_at").eq("id", userId).maybeSingle();
  if (profile.error || !hasFullAccess(profile.data)) {
    return { error: "Pay $9 to connect a custom domain." };
  }
  const checked = checkedDomain(formData.get("domain"));
  if (checked.error) return checked;

  const { error } = await supabase.from("profiles").update({ custom_domain: checked.domain }).eq("id", userId);
  if (error) {
    if (error.code === "23505") return { error: "That domain is already used on another page." };
    if (error.code === "23514") return { error: "Enter a domain like example.com." };
    if (error.code === "PGRST204") {
      return { error: "Custom domains are not ready yet. Run the latest database update, then try again." };
    }
    return { error: "We couldn't save that domain. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true, domain: checked.domain ?? "" };
}

async function removeOwnedFiles(admin, bucket, userId) {
  const { data, error } = await admin.storage.from(bucket).list(userId, { limit: 100 });
  if (error) {
    console.error(`Listing ${bucket} files before account deletion failed:`, error);
    return;
  }
  const paths = (data ?? []).filter((file) => file.name && file.id).map((file) => `${userId}/${file.name}`);
  if (!paths.length) return;
  const { error: removeError } = await admin.storage.from(bucket).remove(paths);
  if (removeError) console.error(`Removing ${bucket} files failed:`, removeError);
}

export async function deleteAccount() {
  const { supabase, userId } = await requireUser();
  const admin = createAdminClient();

  try {
    const connection = await getConnection(userId);
    if (connection?.refreshToken) {
      await revokeToken(connection.refreshToken).catch((error) => {
        console.error("Revoking Google access during account deletion failed:", error);
      });
    }
  } catch (error) {
    console.error("Reading the Google connection during account deletion failed:", error);
  }

  await removeOwnedFiles(admin, "avatars", userId);
  await removeOwnedFiles(admin, "site-logos", userId);

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    console.error("Deleting the account failed:", error);
    return { error: "We couldn't delete your account. Please try again." };
  }

  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}
