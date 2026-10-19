"use client";

import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { initials } from "@/lib/profile";

export default function DashboardLayout({ user, locked = false, showPublish = false, showView = false, publicPath = "", children }) {
  const pathname = usePathname();
  const navigation = [
    { label: "Profile", href: "/admin", key: "profile" },
    { label: "Sites", href: "/sites", key: "sites" },
    { label: "Style", href: "/style", key: "style" },
    showPublish ? { label: "Publish", href: "/publish", key: "publish" } : null,
    showView && publicPath ? { label: "View", href: publicPath, key: "view" } : null,
    { label: "Settings", href: "/settings", key: "settings" },
  ].filter(Boolean);
  const links = navigation.map((item) =>
    locked && item.key !== "settings" ? { ...item, href: "/settings?checkout=required" } : item,
  );
  const active = links.find((item) => {
    if (locked && item.key !== "settings") return false;
    const href = item.href.split("?")[0];
    if (item.key === "view") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  })?.key;

  return (
    <div className="min-h-screen bg-[#1F1F1F] font-sans text-stone-100">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-[#1F1F1F] px-5 py-6 lg:flex">
          <Link href="/" className="link flex items-center gap-2 px-2 text-lg font-bold tracking-tight text-white no-underline">
            <BrandMark />
            pagzi.online
          </Link>

          <div className="mt-10">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-stone-400">Manage page</p>
            <ul className="menu mt-3 w-full gap-1 p-0">
              {links.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={`rounded-xl px-3 py-2.5 font-medium ${
                      active === item.key
                        ? "bg-stone-900 text-white hover:bg-stone-900"
                        : "text-stone-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto border-t border-white/10 pt-4">
            <div className="mb-4 flex items-center gap-3 px-2">
              <div className="avatar placeholder">
                <div className="w-9 rounded-full bg-amber-100 text-sm font-bold text-stone-700">
                  <span>{initials(user.name, user.email)}</span>
                </div>
              </div>
              <div className="min-w-0">
                {user.name && <p className="truncate text-sm font-semibold text-white">{user.name}</p>}
                <p className="truncate text-xs text-stone-400">{user.email}</p>
              </div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="btn btn-ghost btn-sm w-full justify-start rounded-xl px-3 font-medium text-stone-300 hover:bg-white/10 hover:text-white"
              >
                Logout
              </button>
            </form>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="border-b border-white/10 bg-[#1F1F1F] px-4 py-4 lg:hidden">
            <div className="flex items-center justify-between">
              <Link href="/" className="link flex items-center gap-2 text-lg font-bold text-white no-underline">
                <BrandMark />
                pagzi.online
              </Link>
              <form action={logout}>
                <button type="submit" className="btn btn-ghost btn-sm rounded-full text-stone-300">
                  Logout
                </button>
              </form>
            </div>
            <div className="mt-4 flex gap-1 overflow-x-auto">
              {links.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                    active === item.key ? "bg-white text-[#1F1F1F]" : "text-stone-300"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
