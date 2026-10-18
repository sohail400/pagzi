"use client";

import { useActionState, useState } from "react";
import PagePhone from "@/components/PagePhone";
import { ColorField, FontPicker, ThemeGrid, ThemeSwatch } from "@/components/StyleControls";
import { CARD_SWATCHES, CHART_PRESETS, normalizeHex, presetFor } from "@/lib/style";
import { updateStyle } from "./actions";

const CARD = "card rounded-3xl border border-white/10 bg-[#1F1F1F]";

export default function StyleEditor({ saved, sites }) {
  const [state, formAction, pending] = useActionState(updateStyle, null);
  const [clicks, setClicks] = useState(saved.chartClicks);
  const [impressions, setImpressions] = useState(saved.chartImpressions);
  const [font, setFont] = useState(saved.font);
  const [card, setCard] = useState(saved.card);
  const [page, setPage] = useState(saved.page);
  const [text, setText] = useState(saved.text);
  const [share, setShare] = useState(saved.share);
  const [previewOpen, setPreviewOpen] = useState(false);
  const selected = presetFor(clicks, impressions);
  function preview() {
    return (
      <PagePhone
        profile={saved}
        page={page}
        text={text}
        share={share}
        font={font}
        clicks={clicks}
        impressions={impressions}
        card={card}
        sites={sites}
        sample
      />
    );
  }

  function chooseTheme(theme) {
    setPage(theme.page);
    setText(theme.text);
    setShare(theme.share);
  }

  function choosePreset(preset) {
    setClicks(preset.clicks);
    setImpressions(preset.impressions);
  }

  return (
    <form action={formAction} className="grid items-start gap-6 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:pb-0">
      <div className="space-y-6">
        {state?.error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p role="status" className="rounded-xl border border-[#ff4fa3] bg-[#ff4fa3] px-4 py-3 text-sm text-white">
            Saved. Your public page is using this style.
          </p>
        )}

        <section className={CARD}>
          <div className="card-body gap-4 p-5 sm:p-7">
            <p className="text-lg font-bold text-white">Chart color</p>
            <div className="flex flex-wrap gap-2">
              {CHART_PRESETS.map((preset) => {
                const active = selected?.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-label={preset.name}
                    aria-pressed={active}
                    onClick={() => choosePreset(preset)}
                    className={`flex overflow-hidden rounded-xl border ${active ? "border-stone-900 ring-2 ring-stone-900" : "border-stone-200"}`}
                  >
                    <span className="h-10 w-8" style={{ backgroundColor: preset.clicks }} />
                    <span className="h-10 w-8 border-l border-white/30" style={{ backgroundColor: preset.impressions }} />
                  </button>
                );
              })}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-stone-300">Custom clicks</span>
                <input
                  type="color"
                  value={normalizeHex(clicks) || "#2563EB"}
                  onChange={(event) => setClicks(event.target.value.toUpperCase())}
                  className="h-10 w-full cursor-pointer rounded-xl border border-stone-300 bg-white p-1"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-stone-300">Custom impressions</span>
                <input
                  type="color"
                  value={normalizeHex(impressions) || "#F97316"}
                  onChange={(event) => setImpressions(event.target.value.toUpperCase())}
                  className="h-10 w-full cursor-pointer rounded-xl border border-stone-300 bg-white p-1"
                />
              </label>
            </div>
            <input type="hidden" name="chartClicks" value={normalizeHex(clicks) || ""} />
            <input type="hidden" name="impressions" value={normalizeHex(impressions) || ""} />
          </div>
        </section>

        <section className={CARD}>
          <div className="card-body p-5 sm:p-7">
            <FontPicker font={font} onChange={setFont} />
            <input type="hidden" name="font" value={font} />
          </div>
        </section>

        <section className={CARD}>
          <div className="card-body gap-5 p-5 sm:p-7">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">Theme</p>
              <div className="inline-flex rounded-2xl bg-stone-900 p-2">
                <ThemeSwatch page={page} text={text} share={share} large />
              </div>
            </div>
            <ThemeGrid page={page} text={text} share={share} onChange={chooseTheme} />
            <input type="hidden" name="page" value={normalizeHex(page) || ""} />
            <input type="hidden" name="text" value={normalizeHex(text) || ""} />
            <input type="hidden" name="share" value={normalizeHex(share) || ""} />
            <ColorField label="Card background" name="card" value={card} swatches={CARD_SWATCHES} onChange={setCard} />
          </div>
        </section>

        <button
          type="submit"
          disabled={pending}
          className="btn btn-save h-10 rounded-xl border-0 px-5 font-semibold text-white shadow-none"
        >
          {pending && <span className="loading loading-spinner loading-xs" />}
          Save style
        </button>
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
            className="absolute right-4 top-4 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-stone-900"
          >
            Close
          </button>
          <div className="max-h-full overflow-y-auto">{preview()}</div>
        </div>
      )}
    </form>
  );
}
