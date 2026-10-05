"use client";

import { useActionState } from "react";
import { login } from "@/app/auth/actions";

export default function LoginForm({ notice }) {
  const [state, formAction, pending] = useActionState(login, null);
  const message = state?.error ?? notice;

  return (
    <form className="space-y-5" action={formAction}>
      {message && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </p>
      )}

      <fieldset className="fieldset p-0">
        <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-700">Email address</legend>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          defaultValue={state?.values?.email}
          placeholder="you@example.com"
          className="input h-12 w-full rounded-xl border-stone-300 bg-white px-4 text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-700 focus:outline-none"
        />
      </fieldset>

      <fieldset className="fieldset p-0">
        <div className="flex items-center justify-between pb-2">
          <legend className="fieldset-legend p-0 text-sm font-semibold text-stone-700">Password</legend>
          <a
            href="mailto:hello@indie.site?subject=Password reset"
            className="link text-xs font-semibold text-stone-500 hover:text-stone-900"
          >
            Forgot password?
          </a>
        </div>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          placeholder="Enter your password"
          className="input h-12 w-full rounded-xl border-stone-300 bg-white px-4 text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-700 focus:outline-none"
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
