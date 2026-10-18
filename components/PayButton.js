"use client";

import { useActionState } from "react";
import { startCheckout } from "@/app/billing/actions";

export default function PayButton({ paid = false, complimentary = false, className, label = "Pay $9" }) {
  const [state, action, pending] = useActionState(startCheckout, null);

  if (paid) {
    return (
      <p className="text-sm font-medium text-emerald-300">
        {complimentary ? "Builder account. No payment needed." : "Paid. This page is yours."}
      </p>
    );
  }

  return (
    <form action={action}>
      <button type="submit" disabled={pending} className={className}>
        {pending ? "Opening checkout…" : label}
      </button>
      {state?.error && <p className="mt-3 text-sm text-red-300">{state.error}</p>}
    </form>
  );
}
