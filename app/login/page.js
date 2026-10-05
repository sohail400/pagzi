import Link from "next/link";
import LoginForm from "./LoginForm";

const NOTICES = {
  invalid_link: "That link is invalid or has expired. Please sign in, or sign up again to get a new link.",
};

export const metadata = {
  title: "Sign in · indie.site",
};

export default async function LoginPage({ searchParams }) {
  const { error } = await searchParams;

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
              <LoginForm notice={NOTICES[error]} />

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
