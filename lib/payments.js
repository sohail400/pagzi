import "server-only";

import { redirect } from "next/navigation";
import { hasFullAccess, isBuilderAccount, selectAccess } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { planOption } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";

export { hasFullAccess, isBuilderAccount };

export const EARLY_SPOT_LIMIT = 20;

const PRODUCT_ENV = {
  early: ["DODO_PAYMENTS_PRODUCT_EARLY", "DODO_PAYMENTS_PRODUCT_ID"],
  year: ["DODO_PAYMENTS_PRODUCT_YEAR"],
  lifetime: ["DODO_PAYMENTS_PRODUCT_LIFETIME"],
};

export function dodoEnvironment() {
  const environment = process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode";
  const base = environment === "live_mode" ? "https://live.dodopayments.com" : "https://test.dodopayments.com";
  return { environment, base, apiKey: process.env.DODO_PAYMENTS_API_KEY || "" };
}

export function productIdFor(planId) {
  const keys = PRODUCT_ENV[planId] || [];
  return keys.map((key) => process.env[key] || "").find(Boolean) || "";
}

export function planFromProductId(productId) {
  if (!productId) return "";
  return Object.keys(PRODUCT_ENV).find((planId) => productIdFor(planId) === productId) || "";
}

function errorDetail(error) {
  return `${error?.message ?? ""} ${error?.details ?? ""} ${error?.hint ?? ""}`;
}

function missingPlanColumn(error) {
  return errorDetail(error).includes("plan") || !error?.message;
}

function yearLater(from) {
  const date = new Date(from);
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.toISOString();
}

export async function earlySpotCount(admin = createAdminClient()) {
  let counted = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("plan", "early")
    .not("paid_at", "is", null);
  if (counted.error && (missingPlanColumn(counted.error) || !counted.error.message)) {
    counted = await admin.from("profiles").select("id", { count: "exact", head: true }).not("paid_at", "is", null);
  }
  if (counted.error) throw counted.error;
  const count = counted.count ?? 0;
  return {
    count,
    left: Math.max(0, EARLY_SPOT_LIMIT - count),
    soldOut: count >= EARLY_SPOT_LIMIT,
  };
}

export async function requireFullAccess() {
  const session = await requireUser();
  const { data, error } = await selectAccess(session.supabase, session.userId);
  if (error || !hasFullAccess(data)) redirect("/settings?checkout=required");
  return session;
}

export async function grantPayment({ userId, paymentId, productId, customerId }) {
  if (!userId || !paymentId) throw new Error("The payment is missing the account id.");
  const plan = planFromProductId(productId);
  if (!planOption(plan)) throw new Error("This payment is for an unknown product.");
  const admin = createAdminClient();
  const existing = await admin.from("profiles").select("id").eq("dodo_payment_id", paymentId).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return;

  const current = await selectAccess(admin, userId);
  if (current.error) throw current.error;
  if (hasFullAccess(current.data)) return;
  if (plan === "early") {
    const spots = await earlySpotCount(admin);
    if (spots.soldOut) throw new Error("The Early price is sold out.");
  }

  const paidAt = new Date().toISOString();
  const patch = {
    paid_at: paidAt,
    dodo_payment_id: paymentId,
    plan,
    plan_expires_at: plan === "year" ? yearLater(paidAt) : null,
    dodo_customer_id: customerId || null,
  };
  let fields = { ...patch };
  let error = null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (plan === "year" && !Object.prototype.hasOwnProperty.call(fields, "plan_expires_at")) {
      throw new Error("Billing is not ready yet. Run the payments database update, then try again.");
    }
    const saved = await admin.from("profiles").update(fields).eq("id", userId).select("id").maybeSingle();
    error = saved.error;
    if (!error) {
      if (!saved.data) throw new Error("Could not record the payment.");
      return;
    }
    if (error.code === "23505") return;
    const detail = errorDetail(error);
    const missing = ["dodo_customer_id", "plan_expires_at", "plan"].find(
      (column) => Object.prototype.hasOwnProperty.call(fields, column) && (detail.includes(column) || !error.message),
    );
    if (!missing) break;
    const { [missing]: _dropped, ...rest } = fields;
    fields = rest;
  }
  console.error("Recording a Dodo payment failed:", error);
  throw new Error("Could not record the payment.");
}

export async function revokePayment(paymentId) {
  if (!paymentId) return;
  const admin = createAdminClient();
  let fields = { paid_at: null, dodo_payment_id: null, plan: null, plan_expires_at: null };
  let error = null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    ({ error } = await admin.from("profiles").update(fields).eq("dodo_payment_id", paymentId));
    if (!error) return;
    const detail = errorDetail(error);
    const missing = ["plan_expires_at", "plan"].find(
      (column) => Object.prototype.hasOwnProperty.call(fields, column) && (detail.includes(column) || !error.message),
    );
    if (!missing) break;
    const { [missing]: _dropped, ...rest } = fields;
    fields = rest;
  }
  if (error) {
    console.error("Revoking a Dodo payment failed:", error);
    throw new Error("Could not revoke the payment.");
  }
}
