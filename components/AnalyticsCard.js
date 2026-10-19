"use client";

import { useEffect, useRef, useState } from "react";
import SiteLogo from "@/components/SiteLogo";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { CHART_VALUES } from "@/lib/site-fields";
import { isDarkHex } from "@/lib/style";

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
);

const RANGES = [
  { days: 28, label: "28d" },
  { days: 90, label: "90d" },
  { days: 183, label: "6m" },
  { days: 365, label: "12m" },
];

const RANGE_BEAT = 3600;

function easeInOut(value) {
  const t = Math.min(1, Math.max(0, value));
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

function lerp(from, to, amount) {
  return from + (to - from) * amount;
}

function layoutOffset(node, stage) {
  let x = 0;
  let y = 0;
  let current = node;
  while (current && current !== stage) {
    x += current.offsetLeft;
    y += current.offsetTop;
    current = current.offsetParent;
  }
  return { x, y };
}

const dateLabel = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const shortLabel = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function formatK(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);
}

const series = [
  { label: "Clicks", key: "clicks", color: "#2563eb", fillOpacity: [0.18, 0.02] },
  { label: "Impressions", key: "impressions", color: "#f97316", fillOpacity: [0.22, 0.02], dash: [5, 3] },
];

function paletteOf(clicksColor, impressionsColor) {
  return [
    { ...series[0], color: clicksColor || series[0].color },
    { ...series[1], color: impressionsColor || series[1].color },
  ];
}

function chartInk(dark) {
  return dark
    ? { tick: "#f5f5f4", grid: "rgba(255,255,255,0.22)", hover: "rgba(255,255,255,0.45)" }
    : { tick: "#a8a29e", grid: "rgba(0,0,0,0.05)", hover: "rgba(0,0,0,0.08)" };
}

function hexToRgba(hex, alpha) {
  const value = parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}

function verticalGradient(color, [topOpacity, bottomOpacity]) {
  return ({ chart }) => {
    const { ctx, chartArea } = chart;
    if (!chartArea) return "transparent";
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, hexToRgba(color, topOpacity));
    gradient.addColorStop(1, hexToRgba(color, bottomOpacity));
    return gradient;
  };
}

const hoverLine = {
  id: "hoverLine",
  beforeDatasetsDraw(chart) {
    const active = chart.tooltip?.getActiveElements();
    if (!active?.length) return;
    const { ctx, chartArea } = chart;
    const x = active[0].element.x;
    ctx.save();
    ctx.strokeStyle = chart.$ink?.hover ?? "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.stroke();
    ctx.restore();
  },
};

function ChartTooltip({ tooltip }) {
  return (
    <div
      className="pointer-events-none absolute z-10 rounded-xl border border-stone-200 bg-white px-3 py-2 shadow-lg"
      style={{
        left: tooltip.x,
        top: tooltip.y,
        transform: `translate(${tooltip.flip ? "calc(-100% - 10px)" : "10px"}, -50%)`,
      }}
    >
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-stone-400">{tooltip.label}</p>
      {tooltip.points.map((point) => (
        <div key={point.key} className="flex items-center gap-2 text-xs">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: point.color }} />
          <span className="w-20 capitalize text-stone-500">{point.key}</span>
          <span className="font-mono font-semibold text-stone-800">{formatK(point.value)}</span>
        </div>
      ))}
    </div>
  );
}

function datasetStyle(item, chartType) {
  const asBar = chartType === "bar" || (chartType === "combined" && item.key === "clicks");
  if (asBar) {
    return {
      type: "bar",
      fill: false,
      backgroundColor: item.color,
      borderColor: item.color,
      borderWidth: 0,
      borderDash: [],
      borderRadius: 2,
      maxBarThickness: 8,
      order: chartType === "combined" ? 1 : 0,
    };
  }
  return {
    type: "line",
    fill: "origin",
    backgroundColor: verticalGradient(item.color, item.fillOpacity),
    borderColor: item.color,
    borderWidth: item.key === "clicks" ? 2.5 : 2,
    borderDash: chartType === "area" ? (item.dash ?? []) : [],
    order: item.key === "clicks" ? 0 : 1,
  };
}

