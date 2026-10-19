import { NextResponse } from "next/server";
import { Webhooks } from "@dodopayments/nextjs";
import { grantPayment, revokePayment } from "@/lib/payments";

function paymentOf(payload) {
  const data = payload?.data ?? {};
  const productId = data.product_cart?.[0]?.product_id || "";
  return {
    userId: String(data.metadata?.user_id || ""),
    paymentId: String(data.payment_id || ""),
    productId: String(productId),
    customerId: String(data.customer?.customer_id || ""),
  };
}

async function revokeIfFull(payload) {
  const data = payload?.data ?? {};
  if (data.is_partial) return;
  await revokePayment(String(data.payment_id || ""));
}

const handleWebhook = process.env.DODO_PAYMENTS_WEBHOOK_KEY
  ? Webhooks({
      webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
      onPaymentSucceeded: async (payload) => {
        await grantPayment(paymentOf(payload));
      },
      onRefundSucceeded: revokeIfFull,
      onDisputeAccepted: revokeIfFull,
      onDisputeLost: revokeIfFull,
    })
  : null;

export async function POST(request) {
  if (!handleWebhook) {
    return NextResponse.json({ error: "DODO_PAYMENTS_WEBHOOK_KEY is not set." }, { status: 500 });
  }
  return handleWebhook(request);
}
