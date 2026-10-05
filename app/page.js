import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8f7f3] font-sans text-stone-900">
      <div className="navbar mx-auto max-w-6xl px-5 py-5 sm:px-8">
        <div className="navbar-start">
          <a
            href="#top"
            className="link flex items-center gap-2 text-lg font-bold tracking-tight no-underline"
            aria-label="indie.site home"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 text-sm text-white">
              i
            </span>
            indie.site
          </a>
        </div>
        <div className="navbar-end gap-2">
          <Link
            href="/login"
            className="btn btn-ghost btn-sm hidden rounded-full px-4 font-semibold text-stone-600 hover:bg-stone-200/60 sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="btn btn-sm rounded-full border-stone-300 bg-white px-5 font-semibold text-stone-800 shadow-none hover:border-stone-400 hover:bg-stone-50"
          >
            Create your page
          </Link>
        </div>
      </div>

      <main id="top">
        <div className="mx-auto max-w-5xl px-5 pb-20 pt-20 text-center sm:px-8 sm:pb-28 sm:pt-28">
          <p className="mx-auto max-w-4xl text-4xl font-bold leading-[1.05] tracking-[-0.045em] text-stone-900 sm:text-6xl lg:text-7xl">
            Your personal page for everything you’re building.
          </p>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
            Show who you are, what you’re building, and the websites behind your journey — all from one simple page.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="btn h-12 w-full rounded-full border-stone-900 bg-stone-900 px-7 font-semibold text-white shadow-sm hover:border-stone-800 hover:bg-stone-800 sm:w-auto"
            >
              Create your page
            </Link>
            <Link
              href="/sohail"
              className="btn btn-ghost h-12 w-full rounded-full px-7 font-semibold text-stone-600 hover:bg-stone-200/60 sm:w-auto"
            >
              See an example
            </Link>
          </div>
        </div>

        <div id="preview" className="scroll-mt-8 px-4 sm:px-8">
          <div className="mx-auto flex max-w-6xl justify-center rounded-[2rem] border border-stone-200 bg-[#eeece6] px-5 py-12 shadow-[0_20px_70px_rgba(28,25,23,0.06)] sm:py-20 lg:py-24">
            <img
              src="/indie-site-preview.png"
              alt="Mobile indie.site profile showing Sohail Shaikh's bio, social links, and website performance cards"
              className="w-full max-w-[346px] rounded-[1.75rem] shadow-[0_24px_65px_rgba(28,25,23,0.18)]"
            />
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 sm:py-32">
          <p className="text-3xl font-bold tracking-[-0.035em] text-stone-900 sm:text-5xl">
            Everything you want to share, in one place.
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
            Create a simple profile with your photo, bio, location, social links, and websites. Give people one link to
            discover who you are and what you&apos;re building.
          </p>
        </div>

        <div id="pricing" className="scroll-mt-8 border-y border-stone-200 bg-white/60 px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-3xl font-bold tracking-[-0.035em] text-stone-900 sm:text-5xl">Simple pricing</p>
            <div className="card mt-10 rounded-[2rem] border border-stone-200 bg-white text-left shadow-[0_16px_50px_rgba(28,25,23,0.07)]">
              <div className="card-body p-7 sm:p-9">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold tracking-[-0.05em] text-stone-900 sm:text-6xl">$25</span>
                  <span className="pb-1.5 text-base font-medium text-stone-500">/ year</span>
                </div>
                <p className="mt-4 text-base leading-7 text-stone-600">
                  Everything you need to create and keep your indie.site page.
                </p>
                <div className="card-actions mt-5">
                  <Link
                    href="/signup"
                    className="btn h-12 w-full rounded-full border-stone-900 bg-stone-900 font-semibold text-white shadow-none hover:border-stone-800 hover:bg-stone-800"
                  >
                    Get indie.site
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer footer-center px-5 py-12 text-stone-500">
        <div className="flex flex-col items-center gap-2">
          <p className="text-base font-bold tracking-tight text-stone-800">indie.site</p>
          <p className="text-sm">© {new Date().getFullYear()} indie.site. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
