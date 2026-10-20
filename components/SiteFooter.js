import Link from "next/link";
import Avatar from "@/components/Avatar";
import BrandMark from "@/components/BrandMark";
import SocialLinks from "@/components/SocialLinks";
import { socialLinksOf } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

const CREATOR = "sohail";
const SOCIALS = ["x_url", "linkedin_url", "github_url", "email_url"];

const PAGES = [
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Signup" },
  { href: "/support", label: "Support" },
  { href: "/#pricing", label: "Pricing" },
];

const LEGAL = [
  { href: "/terms", label: "Terms of use" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/refund", label: "Refund policy" },
  { href: "/about", label: "About us" },
  { href: "/cookies", label: "Cookie policy" },
];

export async function loadCreator() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("name, avatar_url, username, x_url, linkedin_url, github_url, email_url")
      .eq("username", CREATOR)
      .maybeSingle();
    return data;
  } catch (error) {
    console.error("Footer profile failed:", error);
    return null;
  }
}

function FooterLink({ href, children }) {
  return (
    <li>
      <Link href={href} className="text-sm text-stone-400 transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  );
}

export default async function SiteFooter() {
  const creator = await loadCreator();
  const links = socialLinksOf(creator || {})
    .filter((link) => SOCIALS.includes(link.key))
    .sort((a, b) => SOCIALS.indexOf(a.key) - SOCIALS.indexOf(b.key));

  return (
    <footer className="bg-black text-stone-300">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2">
          <nav aria-label="Pages">
            <Link href="/" className="inline-flex items-center gap-2 text-base font-bold text-white" aria-label="Pagzi home">
              <BrandMark />
              Pagzi
            </Link>
            <ul className="mt-4 space-y-2.5">
              {PAGES.map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {item.label}
                </FooterLink>
              ))}
            </ul>
          </nav>
          <nav aria-label="Legal">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Legal</p>
            <ul className="mt-4 space-y-2.5">
              {LEGAL.map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {item.label}
                </FooterLink>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-stone-500">Copyright © {new Date().getFullYear()} pagzi.online</p>
          <Link
            href={`/${CREATOR}`}
            className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-white"
          >
            Created by <span className="font-semibold text-amber-300">Sohail</span>
            <Avatar src={creator?.avatar_url || ""} name={creator?.name || "Sohail"} className="w-7" textClassName="text-xs" />
          </Link>
          <SocialLinks links={links} size="sm" flush color="#E7E5E4" />
        </div>
      </div>
    </footer>
  );
}
