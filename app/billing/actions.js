"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { earlySpotCount, isBuilderAccount } from "@/lib/payments";

function dodoConfig() {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY || "";
  const productId = process.env.DODO_PAYMENTS_PRODUCT_ID || "";
  const environment = process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode";
  const base = environment === "live_mode" ? "https://live.dodopayments.com" : "https://test.dodopayments.com";
  return { apiKey, productId, base };
}

export async function startCheckout() {
  const { supabase, userId, email } = await requireUser();
  const { apiKey, productId, base } = dodoConfig();
  if (!apiKey || !productId) {
    return { error: "Payments are not set up yet. Add the Dodo API key and the $9 product id." };
  }
  if (!email) return { error: "Your account has no email, so checkout cannot start." };

  const profile = await supabase.from("profiles").select("name, username, paid_at").eq("id", userId).maybeSingle();
  if (profile.error) {
    return { error: "Billing is not ready yet. Run the payments database update, then try again." };
  }
  if (isBuilderAccount(profile.data?.username)) redirect("/settings?checkout=builder");
  if (profile.data?.paid_at) redirect("/settings?checkout=paid");

  let spots;
  try {
    spots = await earlySpotCount();
  } catch (error) {
    console.error("Counting Early spots failed:", error);
    return { error: "Billing is not ready yet. Run the payments database update, then try again." };
  }
  if (spots.soldOut) {
    return { error: "The $9 Early price is sold out." };
  }

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") || "http";
  const response = await fetch(`${base}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email, name: profile.data?.name || undefined },
      metadata: { user_id: userId },
      return_url: `${proto}://${host}/settings?checkout=return`,
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.checkout_url) {
    console.error("Dodo checkout failed:", response.status, body);
    return { error: "Dodo could not start checkout. Check the API key, mode, and product id." };
  }

  redirect(body.checkout_url);
}
