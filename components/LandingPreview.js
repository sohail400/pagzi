"use client";

import { useEffect, useState } from "react";
import PagePhone from "@/components/PagePhone";
import { CHART_PRESETS, isDarkHex } from "@/lib/style";

const ON_LIGHT = CHART_PRESETS.filter((preset) => isDarkHex(preset.clicks) && isDarkHex(preset.impressions));

const ON_DARK = [
  CHART_PRESETS.find((preset) => preset.id === "classic"),
  CHART_PRESETS.find((preset) => preset.id === "forest"),
  { id: "lime", name: "Lime & Gold", clicks: "#A3E635", impressions: "#F59E0B" },
  { id: "cyan", name: "Cyan & Orange", clicks: "#06B6D4", impressions: "#F97316" },
  { id: "violet", name: "Purple & White", clicks: "#8B5CF6", impressions: "#FFFFFF" },
];

function graphPreset(card, index) {
  const presets = isDarkHex(card) ? ON_DARK : ON_LIGHT;
  return presets[index % presets.length];
}

const CHARTS = [
  { id: "area", label: "Area" },
  { id: "line", label: "Line" },
  { id: "bar", label: "Bar" },
  { id: "combined", label: "Combined" },
];

const LOOKS = [
  {
    name: "White & Gray",
    page: "#F4F4F5",
    text: "#3F3F46",
    share: "#A1A1AA",
    card: "#FFFFFF",
  },
  {
    name: "Black & White",
    page: "#111111",
    text: "#FAFAFA",
    share: "#FFFFFF",
    card: "#1C1C1C",
  },
  {
    name: "Black & Purple",
    page: "#0C0A12",
    text: "#F5F3FF",
    share: "#8B5CF6",
    card: "#17141F",
  },
  {
    name: "Orange & White",
    page: "#FFFFFF",
    text: "#1C1917",
    share: "#F97316",
    card: "#FFF7ED",
  },
  {
    name: "Blue Gradient",
    page: "#0F172A",
    background: "linear-gradient(165deg, #1D4ED8 0%, #0F172A 58%, #38BDF8 130%)",
    text: "#F8FAFC",
    share: "#38BDF8",
    card: "#0F172A",
  },
  {
    name: "Purple Gradient",
    page: "#1E1B4B",
    background: "linear-gradient(165deg, #6D28D9 0%, #1E1B4B 55%, #E879F9 130%)",
    text: "#FAF5FF",
    share: "#E879F9",
    card: "#1E1B4B",
  },
];

export default function LandingPreview({ profile, sites, sampleCharts = false, font = "inter" }) {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = setInterval(() => setStep((current) => current + 1), 1600);
    return () => clearInterval(timer);
  }, [paused]);

  if (!profile) return null;

  const look = LOOKS[step % LOOKS.length];
  const chart = CHARTS[step % CHARTS.length];
  const preset = graphPreset(look.card, step);
  const shown = sites.map((site) => ({ ...site, chart: chart.id }));

  function hold(next) {
    setPaused(next);
  }

  function phone() {
    return (
      <div
        key={step}
        className="preview-in"
        onPointerEnter={() => hold(true)}
        onPointerLeave={() => hold(false)}
      >
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
          {look.name} · {chart.label}
        </p>
        <div className="landing-phone mx-auto w-full max-w-[22rem]">
          <PagePhone
            profile={profile}
            page={look.page}
            background={look.background}
            text={look.text}
            share={look.share}
            font={font}
            clicks={preset.clicks}
            impressions={preset.impressions}
            card={look.card}
            sites={shown}
            compact
          />
        </div>
        {sampleCharts && (
          <p className="mt-3 text-center text-xs text-stone-500">Sample chart numbers</p>
        )}
      </div>
    );
  }

  return <div className="order-2 flex justify-center lg:order-1">{phone()}</div>;
}
