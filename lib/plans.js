export const PLAN_OPTIONS = [
  {
    id: "early",
    name: "Early",
    price: 9,
    detail: "Lifetime. First 20 spots only.",
    limited: true,
  },
  {
    id: "year",
    name: "1-Year Pass",
    price: 19,
    detail: "One year. No auto-renew.",
  },
  {
    id: "lifetime",
    name: "Lifetime Deal",
    price: 29,
    detail: "Pay once. Keep your page.",
  },
];

const PLAN_IDS = new Set(PLAN_OPTIONS.map((plan) => plan.id));

export function isPlanId(value) {
  return PLAN_IDS.has(String(value || ""));
}

export function planOption(id) {
  return PLAN_OPTIONS.find((plan) => plan.id === id) || null;
}

export function billingPath(plan) {
  return isPlanId(plan) ? `/settings?plan=${plan}` : "/admin";
}
