"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { initials } from "@/lib/profile";

const navigation = [
  { label: "Profile", href: "/admin", key: "profile" },
  { label: "Sites", href: "", key: "sites", disabled: true },
  { label: "Settings", href: "/settings", key: "settings" },
];

export default function DashboardLayout({ user, children }) {
  const pathname = usePathname();
  const active = navigation.find((item) => item.href && pathname.startsWith(item.href))?.key;

  return (
    <div className="min-h-screen bg-[#f8f7f3] font-sans text-stone-900">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-stone-200 bg-white/60 px-5 py-6 lg:flex">
          <Link href="/" className="link flex items-center gap-2 px-2 text-lg font-bold tracking-tight no-underline">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 text-sm text-white">i</span>
            indie.site
          </Link>

          <div className="mt-10">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-stone-400">Manage page</p>
            <ul className="menu mt-3 w-full gap-1 p-0">
              {navigation.map((item) => (
                <li key={item.key}>
                  {item.disabled ? (
                    <span className="flex cursor-default justify-between rounded-xl px-3 py-2.5 text-stone-400 hover:bg-transparent">
                      {item.label}
                      <span className="badge badge-ghost badge-xs border-stone-200 text-[9px] uppercase">Soon</span>
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className={`rounded-xl px-3 py-2.5 font-medium ${
                        active === item.key
                          ? "bg-stone-900 text-white hover:bg-stone-900"
                          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto border-t border-stone-200 pt-4">
            <div className="mb-4 flex items-center gap-3 px-2">
              <div className="avatar placeholder">
                <div className="w-9 rounded-full bg-amber-100 text-sm font-bold text-stone-700">
                  <span>{initials(user.name, user.email)}</span>
                </div>
              </div>
              <div className="min-w-0">
                {user.name && <p className="truncate text-sm font-semibold text-stone-800">{user.name}</p>}
                <p className="truncate text-xs text-stone-400">{user.email}</p>
              </div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="btn btn-ghost btn-sm w-full justify-start rounded-xl px-3 font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              >
                Logout
              </button>
            </form>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="border-b border-stone-200 bg-white/70 px-4 py-4 lg:hidden">
            <div className="flex items-center justify-between">
              <Link href="/" className="link flex items-center gap-2 text-lg font-bold no-underline">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 text-sm text-white">
                  i
                </span>
                indie.site
              </Link>
              <form action={logout}>
                <button type="submit" className="btn btn-ghost btn-sm rounded-full text-stone-500">
                  Logout
                </button>
              </form>
            </div>
            <div className="mt-4 flex gap-1 overflow-x-auto">
              {navigation.map((item) =>
                item.disabled ? (
                  <span
                    key={item.key}
                    className="flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-stone-400"
                  >
                    {item.label}
                    <span className="badge badge-ghost badge-xs text-[8px] uppercase">Soon</span>
                  </span>
                ) : (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                      active === item.key ? "bg-stone-900 text-white" : "text-stone-600"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
