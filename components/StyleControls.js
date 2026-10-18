"use client";

import { useEffect, useRef, useState } from "react";
import { CHARTS } from "@/lib/site-fields";
import { FONTS, THEMES, fontOf, normalizeHex, sameHex, themeOf } from "@/lib/style";

export function FontPicker({ font, onChange }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const current = fontOf(font);

  useEffect(() => {
    if (!open) return undefined;
    function close(event) {
      if (!panelRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">Font</p>
      <button
        type="button"
        aria-expanded={open}
        aria-label={`Font, ${current.label}`}
        onClick={() => setOpen((value) => !value)}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 text-2xl font-medium text-white"
        style={{ fontFamily: current.family }}
      >
        Aa
      </button>
      {open && (
        <div className="absolute z-20 mt-2 max-h-64 w-[17.5rem] overflow-y-auto rounded-2xl bg-stone-900 p-3 shadow-xl">
          <div className="grid grid-cols-4 gap-2">
            {FONTS.map((item) => {
              const selected = font === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  aria-label={item.label}
                  aria-pressed={selected}
                  onClick={() => onChange(item.id)}
                  className={`flex h-14 items-center justify-center rounded-xl bg-stone-800 text-xl text-white ${
                    selected ? "ring-2 ring-blue-500" : "hover:bg-stone-700"
                  }`}
                  style={{ fontFamily: item.family }}
                >
                  Aa
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function ColorField({ label, name, value, swatches, onChange }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-stone-300">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        {swatches.map((swatch) => (
          <button
            key={swatch}
            type="button"
            aria-label={swatch}
            aria-pressed={sameHex(value, swatch)}
            onClick={() => onChange(swatch)}
            className={`h-8 w-8 rounded-full border ${sameHex(value, swatch) ? "border-stone-900 ring-2 ring-stone-900 ring-offset-2" : "border-stone-200"}`}
            style={{ backgroundColor: swatch }}
          />
        ))}
        <label className="ml-1 flex items-center gap-2 text-xs text-stone-300">
          <input
            type="color"
            aria-label={`${label} custom color`}
            value={normalizeHex(value) || "#FFFFFF"}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            className="h-8 w-8 cursor-pointer rounded-full border border-stone-200 bg-white p-0.5"
          />
          Custom
        </label>
      </div>
      <input type="hidden" name={name} value={normalizeHex(value) || ""} />
    </div>
  );
}

export function ThemeSwatch({ page, text, share, large = false }) {
  return (
    <span className={`flex overflow-hidden rounded-xl ${large ? "h-14 w-[4.5rem]" : "h-10 w-16"}`}>
      <span className="h-full flex-1" style={{ backgroundColor: page }} />
      <span className="h-full flex-1" style={{ backgroundColor: text }} />
      <span className="h-full flex-1" style={{ backgroundColor: share }} />
    </span>
  );
}

export function ThemeGrid({ page, text, share, onChange, className }) {
  const selected = themeOf(page, text, share);
  return (
    <div className={className || "grid max-h-72 grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-5"}>
      {THEMES.map((theme) => {
        const active = selected?.id === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            aria-label={`${theme.id} theme`}
            aria-pressed={active}
            onClick={() => onChange(theme)}
            className={`rounded-xl p-1 ${active ? "ring-2 ring-blue-400" : "hover:bg-white/5"}`}
          >
            <ThemeSwatch page={theme.page} text={theme.text} share={theme.share} />
          </button>
        );
      })}
    </div>
  );
}

export function ChartSelect({ value, onChange, className }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-stone-300">Chart</span>
      <select
        name="chart"
        aria-label="Chart"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={className}
      >
        {CHARTS.map(([option, label]) => (
          <option key={option} value={option}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
