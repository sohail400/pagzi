"use server";

import { cookies } from "next/headers";
import { requireFullAccess } from "@/lib/payments";
import { STYLE_SAVED_COOKIE } from "@/lib/profile";
import { refreshOwnerPages } from "@/lib/refresh";
import { FONTS, normalizeHex } from "@/lib/style";

export async function updateStyle(previousState, formData) {
  const { supabase, userId } = await requireFullAccess();
  const chartClicks = normalizeHex(formData.get("chartClicks"));
  const chartImpressions = normalizeHex(formData.get("impressions"));
  const card = normalizeHex(formData.get("card"));
  const page = normalizeHex(formData.get("page"));
  const text = normalizeHex(formData.get("text"));
  const share = normalizeHex(formData.get("share"));
  const font = String(formData.get("font") ?? "");

  if (!chartClicks || !chartImpressions) return { error: "Pick a clicks color and an impressions color." };
  if (!card || !page || !text || !share) return { error: "Pick a theme and a card color." };
  if (!FONTS.some((item) => item.id === font)) return { error: "Pick a font from the list." };

  const { data: saved, error } = await supabase
    .from("profiles")
    .update({
      chart_clicks: chartClicks,
      chart_impressions: chartImpressions,
      font_style: font,
      card_color: card,
      page_color: page,
      text_color: text,
      share_color: share,
    })
    .eq("id", userId)
    .select("username, published_at")
    .maybeSingle();

  if (error) {
    console.error("Saving page style failed:", error);
    if (error.code === "PGRST204") {
      return { error: "Themes need a database update. Run the latest SQL in Supabase, then save again." };
    }
    return { error: "We couldn't save your style. Please try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set(STYLE_SAVED_COOKIE, "1", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  refreshOwnerPages(saved?.username);
  return { success: true, live: Boolean(saved?.published_at) };
}
