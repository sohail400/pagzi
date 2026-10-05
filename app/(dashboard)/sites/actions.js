"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { deleteConnection, getConnection, isAccessRevoked, listProperties, revokeToken } from "@/lib/google";
import { descriptionError, normalizeDescription } from "@/lib/description";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncStaleSites } from "@/lib/traffic";

const MAX_SITES = 10;

function checkedDescription(value) {
  const description = normalizeDescription(value);
  const problem = descriptionError(description);
  return problem ? { error: problem } : { description };
}

async function addSite(userId, property, description) {
  const connection = await getConnection(userId);
  if (!connection) return { error: "Connect Google Search Console first." };

  let properties;
  try {
    properties = await listProperties(connection.refreshToken);
  } catch (error) {
    if (isAccessRevoked(error)) {
      await deleteConnection(userId);
      return { error: "Your Google connection has expired. Please connect again." };
    }
    console.error("Listing Search Console sites failed:", error);
    return { error: "We couldn’t reach Google Search Console. Please try again." };
  }

  const match = properties.find((item) => item.property === property);
  if (!match) return { error: "That site isn’t in your Google Search Console account." };

  const admin = createAdminClient();
  const { count, error: countError } = await admin
    .from("sites")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (countError) throw countError;
  if (count >= MAX_SITES) return { error: `You can show up to ${MAX_SITES} sites.` };

  const { error } = await admin
    .from("sites")
    .upsert(
      { user_id: userId, property: match.property, name: match.name.slice(0, 100), description },
      { onConflict: "user_id,property" }
    );
  if (error) throw error;

  await syncStaleSites(userId).catch((syncError) => console.error("Syncing new site failed:", syncError));
  return { success: true };
}

export async function updateSites(prevState, formData) {
  const { supabase, userId } = await requireUser();
  const intent = formData.get("intent");
  const property = String(formData.get("property") ?? "");

  try {
    if (intent === "add" || intent === "describe") {
      const checked = checkedDescription(formData.get("description"));
      if (checked.error) return checked;
      if (intent === "add") {
        const result = await addSite(userId, property, checked.description);
        if (result.error) return result;
      } else {
        const admin = createAdminClient();
        const { data: site, error } = await admin
          .from("sites")
          .update({ description: checked.description })
          .eq("user_id", userId)
          .eq("property", property)
          .select("id")
          .maybeSingle();
        if (error) throw error;
        if (!site) return { error: "That site isn’t on your page." };
      }
    } else if (intent === "remove") {
      const { error } = await supabase.from("sites").delete().eq("user_id", userId).eq("property", property);
      if (error) throw error;
    } else if (intent === "disconnect") {
      const connection = await getConnection(userId);
      if (connection) await revokeToken(connection.refreshToken).catch(() => {});
      await deleteConnection(userId);
    } else {
      return { error: "Something went wrong. Please refresh the page." };
    }
  } catch (error) {
    console.error("Updating sites failed:", error);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
