import { useId, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import profileImage from "../assets/profile.jpg";

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

function formatK(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);
}

const totals = {
  clicks: data.reduce((sum, point) => sum + point.clicks, 0),
  impressions: data.reduce((sum, point) => sum + point.impressions, 0),
};

const stats = [
  { label: "Clicks", value: formatK(totals.clicks), key: "clicks", color: "#2563eb" },
  {
    label: "Impressions",
    value: formatK(totals.impressions),
    key: "impressions",
    color: "#7c3aed",
  },
];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-stone-200 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-stone-400">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="w-20 capitalize text-stone-500">{entry.dataKey}</span>
          <span className="font-mono font-semibold text-stone-800">{formatK(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

function AnalyticsCard() {
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);
  const chartId = useId().replaceAll(":", "");
  const clicksFill = `clicks-${chartId}`;
  const impressionsFill = `impressions-${chartId}`;

  function toggleSeries(key: string) {
    setHiddenSeries((current) =>
      current.includes(key) ? current.filter((series) => series !== key) : [...current, key]
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
        {stats.map((stat) => (
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
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -14, bottom: 0 }}>
            <defs>
              <linearGradient id={clicksFill} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id={impressionsFill} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.14} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              interval={3}
              tick={{ fill: "#a8a29e", fontSize: 9, fontFamily: "DM Mono, monospace" }}
            />
            <YAxis
              yAxisId="clicks"
              axisLine={false}
              tickLine={false}
              tickFormatter={formatK}
              width={31}
              tick={{ fill: "#a8a29e", fontSize: 8, fontFamily: "DM Mono, monospace" }}
            />
            <YAxis
              yAxisId="impressions"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tickFormatter={formatK}
              width={35}
              tick={{ fill: "#a8a29e", fontSize: 8, fontFamily: "DM Mono, monospace" }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(0,0,0,0.08)" }} />
            {!hiddenSeries.includes("clicks") && (
              <Area
                yAxisId="clicks"
                type="monotone"
                dataKey="clicks"
                stroke="#2563eb"
                strokeWidth={2}
                fill={`url(#${clicksFill})`}
                dot={false}
                activeDot={{ r: 3.5, fill: "#2563eb", strokeWidth: 0 }}
              />
            )}
            {!hiddenSeries.includes("impressions") && (
              <Area
                yAxisId="impressions"
                type="monotone"
                dataKey="impressions"
                stroke="#7c3aed"
                strokeWidth={2}
                strokeDasharray="5 3"
                fill={`url(#${impressionsFill})`}
                dot={false}
                activeDot={{ r: 3.5, fill: "#7c3aed", strokeWidth: 0 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] px-4 py-8 font-sans text-stone-900 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <a href="/" className="link mb-8 inline-block text-sm font-semibold text-stone-500 no-underline hover:text-stone-900">
          indie.site
        </a>

        <div className="mb-7 px-2">
          <div className="avatar">
            <div className="w-24 rounded-full ring-4 ring-amber-200 shadow-sm sm:w-28">
              <img src={profileImage} alt="Sohail Shaikh" className="object-cover" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold leading-none tracking-tight sm:text-4xl">Sohail Shaikh</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-stone-600">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                <path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
              </svg>
              Mumbai
            </span>
            <div className="flex items-center gap-3 border-l border-stone-300 pl-3">
              <a href="https://x.com/" target="_blank" rel="noreferrer" className="link font-medium text-stone-500">
                X
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                className="link font-medium text-stone-500"
              >
                LinkedIn
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                className="link font-medium text-stone-500"
              >
                Instagram
              </a>
            </div>
          </div>
          <p className="mt-4 max-w-lg text-sm font-medium leading-relaxed text-stone-700 sm:text-base">
            I design and build thoughtful digital products, turning ambitious ideas into simple and useful experiences.
          </p>
        </div>

        <div className="grid gap-4">
          {Array.from({ length: 5 }, (_, index) => (
            <AnalyticsCard key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
