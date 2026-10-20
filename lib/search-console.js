// Search Console query dates are calendar days in Pacific Time.
const PACIFIC = "America/Los_Angeles";

export function pacificDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PACIFIC,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function addIsoDays(iso, days) {
  const [year, month, day] = String(iso).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// The Performance report lags about two days. The chart ends on that same day.
export function completeThrough(now = new Date()) {
  return addIsoDays(pacificDate(now), -2);
}

// `length` daily points ending on `end` (inclusive). Days the API omitted are zero.
export function chartSeries(rows, end, length) {
  const byDate = new Map((rows ?? []).map((row) => [String(row.date).slice(0, 10), row]));
  return Array.from({ length }, (_, index) => {
    const date = addIsoDays(end, index - (length - 1));
    const row = byDate.get(date);
    return {
      date,
      clicks: row?.clicks ?? 0,
      impressions: row?.impressions ?? 0,
    };
  });
}

export function rowsFromSearchAnalytics(data) {
  return (data?.rows ?? []).map((row) => ({
    date: row.keys[0],
    clicks: Math.round(row.clicks),
    impressions: Math.round(row.impressions),
  }));
}

export function rangeTotal(series, days, key) {
  return series.slice(-days).reduce((sum, day) => sum + day[key], 0);
}