export default function AnalyticsCard({
  name,
  siteUrl = "",
  description,
  days,
  logoUrl,
  category,
  status,
  anonymous,
  chart,
  clicksColor,
  impressionsColor,
  cardColor = "#ffffff",
  compact = false,
  mobileCompact = false,
  demo = false,
  bordered = true,
}) {
  const [range, setRange] = useState(28);
  const [hiddenSeries, setHiddenSeries] = useState([]);
  const [tooltip, setTooltip] = useState(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const stageRef = useRef(null);
  const applied = useRef(-1);
  const clockRef = useRef(0);
  const progressRef = useRef(null);
  const cursorNodeRef = useRef(null);
  const motion = useRef({ x: 28, y: 24, scale: 1, origin: "72% 16%", pressed: false });
  const [playing, setPlaying] = useState(true);

  const chartType = CHART_VALUES.includes(chart) ? chart : "area";
  const palette = paletteOf(clicksColor, impressionsColor);
  const visibleDays = days.slice(-range);
  const totals = Object.fromEntries(
    palette.map((item) => [item.key, visibleDays.reduce((sum, day) => sum + day[item.key], 0)])
  );
  const darkCard = isDarkHex(cardColor);

  useEffect(() => {
    if (!demo || !playing) return undefined;
    let frame = 0;
    let last = performance.now();
    const anchors = { phase: "", from: { x: motion.current.x, y: motion.current.y }, cursor: { x: motion.current.x, y: motion.current.y } };
    const hover = { index: -1 };

    const tick = (now) => {
      const delta = Math.min(34, now - last);
      last = now;
      frame = requestAnimationFrame(tick);
      const stage = stageRef.current;
      if (!stage || document.visibilityState === "hidden") return;
      const rect = stage.getBoundingClientRect();
      const height = window.innerHeight || 0;
      if (rect.width <= 0 || rect.height <= 0 || rect.bottom < -200 || rect.top > height + 200) return;

      const duration = RANGE_BEAT * RANGES.length;
      clockRef.current = clockRef.current + delta >= duration ? 0 : clockRef.current + delta;
      const time = clockRef.current;
      if (time < 48) applied.current = -1;
      const beat = Math.min(RANGES.length - 1, Math.floor(time / RANGE_BEAT));
      const local = time % RANGE_BEAT;
      const phase = local < 480 ? "toTab" : local < 1480 ? "tab" : local < 1880 ? "toChart" : local < 3320 ? "chart" : "out";
      const button = stage.querySelector(`[data-range="${RANGES[beat].days}"]`);
      const chart = chartRef.current;
      const canvas = canvasRef.current;
      if (!button) return;

      const tab = {
        x: button.offsetLeft + button.offsetWidth * 0.42,
        y: button.offsetTop + button.offsetHeight * 0.62,
      };
      const tabOrigin = `${((button.offsetLeft + button.offsetWidth / 2) / stage.clientWidth) * 100}% ${((button.offsetTop + button.offsetHeight / 2) / stage.clientHeight) * 100}%`;
      let chartStart = tab;
      let chartAt = tab;
      let chartOrigin = "50% 58%";
      const points = chart?.getDatasetMeta(0)?.data ?? [];
      if (chart && canvas && points.length) {
        const origin = layoutOffset(canvas, stage);
        const at = (index) => ({ x: origin.x + points[index].x, y: origin.y + points[index].y - 8 });
        const steps = Math.min(points.length - 1, 12);
        const scrub = easeInOut(Math.min(1, Math.max(0, (local - 2280) / 900)));
        const step = Math.round(scrub * steps);
        const index = Math.round((step / Math.max(steps, 1)) * (points.length - 1));
        chartStart = at(0);
        chartAt = at(index);
        chartOrigin = `${((origin.x + canvas.clientWidth / 2) / stage.clientWidth) * 100}% ${((origin.y + canvas.clientHeight / 2) / stage.clientHeight) * 100}%`;
        if (phase === "chart" && local >= 2280) {
          if (hover.index !== index) {
            hover.index = index;
            const active = chart.data.datasets.map((_, datasetIndex) => ({ datasetIndex, index }));
            chart.setActiveElements(active);
            chart.tooltip.setActiveElements(active, { x: points[index].x, y: points[index].y });
            chart.update("none");
          }
        } else if (hover.index !== -1) {
          hover.index = -1;
          chart.setActiveElements([]);
          chart.tooltip.setActiveElements([], { x: 0, y: 0 });
          chart.update("none");
        }
      }

      if (phase !== anchors.phase) {
        anchors.from = anchors.cursor;
        anchors.phase = phase;
      }
      let cursor = chartAt;
      if (phase === "toTab") {
        const amount = easeInOut(local / 480);
        cursor = { x: lerp(anchors.from.x, tab.x, amount), y: lerp(anchors.from.y, tab.y, amount) };
      } else if (phase === "tab") {
        cursor = tab;
      } else if (phase === "toChart") {
        const amount = easeInOut((local - 1480) / 400);
        cursor = { x: lerp(anchors.from.x, chartStart.x, amount), y: lerp(anchors.from.y, chartStart.y, amount) };
      }
      anchors.cursor = cursor;

      const pressed = local >= 920 && local < 1060;
      const zoomTab = local >= 500 && local < 1080;
      const zoomChart = local >= 1960 && local < 3240;
      motion.current = {
        x: cursor.x,
        y: cursor.y,
        scale: zoomTab || zoomChart ? 1.14 : 1,
        origin: local >= 1480 ? chartOrigin : tabOrigin,
        pressed,
      };
      stage.style.transformOrigin = motion.current.origin;
      stage.style.transform = `scale(${motion.current.scale})`;
      if (cursorNodeRef.current) {
        cursorNodeRef.current.style.transform = `translate(${cursor.x}px, ${cursor.y}px) scale(${pressed ? 0.82 : 1})`;
      }
      if (progressRef.current) progressRef.current.style.width = `${(time / duration) * 100}%`;

      if (local >= 960 && applied.current !== beat) {
        button.click();
        applied.current = beat;
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      if (stageRef.current) stageRef.current.style.transform = "scale(1)";
    };
  }, [demo, playing]);

  useEffect(() => {
    const ink = chartInk(darkCard);
    const monoFont = getComputedStyle(document.documentElement).getPropertyValue("--font-dm-mono") || "monospace";
    const tickStyle = (size) => ({ color: ink.tick, font: { family: monoFont, size } });

    const canvas = canvasRef.current;
    Chart.getChart(canvas)?.destroy();
    const chart = new Chart(canvas, {
      type: chartType === "bar" || chartType === "combined" ? "bar" : "line",
      plugins: [hoverLine],
      data: {
        labels: [],
        datasets: paletteOf(clicksColor, impressionsColor).map((item) => ({
          label: item.key,
          data: [],
          yAxisID: item.key,
          cubicInterpolationMode: "monotone",
          pointRadius: 0,
          pointHoverRadius: 3.5,
          pointHoverBorderWidth: 0,
          pointHoverBackgroundColor: item.color,
          ...datasetStyle(item, chartType),
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        layout: { padding: { top: 4, right: 4 } },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              ...tickStyle(compact || mobileCompact ? 8 : 9),
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: compact || mobileCompact ? 3 : 6,
              autoSkipPadding: compact || mobileCompact ? 10 : 28,
            },
          },
          clicks: {
            position: "left",
            beginAtZero: true,
            grid: { color: ink.grid, drawTicks: false },
            border: { display: false, dash: [3, 3] },
            ticks: { ...tickStyle(8), maxTicksLimit: 5, padding: 6, precision: 0, callback: formatK },
          },
          impressions: {
            position: "right",
            beginAtZero: true,
            grid: { color: ink.grid, drawTicks: false, drawOnChartArea: false },
            border: { display: false, dash: [3, 3] },
            ticks: { ...tickStyle(8), maxTicksLimit: 5, padding: 6, precision: 0, callback: formatK },
          },
        },
        plugins: {
          tooltip: {
            enabled: false,
            external: ({ chart, tooltip: model }) => {
              if (model.opacity === 0) {
                setTooltip(null);
                return;
              }
              setTooltip({
                x: model.caretX,
                y: model.caretY,
                flip: model.caretX > chart.width / 2,
                label: model.title?.[0] ?? "",
                points: model.dataPoints.map((point) => ({
                  key: point.dataset.label,
                  value: point.raw,
                  color: point.dataset.borderColor,
                })),
              });
            },
          },
        },
      },
    });

    chart.$ink = ink;
    chartRef.current = chart;
    return () => chart.destroy();
  }, [chartType, darkCard, compact, mobileCompact]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const shown = days.slice(-range);
    const narrow = chart.width > 0 && chart.width < 520;
    const format = compact || mobileCompact || narrow ? shortLabel : dateLabel;
    chart.data.labels = shown.map((day) => format.format(new Date(`${day.date}T00:00:00Z`)));
    chart.options.scales.x.ticks.maxTicksLimit = compact || mobileCompact || narrow ? 3 : 6;
    paletteOf(clicksColor, impressionsColor).forEach((item, index) => {
      const dataset = chart.data.datasets[index];
      Object.assign(dataset, datasetStyle(item, chartType), {
        data: shown.map((day) => day[item.key]),
        pointHoverBackgroundColor: item.color,
      });
    });
    chart.update();
  }, [days, range, chartType, clicksColor, impressionsColor, compact, mobileCompact]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    paletteOf(clicksColor, impressionsColor).forEach((item, index) => {
      const visible = !hiddenSeries.includes(item.key);
      chart.setDatasetVisibility(index, visible);
      chart.options.scales[item.key].ticks.color = visible ? chart.$ink?.tick ?? chartInk(darkCard).tick : "transparent";
    });
    const ink = chart.$ink ?? chartInk(darkCard);
    chart.options.scales.x.ticks.color = ink.tick;
    chart.options.scales.clicks.grid.color = ink.grid;
    chart.options.scales.impressions.grid.color = ink.grid;
    const clicksVisible = !hiddenSeries.includes("clicks");
    chart.options.scales.clicks.grid.drawOnChartArea = clicksVisible;
    chart.options.scales.impressions.grid.drawOnChartArea = !clicksVisible;
    chart.update();
  }, [hiddenSeries, chartType, clicksColor, impressionsColor, darkCard]);

  function toggleSeries(key) {
    setHiddenSeries((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  }

  return (
    <div className={demo ? "min-w-0" : "contents"}>
    <div
      ref={stageRef}
      inert={demo ? true : undefined}
      className={`card min-w-0 shadow-[0_8px_28px_rgba(28,25,23,0.09)] ${bordered ? "border border-stone-200" : "border-0"} ${demo ? "pointer-events-none relative" : ""} ${
        compact
          ? "rounded-2xl px-3 pb-2.5 pt-3"
          : mobileCompact
            ? "rounded-2xl px-3 pb-2.5 pt-3 lg:rounded-[1.4rem] lg:px-4 lg:pb-3 lg:pt-4"
            : "rounded-[1.4rem] px-4 pb-3 pt-4"
      }`}
      style={{
        backgroundColor: cardColor,
        backgroundImage: "none",
        transform: demo ? `scale(${motion.current.scale})` : undefined,
        transformOrigin: demo ? motion.current.origin : undefined,
        transition: demo ? "transform 680ms cubic-bezier(0.22, 1, 0.36, 1)" : undefined,
      }}
    >
      <div className={`flex min-w-0 flex-wrap items-start ${compact ? "gap-2" : mobileCompact ? "gap-2 lg:gap-3" : "gap-3"} ${anonymous ? "justify-end" : ""}`}>
        {!anonymous && (
          <>
            <SiteLogo
              name={name}
              logoUrl={logoUrl}
              className={`${compact ? "h-7 w-7" : mobileCompact ? "h-7 w-7 lg:h-8 lg:w-8" : "h-8 w-8"} shrink-0 rounded-lg`}
            />
            <div className={`min-w-0 flex-1 ${compact ? "space-y-0.5" : mobileCompact ? "space-y-0.5 lg:space-y-1.5" : "space-y-1.5"}`}>
              {siteUrl ? (
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block truncate font-semibold leading-none underline-offset-2 hover:underline ${compact ? "text-[13px]" : mobileCompact ? "text-[13px] lg:text-sm" : "text-sm"} ${darkCard ? "text-white" : "text-stone-800"}`}
                >
                  {name}
                </a>
              ) : (
                <p className={`truncate font-semibold leading-none ${compact ? "text-[13px]" : mobileCompact ? "text-[13px] lg:text-sm" : "text-sm"} ${darkCard ? "text-white" : "text-stone-800"}`}>{name}</p>
              )}
              {description && (
                <p className={`truncate text-[11px] leading-snug ${darkCard ? "text-stone-300" : "text-stone-500"}`}>
                  {description}
                </p>
              )}
              {!compact && (category || status) && (
                <p className={`truncate text-[11px] leading-snug ${mobileCompact ? "max-lg:hidden" : ""} ${darkCard ? "text-stone-300" : "text-stone-400"}`}>
                  {[category, status].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </>
        )}
        {!compact && (
          <div className={mobileCompact ? "flex w-full justify-end lg:contents" : "contents"}>
          <div
            className={`join shrink-0 rounded-full border-0 p-0.5 ${darkCard ? "bg-[#161616]" : "bg-white"}`}
            role="group"
            aria-label="Date range"
          >
            {RANGES.map((item) => (
              <button
                key={item.days}
                type="button"
                data-range={item.days}
                onClick={(event) => {
                  setRange(item.days);
                  if (demo && event.nativeEvent.isTrusted) setPlaying(false);
                }}
                aria-pressed={range === item.days}
                className={`btn join-item btn-xs h-6 rounded-full border-0 px-2.5 text-[10px] font-semibold shadow-none ${
                  range === item.days
                    ? darkCard
                      ? "bg-[#2A2A2A] text-white hover:bg-[#2A2A2A]"
                      : "bg-stone-900 text-white hover:bg-stone-900"
                    : darkCard
                      ? "bg-transparent text-stone-400 hover:bg-white/10"
                      : "bg-transparent text-stone-500 hover:bg-stone-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          </div>
        )}
      </div>

      <div className={compact ? "mt-2 h-20" : mobileCompact ? "mt-2 h-20 lg:mt-3 lg:h-32" : "mt-3 h-32"}>
        <div className="relative h-full w-full">
          <canvas ref={canvasRef} aria-label="Clicks and impressions over time" role="img" />
          {tooltip && <ChartTooltip tooltip={tooltip} />}
        </div>
      </div>

      <div className={`mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 ${compact ? "text-xs" : mobileCompact ? "text-xs lg:text-sm" : "text-sm"} ${darkCard ? "text-white" : "text-stone-900"}`}>
        {palette.map((stat, index) => (
          <span key={stat.key} className="inline-flex items-center gap-2">
            {index > 0 && <span className={darkCard ? "text-stone-500" : "text-stone-300"}>·</span>}
            <button
              type="button"
              onClick={() => toggleSeries(stat.key)}
              className={`inline-flex items-baseline gap-1 ${hiddenSeries.includes(stat.key) ? "opacity-40" : ""}`}
            >
              <span className="font-bold">{formatK(totals[stat.key])}</span>
              <span className={`font-medium ${darkCard ? "text-stone-300" : "text-stone-500"}`}>{stat.label.toLowerCase()}</span>
            </button>
          </span>
        ))}
      </div>
      {demo && playing && (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="pointer-events-none absolute z-20 h-7 w-7 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]"
          ref={cursorNodeRef}
          style={{
            left: 0,
            top: 0,
            transform: `translate(${motion.current.x}px, ${motion.current.y}px) scale(${motion.current.pressed ? 0.82 : 1})`,
          }}
        >
          <path fill="#fff" stroke="#1F1F1F" strokeWidth="1.2" d="M5 3l10 14-4 1 2 5-2 1-2-5-4 3z" />
        </svg>
      )}
    </div>
    {demo && (
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPlaying((current) => !current)}
          className="btn btn-sm h-10 min-h-10 rounded-full border-white/15 bg-transparent px-4 text-xs font-semibold text-stone-100"
          aria-pressed={playing}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
          <div ref={progressRef} className="h-full rounded-full bg-[#ff4fa3]" style={{ width: "0%" }} />
        </div>
        <button
          type="button"
          onClick={() => {
            applied.current = -1;
            clockRef.current = 0;
            motion.current = { x: 28, y: 24, scale: 1, origin: "72% 16%", pressed: false };
            if (progressRef.current) progressRef.current.style.width = "0%";
            setRange(28);
            setPlaying(true);
          }}
          className="btn btn-sm h-10 min-h-10 rounded-full border-white/15 bg-transparent px-4 text-xs font-semibold text-stone-100"
        >
          Replay
        </button>
      </div>
    )}
    </div>
  );
}
