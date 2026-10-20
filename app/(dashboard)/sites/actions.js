"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { requireFullAccess } from "@/lib/payments";
import { deleteConnection, getConnection, isAccessRevoked, listProperties, revokeToken } from "@/lib/google";
import { descriptionError, normalizeDescription } from "@/lib/description";
import { CATEGORY_VALUES, CHART_VALUES, STATUS_VALUES } from "@/lib/site-fields";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncStaleSites } from "@/lib/traffic";

const MAX_SITES = 10;
const LOGO_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const LOGO_MARKER = "/storage/v1/object/public/site-logos/";

function checkedDescription(value) {
  const description = normalizeDescription(value);
  const problem = descriptionError(description);
  return problem ? { error: problem } : { description };
}

function logoPathFromUrl(url, userId) {
  const path = String(url ?? "").split(LOGO_MARKER)[1]?.split("?")[0];
  return path?.startsWith(`${userId}/`) ? path : null;
}

function checkedChoice(value, allowed, label) {
  const choice = String(value ?? "").trim();
  if (!choice) return { value: "" };
  if (!allowed.includes(choice)) return { error: `Pick a ${label} from the list.` };
  return { value: choice };
}

async function storeLogo(admin, userId, siteId, file) {
  if (!file || typeof file !== "object" || file.size === 0) return {};
  const extension = LOGO_TYPES[file.type];
  if (!extension) return { error: "The logo must be a JPG, PNG or WebP image." };
  if (file.size > MAX_LOGO_BYTES) return { error: "The logo must be smaller than 2 MB." };

  const path = `${userId}/${siteId}.${extension}`;
  const { error } = await admin.storage.from("site-logos").upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) {
    console.error("Uploading a site logo failed:", error);
    return { error: "We couldn't upload that logo. Please try again." };
  }
  const publicUrl = admin.storage.from("site-logos").getPublicUrl(path).data.publicUrl;
  return { logoUrl: `${publicUrl}?v=${Date.now()}` };
}

async function addSite(userId, property, fields) {
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

  const { data: site, error } = await admin
    .from("sites")
    .upsert(
      { user_id: userId, property: match.property, name: match.name.slice(0, 100), ...fields },
      { onConflict: "user_id,property" }
    )
    .select("id")
    .single();
  if (error) throw error;

  after(() => {
    syncStaleSites(userId).catch((syncError) => console.error("Syncing new site failed:", syncError));
  });
  return { siteId: site.id };
}

export async function updateSites(prevState, formData) {
  const { supabase, userId } = await requireFullAccess();
  const intent = formData.get("intent");
  const property = String(formData.get("property") ?? "");

  try {
    if (intent === "add" || intent === "save") {
      const checked = checkedDescription(formData.get("description"));
      if (checked.error) return checked;
      const category = checkedChoice(formData.get("category"), CATEGORY_VALUES, "category");
      if (category.error) return category;
      const status = checkedChoice(formData.get("status"), STATUS_VALUES, "status");
      if (status.error) return status;
      const chart = checkedChoice(formData.get("chart") || "area", CHART_VALUES, "chart");
      if (chart.error) return chart;
      const fields = {
        description: checked.description,
        category: category.value,
        status: status.value,
        chart: chart.value || "area",
        anonymous: formData.get("anonymous") === "on",
        show_status: Boolean(status.value),
      };
      const admin = createAdminClient();
      let siteId;
      if (intent === "add") {
        const result = await addSite(userId, property, fields);
        if (result.error) return result;
        siteId = result.siteId;
      } else {
        const { data: site, error } = await admin
          .from("sites")
          .update(fields)
          .eq("user_id", userId)
          .eq("property", property)
          .select("id")
          .maybeSingle();
        if (error) throw error;
        if (!site) return { error: "That site isn’t on your page." };
        siteId = site.id;
      }

      const stored = await storeLogo(admin, userId, siteId, formData.get("logo"));
      if (stored.error) return stored;
      if (stored.logoUrl) {
        const { error } = await admin.from("sites").update({ logo_url: stored.logoUrl }).eq("id", siteId);
        if (error) throw error;
      }
    } else if (intent === "remove") {
      const admin = createAdminClient();
      const { data: site, error: lookupError } = await admin
        .from("sites")
        .select("id, logo_url")
        .eq("user_id", userId)
        .eq("property", property)
        .maybeSingle();
      if (lookupError) throw lookupError;
      const { error } = await supabase.from("sites").delete().eq("user_id", userId).eq("property", property);
      if (error) throw error;
      const path = site && logoPathFromUrl(site.logo_url, userId);
      if (path) await admin.storage.from("site-logos").remove([path]);
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

  revalidatePath("/sites");
  revalidatePath("/style");
  const { data: profile } = await supabase.from("profiles").select("username, published_at").eq("id", userId).maybeSingle();
  if (profile?.username) revalidatePath(`/${profile.username}`);
  const changed = intent === "add" || intent === "save" || intent === "remove";
  return { success: true, live: changed && Boolean(profile?.published_at) };
}
