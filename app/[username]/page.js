import Link from "next/link";
import AnalyticsCard from "@/components/AnalyticsCard";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] px-4 py-8 font-sans text-stone-900 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="link mb-8 inline-block text-sm font-semibold text-stone-500 no-underline hover:text-stone-900">
          indie.site
        </Link>

        <div className="mb-7 px-2">
          <div className="avatar">
            <div className="w-24 rounded-full ring-4 ring-amber-200 shadow-sm sm:w-28">
              <img src="/profile.jpg" alt="Sohail Shaikh" className="object-cover" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold leading-none tracking-tight sm:text-4xl">Sohail Shaikh</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-stone-600">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                <path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
              </svg>
              Mumbai
            </span>
            <div className="flex items-center gap-3 border-l border-stone-300 pl-3">
              <a href="https://x.com/" target="_blank" rel="noreferrer" className="link font-medium text-stone-500">
                X
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                className="link font-medium text-stone-500"
              >
                LinkedIn
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                className="link font-medium text-stone-500"
              >
                Instagram
              </a>
            </div>
          </div>
          <p className="mt-4 max-w-lg text-sm font-medium leading-relaxed text-stone-700 sm:text-base">
            I design and build thoughtful digital products, turning ambitious ideas into simple and useful experiences.
          </p>
        </div>

        <div className="grid gap-4">
          {Array.from({ length: 5 }, (_, index) => (
            <AnalyticsCard key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
