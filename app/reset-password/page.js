import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import ResetForm from "./ResetForm";

export const metadata = {
  title: "Choose a new password · pagzi.online",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#1F1F1F] font-sans text-stone-100">
      <div className="navbar mx-auto max-w-6xl px-5 py-5 sm:px-8">
        <div className="navbar-start">
          <Link href="/" className="link flex items-center gap-2 text-lg font-bold tracking-tight no-underline" aria-label="Pagzi home">
            <BrandMark />
            Pagzi
          </Link>
        </div>
      </div>

      <main className="flex px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">Choose a new password</p>
            <p className="mt-3 text-sm leading-6 text-stone-400 sm:text-base">
              Use the link from your email, then save a new password here.
            </p>
          </div>
          <div className="card rounded-[2rem] border border-white/10 bg-[#1F1F1F]">
            <div className="card-body gap-0 p-6 sm:p-8">
              <ResetForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
