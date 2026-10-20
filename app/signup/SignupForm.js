"use client";

import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import PasswordField from "@/components/PasswordField";
import { signup } from "@/app/auth/actions";
import { isPlanId } from "@/lib/plans";
import { USERNAME_PATTERN } from "@/lib/profile";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, null);
  const params = useSearchParams();
  const requested = params.get("username")?.trim().toLowerCase() ?? "";
  const username = USERNAME_PATTERN.test(requested) ? requested : "";
  const plan = isPlanId(params.get("plan")) ? params.get("plan") : "";

  return (
    <div className="min-h-screen bg-[#1F1F1F] font-sans text-stone-100">
      <div className="navbar mx-auto max-w-6xl px-5 py-5 sm:px-8">
        <div className="navbar-start">
          <Link
            href="/"
            className="link flex items-center gap-2 text-lg font-bold tracking-tight no-underline"
            aria-label="Pagzi home"
          >
            <BrandMark />
            Pagzi
          </Link>
        </div>
        <div className="navbar-end gap-2 text-sm text-stone-500">
          <span className="hidden sm:inline">Already have an account?</span>
          <Link
            href={plan ? `/login?plan=${plan}` : "/login"}
            className="btn btn-sm rounded-full border-white/15 bg-[#1F1F1F] px-5 font-semibold text-stone-100 shadow-none hover:bg-white/10"
          >
            Sign in
          </Link>
        </div>
      </div>

      <main className="flex px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">Create your pagzi.online</p>
            <p className="mt-3 text-sm leading-6 text-stone-400 sm:text-base">
              {username
                ? `Your page can live at pagzi.online/${username}. You choose that address after you sign up.`
                : "One simple page for who you are and everything you’re building."}
            </p>
          </div>

          <div className="card rounded-[2rem] border border-white/10 bg-[#1F1F1F]">
            <div className="card-body gap-0 p-6 sm:p-8">
              {state?.success ? (
                <div role="status" className="text-center">
                  <p className="text-lg font-bold text-white">Check your email</p>
                  <p className="mt-2 text-sm leading-6 text-stone-300">
                    We sent a confirmation link to <span className="font-semibold text-white">{state.email}</span>.
                    Click it to activate your account.
                  </p>
                  <p className="mt-4 text-xs leading-5 text-stone-400">
                    Can’t find it? Check your spam folder. The link expires in 24 hours.
                  </p>
                </div>
              ) : (
              <form className="space-y-5" action={formAction}>
                {plan && <input type="hidden" name="plan" value={plan} />}
                {state?.error && (
                  <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {state.error}
                  </p>
                )}

                <fieldset className="fieldset p-0">
                  <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-200">Your name</legend>
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={80}
                    defaultValue={state?.values?.name}
                    placeholder="Sohail Shaikh"
                    className="input h-12 w-full rounded-xl border-white/15 bg-[#1F1F1F] px-4 text-stone-100 outline-none placeholder:text-stone-500 focus:border-stone-400 focus:outline-none"
                  />
                </fieldset>

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
                  <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-200">Password</legend>
                  <PasswordField
                    name="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                  />
                  <p className="fieldset-label pt-2 text-xs text-stone-400">Use 8 or more characters.</p>
                </fieldset>

                <label className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-stone-300">
                  <input
                    type="checkbox"
                    name="terms"
                    required
                    className="checkbox checkbox-sm mt-0.5 rounded border border-stone-300 text-white checked:border-stone-900 checked:bg-stone-900"
                  />
                  <span>I agree to the terms and privacy policy.</span>
                </label>

                <button
                  type="submit"
                  disabled={pending}
                  className="btn h-12 w-full rounded-full border-stone-900 bg-stone-900 font-semibold text-white shadow-none hover:border-stone-800 hover:bg-stone-800 disabled:border-stone-700 disabled:bg-stone-700 disabled:text-white"
                >
                  {pending ? "Creating account…" : "Create account"}
                </button>
              </form>
              )}

              <p className="mt-6 text-center text-sm text-stone-500">
                Already have an account?{" "}
                <Link href={plan ? `/login?plan=${plan}` : "/login"} className="link font-semibold text-white">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="mx-auto mt-5 max-w-sm text-center text-xs leading-5 text-stone-400">
            Start with your profile, then add the websites and projects you want people to discover.
          </p>
        </div>
      </main>
    </div>
  );
}
