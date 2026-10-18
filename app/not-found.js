import Link from "next/link";

export const metadata = {
  title: "Page not found · pagzi.online",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1F1F1F] px-5 font-sans text-stone-100">
      <div className="text-center">
        <p className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Page not found</p>
        <p className="mt-3 text-sm leading-6 text-stone-400 sm:text-base">
          There’s no pagzi.online page here yet. It might be free to claim.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="btn h-12 w-full rounded-full border-stone-900 bg-stone-900 px-7 font-semibold text-white shadow-none hover:border-stone-800 hover:bg-stone-800 sm:w-auto"
          >
            Create your page
          </Link>
          <Link
            href="/"
            className="btn btn-ghost h-12 w-full rounded-full px-7 font-semibold text-stone-300 hover:bg-white/10 sm:w-auto"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
