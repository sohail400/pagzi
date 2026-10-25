"use client";

import { useActionState, useEffect, useState } from "react";
import { logout } from "@/app/auth/actions";
import { openBillingPortal } from "@/app/billing/actions";
import LiveUpdateDialog from "@/components/LiveUpdateDialog";
import PayButton from "@/components/PayButton";
import { APP_DOMAIN, dnsName } from "@/lib/custom-domain";
import { LAUNCH_DEAL_SPOTS, PLAN_OPTIONS, formatPrice } from "@/lib/plans";
import { deleteAccount, updateCustomDomain, updateUsername } from "./actions";

const CARD = "rounded-2xl bg-[#2A2A2A] px-6 py-6";
const FIELD =
  "input h-11 min-w-0 flex-1 rounded-lg border border-white/10 bg-[#1A1A1A] px-4 text-sm text-stone-200 shadow-none focus:border-stone-500 focus:outline-none";
const SAVE_BUTTON =
  "btn btn-save h-11 shrink-0 rounded-xl border-0 px-4 text-xs font-semibold uppercase tracking-wider text-white shadow-none";

function Tab({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full border border-white/25 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white"
          : "px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 hover:text-stone-200"
      }
    >
      {children}
    </button>
  );
}

function Billing({
  paid,
  builder,
  plan,
  planName,
  expiresLabel,
  earlyLeft,
  earlySoldOut,
  selectedPlan,
  hasReceipts,
}) {
  const [portalState, portalAction, portalPending] = useActionState(openBillingPortal, null);
  const status = builder
    ? "Builder account. No payment needed."
    : plan === "year" && expiresLabel
      ? `${planName} is active until ${expiresLabel}.`
      : planName
        ? `${planName}. This page is yours.`
        : "Paid. This page is yours.";

  return (
    <section className={CARD}>
      <p className="text-lg font-semibold text-white">Billing information</p>
      <p className="mt-2 text-sm leading-6 text-stone-400">One-time payment. No subscription.</p>
      {paid ? (
        <p className="mt-6 text-sm font-medium text-emerald-300">{status}</p>
      ) : (
        <div className="mt-6 space-y-5">
          {plan === "year" && expiresLabel && (
            <p className="text-sm leading-6 text-stone-300">Your 1-Year Pass ended on {expiresLabel}.</p>
          )}
          {PLAN_OPTIONS.map((option) => {
            const soldOut = option.id === "early" && earlySoldOut;
            const closed = option.id === "lifetime" && !earlySoldOut;
            const selected = selectedPlan === option.id;
            const detail = closed ? "Opens after the launch spots sell out." : option.detail;
            return (
              <div
                key={option.id}
                className={`rounded-xl border px-4 py-4 ${selected ? "border-[#ff4fa3]" : "border-white/10"}`}
              >
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-stone-200">{option.name}</p>
                    <p className="mt-1 text-sm text-stone-400">{detail}</p>
                    {option.id === "early" && (
                      <p className="mt-1 text-sm text-stone-400">
                        {soldOut ? "Sold out" : `${earlyLeft} of ${LAUNCH_DEAL_SPOTS} spots left`}
                      </p>
                    )}
                  </div>
                  <p className="text-3xl font-bold tracking-tight text-white">${formatPrice(option.price)}</p>
                </div>
                {soldOut || closed ? (
                  <button
                    type="button"
                    disabled
                    className="btn btn-save mt-4 h-11 w-full cursor-not-allowed rounded-xl border-0 text-sm font-semibold text-white shadow-none"
                  >
                    {soldOut ? "Sold out" : "Not open yet"}
                  </button>
                ) : (
                  <PayButton
                    plan={option.id}
                    label={`Pay $${formatPrice(option.price)}`}
                    className="btn btn-save mt-4 h-11 w-full rounded-xl border-0 text-sm font-semibold text-white shadow-none"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
      {hasReceipts && (
        <form action={portalAction} className="mt-6">
          <button type="submit" disabled={portalPending} className="text-xs font-semibold uppercase tracking-wider text-stone-200 hover:text-white">
            {portalPending ? "Opening receipts…" : "Receipts"}
          </button>
          {portalState?.error && <p className="mt-3 text-sm text-red-300">{portalState.error}</p>}
        </form>
      )}
    </section>
  );
}

function Notice({ error, success }) {
  if (error) return <p className="mt-3 text-sm text-red-300">{error}</p>;
  if (success) return <p className="mt-3 text-sm text-emerald-300">Saved.</p>;
  return null;
}

export default function SettingsPanel({
  username,
  customDomain,
  paid = false,
  builder = false,
  checkout = "",
  plan = "",
  planName = "",
  expiresLabel = "",
  earlyLeft = 0,
  earlySoldOut = false,
  selectedPlan = "",
  hasReceipts = false,
}) {
  const [tab, setTab] = useState(checkout || selectedPlan ? "billing" : "account");
  const [nameState, nameAction, namePending] = useActionState(updateUsername, null);
  const [domainState, domainAction, domainPending] = useActionState(updateCustomDomain, null);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteAccount, null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liveNotice, setLiveNotice] = useState(false);
  const currentUsername = nameState?.username || username || "";
  const pageAddress = `pagzi.online/${currentUsername || "username"}`;
  const savedDomain = domainState?.success ? domainState.domain : customDomain;

  useEffect(() => {
    if ((nameState?.success && nameState.live) || (domainState?.success && domainState.live)) setLiveNotice(true);
  }, [nameState, domainState]);

  async function copyAddress() {
    if (!currentUsername) return;
    try {
      await navigator.clipboard.writeText(`https://${pageAddress}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <LiveUpdateDialog open={liveNotice && !namePending && !domainPending} onClose={() => setLiveNotice(false)} />
      <div className="mb-8 flex items-center justify-center gap-5">
        <Tab active={tab === "account"} onClick={() => setTab("account")}>
          Account
        </Tab>
        <Tab active={tab === "billing"} onClick={() => setTab("billing")}>
          Billing
        </Tab>
      </div>

      {checkout === "return" && (
        <p className="mb-6 text-sm leading-6 text-stone-300">
          If the payment went through, this page updates as soon as Dodo confirms it. Refresh in a moment.
        </p>
      )}
      {checkout === "required" && (
        <p className="mb-6 text-sm leading-6 text-stone-300">
          Choose a price to publish your page and use the profile, sites, and style tools.
        </p>
      )}
      {checkout === "paid" && <p className="mb-6 text-sm leading-6 text-emerald-300">This page is already paid.</p>}
      {checkout === "builder" && (
        <p className="mb-6 text-sm leading-6 text-emerald-300">This builder account does not need a payment.</p>
      )}

      {tab === "account" ? (
        <div className="space-y-5">
          <form action={nameAction} className={CARD}>
            <p className="text-lg font-semibold text-white">Change username</p>
            <div className="mt-5 flex items-center gap-3">
              <input
                key={currentUsername}
                name="username"
                defaultValue={currentUsername}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Username"
                className={FIELD}
              />
              <button type="submit" disabled={namePending} className={SAVE_BUTTON}>
                {namePending ? "..." : "Update"}
              </button>
            </div>
            <Notice error={nameState?.error} success={nameState?.success} />
          </form>

          <section className={CARD}>
            <p className="text-lg font-semibold text-white">pagzi.online domain</p>
            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="truncate text-sm text-stone-400">{pageAddress}</p>
              <button
                type="button"
                onClick={copyAddress}
                disabled={!currentUsername}
                className="text-xs font-semibold uppercase tracking-wider text-stone-200 hover:text-white disabled:text-stone-500"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </section>

          <form action={domainAction} className={CARD}>
            <p className="text-lg font-semibold text-white">Custom domain</p>
            <div className="mt-5 flex items-center gap-3">
              <input
                key={domainState?.success ? domainState.domain : customDomain}
                name="domain"
                defaultValue={domainState?.domain ?? customDomain}
                placeholder="yourdomain.com"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Custom domain"
                className={FIELD}
              />
              <button
                type="submit"
                disabled={domainPending}
                className={`${SAVE_BUTTON} px-5`}
              >
                {domainPending ? "..." : "Save"}
              </button>
            </div>
            <Notice error={domainState?.error} success={domainState?.success} />
            {savedDomain && (
              <div className="mt-5 rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-4 text-sm leading-6 text-stone-300">
                <p>Add this DNS record at the place you bought the domain. The page then opens at https://{savedDomain}.</p>
                <dl className="mt-3 space-y-1 text-stone-200">
                  <div className="flex gap-3"><dt className="w-14 text-stone-500">Type</dt><dd>CNAME</dd></div>
                  <div className="flex gap-3"><dt className="w-14 text-stone-500">Name</dt><dd>{dnsName(savedDomain)}</dd></div>
                  <div className="flex gap-3"><dt className="w-14 text-stone-500">Value</dt><dd>{APP_DOMAIN}</dd></div>
                </dl>
                <p className="mt-3 text-xs leading-5 text-stone-400">
                  A root domain such as example.com needs an ALIAS or CNAME-flattening record, because many providers reject a CNAME on @. A name like www can use a normal CNAME. HTTPS starts working after the same domain is connected to the host that serves {APP_DOMAIN}.
                </p>
              </div>
            )}
          </form>

          <div className="flex items-center justify-end gap-6 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-xs font-semibold uppercase tracking-wider text-white"
            >
              Delete
            </button>
            <form action={logout}>
              <button type="submit" className="text-xs font-semibold uppercase tracking-wider text-white">
                Logout
              </button>
            </form>
          </div>
          {confirmingDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <form action={deleteAction} className="w-full max-w-md rounded-2xl bg-[#2A2A2A] p-6" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
                <p id="delete-account-title" className="text-lg font-semibold text-white">Delete account</p>
                <p className="mt-2 text-sm leading-6 text-stone-300">
                  This permanently removes your page, sites, and sign-in. This cannot be undone.
                </p>
                {deleteState?.error && <p className="mt-3 text-sm text-red-300">{deleteState.error}</p>}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    disabled={deletePending}
                    className="btn h-10 rounded-lg border border-white/15 bg-transparent px-4 text-sm font-semibold text-stone-200 shadow-none hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={deletePending}
                    className="btn h-10 rounded-lg border-0 bg-red-600 px-4 text-sm font-semibold text-white shadow-none hover:bg-red-500 disabled:bg-red-900"
                  >
                    {deletePending ? "Deleting…" : "Delete account"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        <Billing
          paid={paid}
          builder={builder}
          plan={plan}
          planName={planName}
          expiresLabel={expiresLabel}
          earlyLeft={earlyLeft}
          earlySoldOut={earlySoldOut}
          selectedPlan={selectedPlan}
          hasReceipts={hasReceipts}
        />
      )}
    </div>
  );
}
