"use client";

import { useActionState } from "react";
import Link from "next/link";
import PasswordField from "@/components/PasswordField";
import { login } from "@/app/auth/actions";

export default function LoginForm({ notice, plan = "" }) {
  const [state, formAction, pending] = useActionState(login, null);
  const message = state?.error ?? notice;

  return (
    <form className="space-y-5" action={formAction}>
      {plan && <input type="hidden" name="plan" value={plan} />}
      {message && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
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

      <fieldset className="fieldset p-0">
        <div className="flex items-center justify-between pb-2">
          <legend className="fieldset-legend p-0 text-sm font-semibold text-stone-200">Password</legend>
          <Link href="/forgot-password" className="link text-xs font-semibold text-stone-400 hover:text-white">
            Forgot password?
          </Link>
        </div>
        <PasswordField
          name="password"
          autoComplete="current-password"
          required
          placeholder="Enter your password"
        />
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="btn h-12 w-full rounded-full border-stone-900 bg-stone-900 font-semibold text-white shadow-none hover:border-stone-800 hover:bg-stone-800 disabled:border-stone-700 disabled:bg-stone-700 disabled:text-white"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
