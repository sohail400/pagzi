const BUILDER_USERNAMES = new Set(["sohail"]);

export function isBuilderAccount(username) {
  return BUILDER_USERNAMES.has(String(username || "").trim().toLowerCase());
}

export function hasFullAccess(profile) {
  if (isBuilderAccount(profile?.username)) return true;
  if (!profile?.paid_at) return false;
  if (profile.plan !== "year") return true;
  const expires = Date.parse(profile.plan_expires_at || "");
  return Number.isFinite(expires) && expires > Date.now();
}

const ACCESS_COLUMNS = ["username", "paid_at", "plan", "plan_expires_at"];

export async function selectAccess(supabase, userId) {
  let list = [...ACCESS_COLUMNS];
  for (let attempt = 0; attempt < ACCESS_COLUMNS.length; attempt += 1) {
    const result = await supabase.from("profiles").select(list.join(", ")).eq("id", userId).maybeSingle();
    if (!result.error) return result;
    const detail = `${result.error.message ?? ""} ${result.error.details ?? ""} ${result.error.hint ?? ""}`;
    const optional = ["plan_expires_at", "plan"];
    const missing = list.find((column) => detail.includes(column))
      || (!result.error.message ? list.find((column) => optional.includes(column)) : "");
    if (!missing) return result;
    list = list.filter((column) => column !== missing);
  }
  return { data: null, error: { message: "Could not load access." } };
}
