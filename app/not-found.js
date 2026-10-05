import Link from "next/link";

export const metadata = {
  title: "Page not found · indie.site",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f7f3] px-5 font-sans text-stone-900">
      <div className="text-center">
        <p className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Page not found</p>
        <p className="mt-3 text-sm leading-6 text-stone-600 sm:text-base">
          There’s no indie.site page here yet. It might be free to claim.
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
            className="btn btn-ghost h-12 w-full rounded-full px-7 font-semibold text-stone-600 hover:bg-stone-200/60 sm:w-auto"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
