"use client";

import { useActionState } from "react";
import { startCheckout } from "@/app/billing/actions";

export default function PayButton({ className, label, plan }) {
  const [state, action, pending] = useActionState(startCheckout, null);

  return (
    <form action={action}>
      <input type="hidden" name="plan" value={plan} />
      <button type="submit" disabled={pending} className={className}>
        {pending ? "Opening checkout…" : label}
      </button>
      {state?.error && <p className="mt-3 text-sm text-red-300">{state.error}</p>}
    </form>
  );
}
