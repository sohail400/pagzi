"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/app/auth/actions";

export default function ForgotForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, null);

  if (state?.success) {
    return (
      <div className="text-center">
        <p className="text-lg font-bold text-white">Check your email</p>
        <p className="mt-2 text-sm leading-6 text-stone-300">
          If an account exists for <span className="font-semibold text-white">{state.email}</span>, we sent a link to
          choose a new password.
        </p>
        <Link href="/login" className="btn btn-save mt-6 h-11 rounded-xl border-0 px-6 font-semibold text-white shadow-none">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-5" action={formAction}>
      {state?.error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <fieldset className="fieldset p-0">
        <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-200">Email address</legend>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          defaultValue={state?.values?.email}
          placeholder="you@example.com"
          className="input h-12 w-full rounded-xl border-white/15 bg-[#1F1F1F] px-4 text-stone-100 outline-none placeholder:text-stone-500 focus:border-stone-400 focus:outline-none"
        />
      </fieldset>
      <button
        type="submit"
        disabled={pending}
        className="btn btn-save h-12 w-full rounded-xl border-0 font-semibold text-white shadow-none"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
      <p className="text-center text-sm text-stone-500">
        <Link href="/login" className="link font-semibold text-white">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
