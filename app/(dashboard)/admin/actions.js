"use server";

import { refreshOwnerPages } from "@/lib/refresh";
import { requireFullAccess } from "@/lib/payments";
import { LIMITS, SOCIAL_LINKS, USERNAME_PATTERN, fetchProfile } from "@/lib/profile";

const AVATAR_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_PATH_MARKER = "/storage/v1/object/public/avatars/";

function normalizeEmail(raw) {
  const value = raw.trim().replace(/^mailto:/i, "");
  if (!value) return { url: null };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { invalid: true };
  const url = `mailto:${value}`;
  return url.length > LIMITS.url ? { invalid: true } : { url };
}

function normalizeSocialUrl(raw, hosts) {
  const value = raw.trim();
  if (!value) return { url: null };

  let parsed;
  try {
    parsed = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return { invalid: true };
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (!hosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) return { invalid: true };

  parsed.protocol = "https:";
  const url = parsed.toString();
  return url.length > LIMITS.url ? { invalid: true } : { url };
}

function avatarPathFromUrl(url, userId) {
  const path = url?.split(AVATAR_PATH_MARKER)[1];
  return path?.startsWith(`${userId}/`) ? path : null;
}

function databaseError(error) {
  if (error.code === "23505") return "That username is already taken. Please choose another one.";
  if (error.code === "23514" && error.message.includes("username_not_reserved")) {
    return "That username isn't available. Please choose another one.";
  }
  return "We couldn't save your changes. Please check your details and try again.";
}

export async function updateProfile(previousState, formData) {
  const { supabase, userId } = await requireFullAccess();

  const text = (key) => String(formData.get(key) ?? "").trim();
  const username = text("username").toLowerCase();
  const name = text("name");
  const bio = text("bio");
  const location = text("location");

  if (!USERNAME_PATTERN.test(username)) {
    return { error: "Usernames need 3–30 characters: lowercase letters, numbers, - or _ (starting with a letter or number)." };
  }
  if (name.length > LIMITS.name) return { error: `Your name can be up to ${LIMITS.name} characters.` };
  if (bio.length > LIMITS.bio) return { error: `Your bio can be up to ${LIMITS.bio} characters.` };
  if (location.length > LIMITS.location) return { error: `Your location can be up to ${LIMITS.location} characters.` };

  const updates = { username, name, bio, location };
  for (const link of SOCIAL_LINKS) {
    const { url, invalid } =
      link.kind === "email" ? normalizeEmail(text(link.key)) : normalizeSocialUrl(text(link.key), link.hosts);
    if (invalid) return { error: `Please enter a valid ${link.label} ${link.kind === "email" ? "address" : "profile link"}, for example ${link.placeholder}.` };
    updates[link.key] = url;
  }

  const avatar = formData.get("avatar");
  const hasNewAvatar = avatar && typeof avatar === "object" && avatar.size > 0;
  if (hasNewAvatar && !AVATAR_TYPES[avatar.type]) return { error: "Your photo must be a JPG, PNG or WebP image." };
  if (hasNewAvatar && avatar.size > MAX_AVATAR_BYTES) return { error: "Your photo must be smaller than 2 MB." };

  const { data: current } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .maybeSingle();

  let newAvatarPath = null;
  if (hasNewAvatar) {
    newAvatarPath = `${userId}/${Date.now()}.${AVATAR_TYPES[avatar.type]}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(newAvatarPath, avatar, { contentType: avatar.type, cacheControl: "31536000" });
    if (uploadError) return { error: "We couldn't upload your photo. Please try again." };
    updates.avatar_url = supabase.storage.from("avatars").getPublicUrl(newAvatarPath).data.publicUrl;
  }

  const { error: updateError } = await supabase.from("profiles").update(updates).eq("id", userId);
  if (updateError) {
    if (newAvatarPath) await supabase.storage.from("avatars").remove([newAvatarPath]);
    return { error: databaseError(updateError) };
  }

  const { data: saved, error } = await fetchProfile(supabase, userId);

  if (error || !saved) {
    if (newAvatarPath) await supabase.storage.from("avatars").remove([newAvatarPath]);
    return { error: error ? databaseError(error) : "We couldn't find your profile. Please refresh the page." };
  }

  const oldAvatarPath = newAvatarPath && avatarPathFromUrl(current?.avatar_url, userId);
  if (oldAvatarPath) await supabase.storage.from("avatars").remove([oldAvatarPath]);

  refreshOwnerPages(saved.username);
  return { success: true, profile: saved, live: Boolean(saved.published_at) };
}
