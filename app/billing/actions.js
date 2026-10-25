"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasFullAccess, selectAccess } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { isPlanId, planOption } from "@/lib/plans";
import { dodoEnvironment, earlySpotCount, isBuilderAccount, productIdFor } from "@/lib/payments";

export async function startCheckout(previousState, formData) {
  const plan = String(formData?.get("plan") ?? "");
  const option = planOption(plan);
  if (!isPlanId(plan) || !option) return { error: "Choose the Launch deal, the 1-Year Pass, or the Lifetime Deal." };

  const { supabase, userId, email } = await requireUser();
  const { apiKey, base } = dodoEnvironment();
  const productId = productIdFor(plan);
  if (!apiKey || !productId) {
    return { error: `${option.name} is not set up yet. Add its Dodo product id.` };
  }
  if (!email) return { error: "Your account has no email, so checkout cannot start." };

  const profile = await selectAccess(supabase, userId);
  if (profile.error) {
    return { error: "Billing is not ready yet. Run the payments database update, then try again." };
  }
  const nameRow = await supabase.from("profiles").select("name").eq("id", userId).maybeSingle();
  if (isBuilderAccount(profile.data?.username)) redirect("/settings?checkout=builder");
  if (hasFullAccess(profile.data)) redirect("/settings?checkout=paid");

  if (plan === "early" || plan === "lifetime") {
    let spots;
    try {
      spots = await earlySpotCount();
    } catch (error) {
      console.error("Counting launch spots failed:", error);
      return { error: "Billing is not ready yet. Run the payments database update, then try again." };
    }
    if (plan === "early" && spots.soldOut) return { error: "The launch deal is sold out." };
    if (plan === "lifetime" && !spots.soldOut) {
      return { error: "The lifetime price opens after the launch spots are sold out." };
    }
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
      customer: { email, name: nameRow.data?.name || undefined },
      metadata: { user_id: userId, plan },
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

export async function openBillingPortal() {
  const { supabase, userId } = await requireUser();
  const { apiKey, base } = dodoEnvironment();
  if (!apiKey) return { error: "Billing portal is not set up yet." };

  const profile = await supabase.from("profiles").select("dodo_customer_id").eq("id", userId).maybeSingle();
  const customerId = profile.data?.dodo_customer_id;
  if (profile.error || !customerId) return { error: "A receipt appears here after Dodo confirms the payment." };

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") || "http";
  const returnUrl = `${proto}://${host}/settings?checkout=portal`;
  const response = await fetch(
    `${base}/customers/${customerId}/customer-portal/session?send_email=false&return_url=${encodeURIComponent(returnUrl)}`,
    { method: "POST", headers: { Authorization: `Bearer ${apiKey}` } },
  );
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.link) {
    console.error("Dodo customer portal failed:", response.status, body);
    return { error: "Dodo could not open the billing portal." };
  }
  redirect(body.link);
}
