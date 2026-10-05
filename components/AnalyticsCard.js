"use client";

import { useEffect, useRef, useState } from "react";
import {
  CategoryScale,
  Chart,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

const data = [
  { date: "Sep 1", clicks: 1240, impressions: 38400 },
  { date: "Sep 2", clicks: 1580, impressions: 42100 },
  { date: "Sep 3", clicks: 1320, impressions: 39800 },
  { date: "Sep 4", clicks: 980, impressions: 31200 },
  { date: "Sep 5", clicks: 860, impressions: 28700 },
  { date: "Sep 6", clicks: 2140, impressions: 51300 },
  { date: "Sep 7", clicks: 2380, impressions: 56800 },
  { date: "Sep 8", clicks: 2670, impressions: 61400 },
  { date: "Sep 9", clicks: 2210, impressions: 54900 },
  { date: "Sep 10", clicks: 1940, impressions: 48200 },
  { date: "Sep 11", clicks: 2050, impressions: 52700 },
  { date: "Sep 12", clicks: 2480, impressions: 58300 },
  { date: "Sep 13", clicks: 2890, impressions: 67100 },
  { date: "Sep 14", clicks: 3120, impressions: 71600 },
  { date: "Sep 15", clicks: 2760, impressions: 64800 },
];

function formatK(value) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);
}

const totals = {
  clicks: data.reduce((sum, point) => sum + point.clicks, 0),
  impressions: data.reduce((sum, point) => sum + point.impressions, 0),
};

const series = [
  { label: "Clicks", value: formatK(totals.clicks), key: "clicks", color: "#2563eb", fillOpacity: [0.18, 0.02] },
  {
    label: "Impressions",
    value: formatK(totals.impressions),
    key: "impressions",
    color: "#7c3aed",
    fillOpacity: [0.14, 0.01],
    dash: [5, 3],
  },
];

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
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
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

export default function AnalyticsCard() {
  const [hiddenSeries, setHiddenSeries] = useState([]);
  const [tooltip, setTooltip] = useState(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const monoFont = getComputedStyle(document.documentElement).getPropertyValue("--font-dm-mono") || "monospace";
    const tickStyle = (size) => ({ color: "#a8a29e", font: { family: monoFont, size } });

    const chart = new Chart(canvasRef.current, {
      type: "line",
      plugins: [hoverLine],
      data: {
        labels: data.map((point) => point.date),
        datasets: series.map((item) => ({
          label: item.key,
          data: data.map((point) => point[item.key]),
          yAxisID: item.key,
          borderColor: item.color,
          borderWidth: 2,
          borderDash: item.dash ?? [],
          backgroundColor: verticalGradient(item.color, item.fillOpacity),
          fill: "origin",
          cubicInterpolationMode: "monotone",
          pointRadius: 0,
          pointHoverRadius: 3.5,
          pointHoverBorderWidth: 0,
          pointHoverBackgroundColor: item.color,
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
              ...tickStyle(9),
              autoSkip: false,
              maxRotation: 0,
              callback: (_, index) => (index % 4 === 0 ? data[index].date : null),
            },
          },
          clicks: {
            position: "left",
            beginAtZero: true,
            grid: { color: "rgba(0,0,0,0.05)", drawTicks: false },
            border: { display: false, dash: [3, 3] },
            ticks: { ...tickStyle(8), maxTicksLimit: 5, padding: 6, callback: formatK },
          },
          impressions: {
            position: "right",
            beginAtZero: true,
            grid: { color: "rgba(0,0,0,0.05)", drawTicks: false, drawOnChartArea: false },
            border: { display: false, dash: [3, 3] },
            ticks: { ...tickStyle(8), maxTicksLimit: 5, padding: 6, callback: formatK },
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

    chartRef.current = chart;
    return () => chart.destroy();
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    series.forEach((item, index) => {
      const visible = !hiddenSeries.includes(item.key);
      chart.setDatasetVisibility(index, visible);
      chart.options.scales[item.key].ticks.color = visible ? "#a8a29e" : "transparent";
    });
    const clicksVisible = !hiddenSeries.includes("clicks");
    chart.options.scales.clicks.grid.drawOnChartArea = clicksVisible;
    chart.options.scales.impressions.grid.drawOnChartArea = !clicksVisible;
    chart.update();
  }, [hiddenSeries]);

  function toggleSeries(key) {
    setHiddenSeries((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  }

  return (
    <div className="card rounded-3xl border border-stone-200 bg-[#faf7f2] p-4 shadow-[0_8px_28px_rgba(28,25,23,0.09)]">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
          S
        </div>
        <div>
          <p className="text-sm font-semibold leading-none text-stone-800">shopify-store.com</p>
          <p className="mt-0.5 text-[10px] text-stone-400">Search Console</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {series.map((stat) => (
          <button
            key={stat.key}
            type="button"
            onClick={() => toggleSeries(stat.key)}
            className="badge h-auto w-full justify-start gap-1.5 rounded-full border-stone-200 bg-white px-2.5 py-1.5 text-stone-800"
            style={{ opacity: hiddenSeries.includes(stat.key) ? 0.45 : 1 }}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: stat.color }} />
            <span className="truncate text-[10px] font-medium text-stone-500">{stat.label}</span>
            <span className="ml-auto text-xs font-bold">{stat.value}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 h-36 rounded-2xl border border-stone-200 bg-white px-2 pb-2 pt-3 sm:h-40 sm:px-3">
        <div className="relative h-full w-full">
          <canvas ref={canvasRef} aria-label="Clicks and impressions over time" role="img" />
          {tooltip && <ChartTooltip tooltip={tooltip} />}
        </div>
      </div>
    </div>
  );
}
