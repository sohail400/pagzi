"use client";

import { useActionState, useState } from "react";
import { updateSites } from "./actions";

const NOTICE_STYLES = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-stone-200 bg-stone-50 text-stone-700",
  error: "border-red-200 bg-red-50 text-red-700",
};

const CARD = "card rounded-3xl border border-stone-200 bg-white shadow-[0_10px_35px_rgba(28,25,23,0.05)]";
const PRIMARY_BUTTON =
  "btn h-10 rounded-full border-stone-900 bg-stone-900 px-5 font-semibold text-white shadow-none hover:border-stone-800 hover:bg-stone-800";
const OUTLINE_BUTTON =
  "btn btn-outline h-9 rounded-full border-stone-300 px-4 font-medium text-stone-700 shadow-none hover:border-stone-400 hover:bg-stone-100 hover:text-stone-900";

function Notice({ type, children }) {
  return (
    <p role={type === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${NOTICE_STYLES[type]}`}>
      {children}
    </p>
  );
}

function SiteRow({ row, isPending, pendingKey, formAction, onSubmit }) {
  const key = `${row.added ? "remove" : "add"}:${row.property}`;
  const busy = isPending && pendingKey === key;

  return (
    <li className="flex items-center gap-3 py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-sm font-bold uppercase text-stone-600">
        {row.name.charAt(0)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-stone-900">{row.name}</p>
        <p className="mt-0.5 truncate text-xs text-stone-400">
          {row.property.startsWith("sc-domain:") ? "Domain property" : "URL-prefix property"}
          {row.added && !row.inGoogle && " · not found in your connected Google account"}
        </p>
      </div>
      {row.added && <span className="badge badge-sm hidden border-emerald-200 bg-emerald-50 text-emerald-700 sm:inline-flex">On your page</span>}
      <form action={formAction} onSubmit={() => onSubmit(key)}>
        <input type="hidden" name="intent" value={row.added ? "remove" : "add"} />
        <input type="hidden" name="property" value={row.property} />
        <button type="submit" disabled={isPending} className={row.added ? OUTLINE_BUTTON : PRIMARY_BUTTON + " h-9 px-4"}>
          {busy && <span className="loading loading-spinner loading-xs" />}
          {row.added ? "Remove" : "Add"}
        </button>
      </form>
    </li>
  );
}

export default function SitesManager({ connection, properties, sites, notice }) {
  const [state, formAction, isPending] = useActionState(updateSites, null);
  const [pendingKey, setPendingKey] = useState(null);

  const addedProperties = new Set(sites.map((site) => site.property));
  const googleProperties = new Set((properties ?? []).map((item) => item.property));
  const rows = [
    ...sites.map((site) => ({ ...site, added: true, inGoogle: !properties || googleProperties.has(site.property) })),
    ...(properties ?? [])
      .filter((item) => !addedProperties.has(item.property))
      .map((item) => ({ ...item, added: false, inGoogle: true })),
  ];

  const message = state?.error ? { type: "error", text: state.error } : state ? null : notice;
  const isConnected = connection?.status === "ok";

  return (
    <div className="space-y-6">
      {message && <Notice type={message.type}>{message.text}</Notice>}

      <div className={CARD}>
        <div className="card-body gap-0 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-lg font-bold text-stone-900">Google Search Console</p>
              {connection ? (
                <p className="mt-1 flex items-center gap-2 text-sm text-stone-500">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${isConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
                  <span className="truncate">
                    {isConnected ? "Connected" : "Needs attention"}
                    {connection.email && ` as ${connection.email}`}
                  </span>
                </p>
              ) : (
                <p className="mt-1 text-sm leading-6 text-stone-500">
                  Connect your Google account to show real clicks and impressions. indie.site only gets read-only access.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {!isConnected && (
                <a href="/api/google/connect" className={PRIMARY_BUTTON}>
                  {connection ? "Reconnect Google" : "Connect Google Search Console"}
                </a>
              )}
              {connection && (
                <form
                  action={formAction}
                  onSubmit={(event) => {
                    if (!window.confirm("Disconnect Google Search Console? Your page will stop getting new traffic data.")) {
                      event.preventDefault();
                      return;
                    }
                    setPendingKey("disconnect");
                  }}
                >
                  <input type="hidden" name="intent" value="disconnect" />
                  <button type="submit" disabled={isPending} className={OUTLINE_BUTTON + " h-10"}>
                    {isPending && pendingKey === "disconnect" && <span className="loading loading-spinner loading-xs" />}
                    Disconnect
                  </button>
                </form>
              )}
            </div>
          </div>

          {connection?.status === "revoked" && (
            <div className="mt-5">
              <Notice type="error">
                Google access has expired or was removed from your Google account. Please reconnect to keep your traffic up to date.
              </Notice>
            </div>
          )}
          {connection?.status === "error" && (
            <div className="mt-5">
              <Notice type="error">We couldn’t reach Google Search Console just now. Please refresh the page to try again.</Notice>
            </div>
          )}
        </div>
      </div>

      <div className={CARD}>
        <div className="card-body gap-0 p-5 sm:p-7">
          <div className="border-b border-stone-100 pb-5">
            <p className="text-lg font-bold text-stone-900">Your sites</p>
            <p className="mt-1 text-sm text-stone-500">Choose which websites appear on your public page.</p>
          </div>

          {rows.length > 0 ? (
            <ul className="divide-y divide-stone-100">
              {rows.map((row) => (
                <SiteRow
                  key={row.property}
                  row={row}
                  isPending={isPending}
                  pendingKey={pendingKey}
                  formAction={formAction}
                  onSubmit={setPendingKey}
                />
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm leading-6 text-stone-500">
              {isConnected ? (
                <>
                  No verified sites found in this Google account.{" "}
                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link font-medium text-stone-800"
                  >
                    Add your site in Search Console
                  </a>{" "}
                  first, then refresh this page.
                </>
              ) : (
                "Connect Google Search Console to see your websites here."
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
