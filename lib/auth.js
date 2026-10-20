import { cache } from "react";
import { redirect } from "next/navigation";
import { PROFILE_COLUMNS, selectProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

const OWNER_COLUMNS = `${PROFILE_COLUMNS}, paid_at, plan, plan_expires_at, dodo_customer_id`;

export const requireUser = cache(async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) redirect("/login");

  return { supabase, userId: claims.sub, email: claims.email ?? "" };
});

// One profile read shared by the dashboard layout and the page inside it.
export const loadOwner = cache(async function loadOwner() {
  const session = await requireUser();
  const result = await selectProfile(session.supabase, session.userId, OWNER_COLUMNS);
  if (result.error) console.error("Loading account failed:", result.error);
  return { ...session, profile: result.data, profileError: result.error };
});
