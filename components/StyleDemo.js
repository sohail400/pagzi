"use client";

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { startDemoClock } from "@/components/demoClock";
import PagePhone from "@/components/PagePhone";
import { ChartSelect, ColorField, FontPicker, ThemeGrid, ThemeSwatch } from "@/components/StyleControls";
import { CARD_SWATCHES, STYLE_DEFAULTS } from "@/lib/style";

const SELECT_CLASS =
  "select h-10 w-full rounded-xl border border-white/15 bg-[#1F1F1F] px-3 text-sm text-stone-100 focus:border-stone-400 focus:outline-none";

const STEPS = [
  { at: 1800, selector: '[aria-label="white theme"]' },
  { at: 3800, selector: 'select[aria-label="Chart"]', value: "line" },
  { at: 5600, selector: 'select[aria-label="Chart"]', value: "bar" },
  { at: 7400, selector: 'select[aria-label="Chart"]', value: "combined" },
  { at: 9200, selector: 'select[aria-label="Chart"]', value: "area" },
  { at: 11000, selector: '[data-card-colors] [aria-label="#FFF7ED"]' },
  { at: 12800, selector: '[data-card-colors] [aria-label="#111827"]' },
  { at: 14600, selector: 'button[aria-label^="Font,"]' },
  { at: 16400, selector: '[aria-label="Fraunces"]', closeFont: true },
  { at: 18400, selector: '[aria-label="ink theme"]' },
  { at: 20200, selector: '[aria-label="plum theme"]' },
  { at: 22000, selector: '[aria-label="orange theme"]' },
  { at: 23800, selector: '[aria-label="white theme"]' },
];

const END = 28000;
const SPEED = 2;

function clock(ms) {
  const total = Math.min(END, Math.max(0, Math.round(ms / 1000)));
  return `0:${String(total).padStart(2, "0")}`;
}

function baseStyle(style, chart) {
  return {
    page: style?.page || STYLE_DEFAULTS.page,
    text: style?.text || STYLE_DEFAULTS.text,
    share: style?.share || STYLE_DEFAULTS.share,
    card: style?.card || STYLE_DEFAULTS.card,
    font: style?.font || STYLE_DEFAULTS.font,
    clicks: style?.chartClicks || STYLE_DEFAULTS.chartClicks,
    impressions: style?.chartImpressions || STYLE_DEFAULTS.chartImpressions,
    chart: chart || "area",
  };
}

const StyleStage = memo(function StyleStage({ profile, site, initial, sample }) {
  const [page, setPage] = useState(initial.page);
  const [text, setText] = useState(initial.text);
  const [share, setShare] = useState(initial.share);
  const [card, setCard] = useState(initial.card);
  const [font, setFont] = useState(initial.font);
  const [chart, setChart] = useState(initial.chart);
  const shown = useMemo(
    () => (site ? [{ ...site, chart }] : []),
    [site, chart]
  );

  function chooseTheme(theme) {
    setPage(theme.page);
    setText(theme.text);
    setShare(theme.share);
  }

  return (
    <div inert className="pointer-events-none grid items-start gap-5 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] md:gap-4">
      <div className="order-2 min-w-0 space-y-4 md:order-1">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">Theme</p>
          <div className="mb-3 inline-flex rounded-2xl bg-stone-900 p-2">
            <ThemeSwatch page={page} text={text} share={share} large />
          </div>
          <ThemeGrid page={page} text={text} share={share} onChange={chooseTheme} className="grid max-h-28 grid-cols-4 gap-2 overflow-y-auto pr-1 sm:max-h-36" />
        </div>
        <ChartSelect value={chart} onChange={setChart} className={SELECT_CLASS} />
        <div data-card-colors>
          <ColorField label="Card background" name="card" value={card} swatches={CARD_SWATCHES} onChange={setCard} />
        </div>
        <FontPicker font={font} onChange={setFont} />
      </div>
      <div className="landing-phone order-1 mx-auto w-full max-w-[16.5rem] md:order-2 md:max-w-[17.5rem]">
        <PagePhone
          profile={profile}
          page={page}
          text={text}
          share={share}
          font={font}
          clicks={initial.clicks}
          impressions={initial.impressions}
          card={card}
          sites={shown}
          compact
        />
        {sample && <p className="mt-2 text-center text-xs text-stone-500">Sample chart numbers</p>}
      </div>
    </div>
  );
});

