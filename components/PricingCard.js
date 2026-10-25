"use client";

import Link from "next/link";
import { useState } from "react";
import { PLAN_OPTIONS, formatPrice } from "@/lib/plans";

const FEATURES = [
  "Build trust with verified Google Search Console data",
  "Get a dofollow backlink to your website",
  "Updates automatically",
  "Share your indie hacking journey",
  "Customize your charts, colors and fonts",
  "Use your own custom domain",
  "24 themes and 13 fonts",
];

const BADGES = {
  early: { label: "Limited", filled: false },
  lifetime: { label: "Best value", filled: true },
};

function Check() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#ff4fa3]">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12.5 9.2 17 19 7"
      />
    </svg>
  );
}

export default function PricingCard({ earlyLeft, earlyLimit, soldOut }) {
  const [planId, setPlanId] = useState("year");
  const chosen = PLAN_OPTIONS.find((plan) => plan.id === planId) || PLAN_OPTIONS[1];
  const blocked = (chosen.id === "early" && soldOut) || (chosen.id === "lifetime" && !soldOut);
  const spotsLeft = Math.max(0, Math.min(earlyLeft, earlyLimit || 0));
  const spotsShare = earlyLimit > 0 ? (spotsLeft / earlyLimit) * 100 : 0;

  return (
    <div className="mx-auto mt-12 max-w-xl rounded-xl border border-white/10 bg-black p-3 text-white sm:p-4">
      <div className="space-y-3">
        {PLAN_OPTIONS.map((plan) => {
          const selected = plan.id === planId;
          const disabled = (plan.id === "early" && soldOut) || (plan.id === "lifetime" && !soldOut);
          const badge = BADGES[plan.id];
          const detail = plan.id === "lifetime" && !soldOut ? "Opens after the launch spots sell out." : plan.detail;
          return (
            <button
              key={plan.id}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => setPlanId(plan.id)}
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-4 text-left ${
                selected ? "border-white/25 bg-white/[0.03]" : "border-white/10"
              } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                  selected ? "border-[#ff4fa3]" : "border-white"
                }`}
              >
                {selected && <span className="h-2.5 w-2.5 rounded-full bg-[#ff4fa3]" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#ff4fa3]">{plan.name}</span>
                  {badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        badge.filled
                          ? "bg-[#ff4fa3] text-white"
                          : "border border-[#ff4fa3] text-[#ff4fa3]"
                      }`}
                    >
                      {badge.label}
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-sm leading-5 text-white">{detail}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end">
                <span className="text-3xl font-semibold tracking-tight text-white">${formatPrice(plan.price)}</span>
                {plan.id === "early" && (
                  <span className="mt-2 w-16">
                    <span className="block h-1 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
                      <span className="block h-full rounded-full bg-[#ff4fa3]" style={{ width: `${spotsShare}%` }} />
                    </span>
                    <span className="mt-1 block text-right text-[10px] leading-none text-stone-400">
                      {soldOut ? "Sold out" : `${spotsLeft} of ${earlyLimit} left`}
                    </span>
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mx-3 mt-5 border-t border-white/10 pt-5">
        <p className="text-lg font-bold text-white">What you get</p>
        <ul className="mt-4 space-y-2.5">
          {FEATURES.map((line) => (
            <li key={line} className="flex items-start gap-2.5 text-sm leading-6 text-white">
              <Check />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        {blocked ? (
          <button
            type="button"
            disabled
            className="btn btn-save mt-6 h-12 w-full cursor-not-allowed rounded-xl border-0 px-7 font-semibold text-white shadow-none"
          >
            Get my page
          </button>
        ) : (
          <Link
            href={`/signup?plan=${chosen.id}`}
            className="btn btn-save mt-6 h-12 w-full rounded-xl border-0 px-7 font-semibold text-white shadow-none"
          >
            Get my page
          </Link>
        )}
      </div>
    </div>
  );
}
