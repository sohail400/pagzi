import "server-only";

import { redirect } from "next/navigation";
import { hasFullAccess, isBuilderAccount } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export { hasFullAccess, isBuilderAccount };

export const EARLY_SPOT_LIMIT = 20;

function missingPlanColumn(error) {
  const detail = `${error?.message ?? ""} ${error?.details ?? ""} ${error?.hint ?? ""}`;
  return detail.includes("plan");
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
  const { data, error } = await session.supabase
    .from("profiles")
    .select("username, paid_at")
    .eq("id", session.userId)
    .maybeSingle();
  if (error || !hasFullAccess(data)) redirect("/settings?checkout=required");
  return session;
}

export async function grantPayment({ userId, paymentId }) {
  if (!userId || !paymentId) throw new Error("The payment is missing the account id.");
  const admin = createAdminClient();
  const existing = await admin.from("profiles").select("id").eq("dodo_payment_id", paymentId).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return;
  const spots = await earlySpotCount(admin);
  if (spots.soldOut) throw new Error("The $9 Early price is sold out.");
  const paidAt = new Date().toISOString();
  let { error } = await admin
    .from("profiles")
    .update({ paid_at: paidAt, dodo_payment_id: paymentId, plan: "early" })
    .eq("id", userId)
    .is("paid_at", null);
  if (error && missingPlanColumn(error)) {
    ({ error } = await admin
      .from("profiles")
      .update({ paid_at: paidAt, dodo_payment_id: paymentId })
      .eq("id", userId)
      .is("paid_at", null));
  }
  if (error && error.code !== "23505") {
    console.error("Recording a Dodo payment failed:", error);
    throw new Error("Could not record the payment.");
  }
}

export async function revokePayment(paymentId) {
  if (!paymentId) return;
  const admin = createAdminClient();
  let { error } = await admin.from("profiles").update({ paid_at: null, dodo_payment_id: null, plan: null }).eq("dodo_payment_id", paymentId);
  if (error && missingPlanColumn(error)) {
    ({ error } = await admin.from("profiles").update({ paid_at: null, dodo_payment_id: null }).eq("dodo_payment_id", paymentId));
  }
  if (error) {
    console.error("Revoking a Dodo payment failed:", error);
    throw new Error("Could not revoke the payment.");
  }
}