export default function StyleDemo({ profile, site, style }) {
  const stageRef = useRef(null);
  const applied = useRef(-1);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [cycle, setCycle] = useState(0);
  const [cursor, setCursor] = useState({ x: 28, y: 36 });
  const initial = useMemo(() => baseStyle(style, site?.chart), [style, site]);

  useEffect(() => {
    if (!playing) return undefined;
    return startDemoClock(stageRef, (step) => {
      setElapsed((current) => (current + step * SPEED >= END ? 0 : current + step * SPEED));
    });
  }, [playing]);

  const wrapped = useRef(0);
  useEffect(() => {
    if (elapsed < wrapped.current) {
      applied.current = -1;
      setCycle((value) => value + 1);
    }
    wrapped.current = elapsed;
  }, [elapsed]);

  useEffect(() => {
    const root = stageRef.current;
    if (!root) return;
    for (let index = applied.current + 1; index < STEPS.length; index += 1) {
      const step = STEPS[index];
      if (elapsed < step.at) break;
      const node = root.querySelector(step.selector);
      if (node) {
        const scroller = node.closest(".overflow-y-auto");
        if (scroller) {
          const top = node.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
          scroller.scrollTop += top - 8;
        }
        if (step.value) {
          const tracker = node._valueTracker;
          if (tracker) tracker.setValue("");
          node.value = step.value;
          node.dispatchEvent(new Event("change", { bubbles: true }));
        } else {
          node.click();
        }
        if (step.closeFont) document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      }
      applied.current = index;
    }
  }, [elapsed, cycle]);

  const aim = STEPS.find((step) => step.at > elapsed - 650) || STEPS[STEPS.length - 1];

  useLayoutEffect(() => {
    const root = stageRef.current;
    const node = root?.querySelector(aim?.selector);
    if (!root || !node) return;
    const field = node.getBoundingClientRect();
    const box = root.getBoundingClientRect();
    setCursor({
      x: field.left - box.left + Math.min(28, field.width * 0.45),
      y: field.top - box.top + field.height / 2,
    });
  }, [aim, cycle, elapsed > aim.at]);

  const clicking = aim && elapsed >= aim.at && elapsed < aim.at + 180;

  return (
    <div>
      <div ref={stageRef} className="relative p-4 sm:p-5" aria-hidden="true">
        <p className="mb-3 text-xs text-stone-500">Preview only. This does not change a saved style.</p>
        <StyleStage key={cycle} profile={profile} site={site} initial={initial} sample={Boolean(site?.sample)} />
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="pointer-events-none absolute z-30 h-7 w-7 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]"
            style={{
              left: 0,
              top: 0,
              transform: `translate(${cursor.x}px, ${cursor.y}px) scale(${clicking ? 0.85 : 1})`,
              transition: "transform 500ms ease",
            }}
          >
            <path fill="#fff" stroke="#1F1F1F" strokeWidth="1.2" d="M5 3l10 14-4 1 2 5-2 1-2-5-4 3z" />
          </svg>
      </div>
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setPlaying((current) => !current)}
          className="btn btn-sm h-10 min-h-10 rounded-full border-white/15 bg-transparent px-4 text-xs font-semibold text-stone-100"
          aria-pressed={playing}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[#ff4fa3]" style={{ width: `${(elapsed / END) * 100}%` }} />
        </div>
        <span className="shrink-0 text-xs tabular-nums text-stone-400">
          {clock(elapsed)} / {clock(END)}
        </span>
        <button
          type="button"
          onClick={() => {
            applied.current = -1;
            setCycle((value) => value + 1);
            setElapsed(0);
            setPlaying(true);
          }}
          className="btn btn-sm h-10 min-h-10 rounded-full border-white/15 bg-transparent px-4 text-xs font-semibold text-stone-100"
        >
          Replay
        </button>
      </div>
    </div>
  );
}
