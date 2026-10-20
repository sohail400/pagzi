import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { isPlanId } from "@/lib/plans";
import LoginForm from "./LoginForm";

const NOTICES = {
  invalid_link: "That link is invalid or has expired. Please sign in, or sign up again to get a new link.",
  confirm_failed:
    "Your email is confirmed, but we couldn't sign you in automatically (this happens if the link was opened in a different browser). Please sign in below.",
};

export const metadata = {
  title: "Sign in · pagzi.online",
};

export default async function LoginPage({ searchParams }) {
  const { error, plan } = await searchParams;
  const selectedPlan = isPlanId(plan) ? plan : "";
  const signupHref = selectedPlan ? `/signup?plan=${selectedPlan}` : "/signup";

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
          <span className="hidden sm:inline">New to pagzi.online?</span>
          <Link
            href={signupHref}
            className="btn btn-sm rounded-full border-white/15 bg-[#1F1F1F] px-5 font-semibold text-stone-100 shadow-none hover:bg-white/10"
          >
            Create account
          </Link>
        </div>
      </div>

      <main className="flex px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">Welcome back</p>
            <p className="mt-3 text-sm leading-6 text-stone-400 sm:text-base">
              Sign in to manage your profile and the projects you’re building.
            </p>
          </div>

          <div className="card rounded-[2rem] border border-white/10 bg-[#1F1F1F]">
            <div className="card-body gap-0 p-6 sm:p-8">
              <LoginForm notice={NOTICES[error]} plan={selectedPlan} />

              <p className="mt-6 text-center text-sm text-stone-500">
                Don’t have an account?{" "}
                <Link href={signupHref} className="link font-semibold text-white">
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
