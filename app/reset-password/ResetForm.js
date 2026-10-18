"use client";

import Link from "next/link";
import { useActionState } from "react";
import PasswordField from "@/components/PasswordField";
import { updatePassword } from "@/app/auth/actions";

export default function ResetForm() {
  const [state, formAction, pending] = useActionState(updatePassword, null);

  return (
    <form className="space-y-5" action={formAction}>
      {state?.error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <fieldset className="fieldset p-0">
        <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-200">New password</legend>
        <PasswordField
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
      </fieldset>
      <fieldset className="fieldset p-0">
        <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-200">Confirm password</legend>
        <PasswordField
          name="confirm"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Repeat your new password"
        />
      </fieldset>
      <button
        type="submit"
        disabled={pending}
        className="btn btn-save h-12 w-full rounded-xl border-0 font-semibold text-white shadow-none"
      >
        {pending ? "Saving…" : "Save new password"}
      </button>
      <p className="text-center text-sm text-stone-500">
        <Link href="/forgot-password" className="link font-semibold text-white">
          Request a new link
        </Link>
      </p>
    </form>
  );
}
