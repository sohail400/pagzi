import "server-only";

import { redirect } from "next/navigation";
import { hasFullAccess, isBuilderAccount } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export { hasFullAccess, isBuilderAccount };

export const INTRO_PRICE_LIMIT = 30;

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
  const { error } = await admin
    .from("profiles")
    .update({ paid_at: new Date().toISOString(), dodo_payment_id: paymentId })
    .eq("id", userId)
    .is("paid_at", null);
  if (error && error.code !== "23505") {
    console.error("Recording a Dodo payment failed:", error);
    throw new Error("Could not record the payment.");
  }
}

export async function revokePayment(paymentId) {
  if (!paymentId) return;
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ paid_at: null, dodo_payment_id: null }).eq("dodo_payment_id", paymentId);
  if (error) {
    console.error("Revoking a Dodo payment failed:", error);
    throw new Error("Could not revoke the payment.");
  }
}
