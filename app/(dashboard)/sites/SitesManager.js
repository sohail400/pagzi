"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import PagePhone from "@/components/PagePhone";
import SiteLogo from "@/components/SiteLogo";
import { wordCount } from "@/lib/description";
import { CATEGORIES, CHARTS, STATUSES } from "@/lib/site-fields";
import { updateSites } from "./actions";

const NOTICE_STYLES = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-white/10 bg-[#161616] text-stone-200",
  error: "border-red-200 bg-red-50 text-red-700",
};

const CARD = "card rounded-3xl border border-white/10 bg-[#1F1F1F]";
const PRIMARY_BUTTON =
  "btn h-10 rounded-full border-stone-900 bg-stone-900 px-5 font-semibold text-white shadow-none hover:border-stone-800 hover:bg-stone-800";
const SAVE_BUTTON =
  "btn btn-save h-10 rounded-xl border-0 px-5 font-semibold text-white shadow-none";
const OUTLINE_BUTTON =
  "btn btn-outline h-9 rounded-full border-white/20 px-4 font-medium text-stone-200 shadow-none hover:border-white/40 hover:bg-white/10 hover:text-white";

function Notice({ type, children }) {
  return (
    <p role={type === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${NOTICE_STYLES[type]}`}>
      {children}
    </p>
  );
}

const FIELD = "h-10 w-full rounded-xl border border-white/15 bg-[#1F1F1F] px-3 text-sm text-stone-100 focus:border-stone-400 focus:outline-none";

function ChoiceField({ label, name, value, options, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-stone-300">{label}</span>
      <select name={name} value={value || ""} onChange={(event) => onChange(event.target.value)} className={`select ${FIELD}`}>
        <option value="">Pick one</option>
        {options.map(([option, emoji]) => (
          <option key={option} value={option}>
            {emoji} {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SiteRow({ row, isPending, pendingKey, formAction, onSubmit, onDraft }) {
  const [value, setValue] = useState(row.description ?? "");
  const [category, setCategory] = useState(row.category || "");
  const [status, setStatus] = useState(row.status || "");
  const [chart, setChart] = useState(row.chart || "area");
  const [anonymous, setAnonymous] = useState(Boolean(row.anonymous));
  const [preview, setPreview] = useState("");
  const words = wordCount(value);

  useEffect(() => {
    if (!row.added) return undefined;
    onDraft(row.property, {
      description: value,
      category,
      status,
      chart,
      anonymous,
      logoUrl: preview || row.logo_url || "",
    });
    return undefined;
  }, [anonymous, category, chart, onDraft, preview, row.added, row.logo_url, row.property, status, value]);
  const ready = words >= 6;
  const intent = row.added ? "save" : "add";
  const key = `${intent}:${row.property}`;
  const busy = isPending && pendingKey === key;
  const removeKey = `remove:${row.property}`;
  const removing = isPending && pendingKey === removeKey;

  return (
    <li className="py-5">
      <form action={formAction} onSubmit={() => onSubmit(key)}>
        <input type="hidden" name="intent" value={intent} />
        <input type="hidden" name="property" value={row.property} />
        <div className="flex items-center gap-3">
          <SiteLogo name={row.name} logoUrl={preview || row.logo_url} className="h-10 w-10 rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{row.name}</p>
            <p className="mt-0.5 truncate text-xs text-stone-400">{row.property.replace(/^sc-domain:/, "")}</p>
          </div>
          <label className={`${OUTLINE_BUTTON} cursor-pointer`}>
            Upload logo
            <input
              type="file"
              name="logo"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setPreview(file ? URL.createObjectURL(file) : "");
              }}
            />
          </label>
          {row.added && (
            <span className="badge badge-sm hidden border-emerald-200 bg-emerald-50 text-emerald-700 sm:inline-flex">
              On your page
            </span>
          )}
        </div>

        <div className="mt-4 space-y-3 sm:pl-[52px]">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-stone-300">Description</span>
            <input
              name="description"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              maxLength={200}
              placeholder="Write at least 6 words about this site"
              aria-label={`Description for ${row.name}`}
              className={`input ${FIELD}`}
            />
            <span className={`mt-1.5 block text-xs ${ready ? "text-emerald-700" : "text-stone-400"}`}>
              {words} words · at least 6
            </span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <ChoiceField label="Category" name="category" value={category} options={CATEGORIES} onChange={setCategory} />
            <ChoiceField label="Status" name="status" value={status} options={STATUSES} onChange={setStatus} />
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-stone-300">Chart</span>
            <select name="chart" value={chart} onChange={(event) => setChart(event.target.value)} className={`select ${FIELD}`}>
              {CHARTS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-start justify-between gap-3">
            <span>
              <span className="block text-sm text-stone-300">Anonymous</span>
              <span className="mt-0.5 block text-xs leading-5 text-stone-400">
                The public page shows only the traffic graph. The site name, address, and logo stay hidden.
              </span>
            </span>
            <input
              type="checkbox"
              name="anonymous"
              checked={anonymous}
              onChange={(event) => setAnonymous(event.target.checked)}
              className="toggle toggle-xs"
            />
          </label>

          <button type="submit" disabled={isPending || !ready} className={SAVE_BUTTON}>
            {busy && <span className="loading loading-spinner loading-xs" />}
            {row.added ? "Save" : "Add"}
          </button>
        </div>
      </form>
      {row.added && (
        <form className="mt-3 sm:pl-[52px]" action={formAction} onSubmit={() => onSubmit(removeKey)}>
          <input type="hidden" name="intent" value="remove" />
          <input type="hidden" name="property" value={row.property} />
          <button type="submit" disabled={isPending} className={OUTLINE_BUTTON}>
            {removing && <span className="loading loading-spinner loading-xs" />}
            Remove
          </button>
        </form>
      )}
    </li>
  );
}

function previewCard(site, draft) {
  const anonymous = draft?.anonymous ?? Boolean(site.anonymous);
  const status = draft?.status ?? site.status ?? "";
  const showStatus = draft ? Boolean(status) : Boolean(site.show_status);
  return {
    id: site.id,
    anonymous,
    name: site.name,
    description: draft?.description ?? site.description ?? "",
    logoUrl: draft?.logoUrl ?? site.logo_url ?? "",
    category: draft?.category ?? site.category ?? "",
    status: showStatus ? status : "",
    chart: draft?.chart ?? site.chart ?? "area",
    days: site.days ?? [],
  };
}

export default function SitesManager({ connection, properties, sites, profile, notice }) {
  const [state, formAction, isPending] = useActionState(updateSites, null);
  const [pendingKey, setPendingKey] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const reportDraft = useCallback((property, draft) => {
    setDrafts((current) => ({ ...current, [property]: draft }));
  }, []);

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
  const previewSites = sites.map((site) => previewCard(site, drafts[site.property]));

  function preview() {
    return (
      <PagePhone
        profile={profile}
        page={profile.page}
        text={profile.text}
        share={profile.share}
        font={profile.font}
        clicks={profile.chartClicks}
        impressions={profile.chartImpressions}
        card={profile.card}
        sites={previewSites}
      />
    );
  }

  return (
    <div className="grid items-start gap-6 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:pb-0">
      <div className="space-y-6">
      {message && <Notice type={message.type}>{message.text}</Notice>}

      <div className={CARD}>
        <div className="card-body gap-0 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-lg font-bold text-white">Google Search Console</p>
              {connection ? (
                <p className="mt-1 flex items-center gap-2 text-sm text-stone-300">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${isConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
                  <span className="truncate">
                    {isConnected ? "Connected" : "Needs attention"}
                    {connection.email && ` as ${connection.email}`}
                  </span>
                </p>
              ) : (
                <p className="mt-1 text-sm leading-6 text-stone-300">
                  Connect your Google account to show real clicks and impressions. pagzi.online only gets read-only access.
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
          <div className="border-b border-white/10 pb-5">
            <p className="text-lg font-bold text-white">Your sites</p>
            <p className="mt-1 text-sm text-stone-300">
              Add a short description, a logo, a category, and a status for each site.
            </p>
          </div>

          {rows.length > 0 ? (
            <ul className="divide-y divide-stone-100">
              {rows.map((row) => (
                <SiteRow
                  key={`${row.property}:${row.description ?? ""}:${row.category ?? ""}:${row.status ?? ""}:${row.chart ?? "area"}:${row.anonymous ?? false}:${row.logo_url ?? ""}`}
                  row={row}
                  isPending={isPending}
                  pendingKey={pendingKey}
                  formAction={formAction}
                  onSubmit={setPendingKey}
                  onDraft={reportDraft}
                />
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm leading-6 text-stone-300">
              {isConnected ? (
                <>
                  No verified sites found in this Google account.{" "}
                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link font-medium text-stone-200"
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

      <div className="sticky top-6 hidden justify-center lg:flex">{preview()}</div>

      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="fixed bottom-5 left-1/2 z-30 inline-flex -translate-x-1/2 items-center gap-2 rounded-xl bg-stone-700 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-lg lg:hidden"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
        Preview
      </button>

      {previewOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/70 p-4 lg:hidden">
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setPreviewOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-[#1F1F1F] px-3 py-1.5 text-sm font-semibold text-white"
          >
            Close
          </button>
          <div className="max-h-full overflow-y-auto">{preview()}</div>
        </div>
      )}
    </div>
  );
}
