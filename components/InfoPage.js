import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import SiteFooter from "@/components/SiteFooter";

export default function InfoPage({ title, children }) {
  return (
    <div className="min-h-screen bg-[#1F1F1F] font-sans text-stone-100">
      <header className="navbar mx-auto max-w-6xl px-5 py-5 sm:px-8">
        <Link href="/" className="link flex items-center gap-2 text-lg font-bold tracking-tight text-white no-underline" aria-label="pagzi.online home">
          <BrandMark />
          pagzi.online
        </Link>
      </header>
      <main className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-stone-300">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
