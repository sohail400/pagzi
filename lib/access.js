const BUILDER_USERNAMES = new Set(["sohail"]);

export function isBuilderAccount(username) {
  return BUILDER_USERNAMES.has(String(username || "").trim().toLowerCase());
}

export function hasFullAccess(profile) {
  return isBuilderAccount(profile?.username) || Boolean(profile?.paid_at);
}
