"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f8f7f3] font-sans text-stone-900">
      <div className="navbar mx-auto max-w-6xl px-5 py-5 sm:px-8">
        <div className="navbar-start">
          <Link
            href="/"
            className="link flex items-center gap-2 text-lg font-bold tracking-tight no-underline"
            aria-label="indie.site home"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 text-sm text-white">i</span>
            indie.site
          </Link>
        </div>
        <div className="navbar-end gap-2 text-sm text-stone-500">
          <span className="hidden sm:inline">New to indie.site?</span>
          <Link
            href="/signup"
            className="btn btn-sm rounded-full border-stone-300 bg-white px-5 font-semibold text-stone-800 shadow-none hover:border-stone-400 hover:bg-stone-50"
          >
            Create account
          </Link>
        </div>
      </div>

      <main className="flex px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="text-3xl font-bold tracking-[-0.035em] text-stone-900 sm:text-4xl">Welcome back</p>
            <p className="mt-3 text-sm leading-6 text-stone-600 sm:text-base">
              Sign in to manage your profile and the projects you’re building.
            </p>
          </div>

          <div className="card rounded-[2rem] border border-stone-200 bg-white shadow-[0_16px_50px_rgba(28,25,23,0.07)]">
            <div className="card-body gap-0 p-6 sm:p-8">
              <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
                <fieldset className="fieldset p-0">
                  <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-700">Email address</legend>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
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

                <label className="flex cursor-pointer items-center gap-3 text-sm text-stone-600">
                  <input type="checkbox" name="remember" className="checkbox checkbox-sm rounded border-stone-300" />
                  Keep me signed in
                </label>

                <button
                  type="submit"
                  className="btn h-12 w-full rounded-full border-stone-900 bg-stone-900 font-semibold text-white shadow-none hover:border-stone-800 hover:bg-stone-800"
                >
                  Sign in
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-stone-500">
                Don’t have an account?{" "}
                <Link href="/signup" className="link font-semibold text-stone-900">
                  Create your page
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
