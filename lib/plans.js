export const LAUNCH_DEAL_SPOTS = 30;
export const LAUNCH_DEAL_PRICE = 9;
export const YEARLY_PRICE = 14.99;
export const LIFETIME_PRICE = 24.99;

export function formatPrice(amount) {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

export const PLAN_OPTIONS = [
  {
    id: "early",
    name: "Launch deal",
    price: LAUNCH_DEAL_PRICE,
    detail: `Lifetime. First ${LAUNCH_DEAL_SPOTS} spots only.`,
    limited: true,
  },
  {
    id: "year",
    name: "1-Year Pass",
    price: YEARLY_PRICE,
    detail: "One year. No auto-renew.",
  },
  {
    id: "lifetime",
    name: "Lifetime Deal",
    price: LIFETIME_PRICE,
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
