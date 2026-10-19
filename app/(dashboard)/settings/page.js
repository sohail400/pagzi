import { requireUser } from "@/lib/auth";
import { hasFullAccess, isBuilderAccount } from "@/lib/access";
import { planOption } from "@/lib/plans";
import { earlySpotCount } from "@/lib/payments";
import { selectProfile } from "@/lib/profile";
import SettingsPanel from "./SettingsPanel";

export const metadata = {
  title: "Settings · pagzi.online",
};

function dateLabel(value) {
  const time = Date.parse(value || "");
  if (!Number.isFinite(time)) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(time));
}

export default async function SettingsPage({ searchParams }) {
  const { checkout, plan: requestedPlan } = await searchParams;
  const { supabase, userId } = await requireUser();
  const { data, error } = await selectProfile(
    supabase,
    userId,
    "username, custom_domain, paid_at, plan, plan_expires_at, dodo_customer_id",
  );

  let username = data?.username ?? "";
  let customDomain = data?.custom_domain ?? "";
  let builder = isBuilderAccount(username);
  let paid = hasFullAccess(data) || builder;
  let currentPlan = data?.plan || "";
  let expiresLabel = currentPlan === "year" ? dateLabel(data?.plan_expires_at) : "";
  let hasReceipts = Boolean(data?.dodo_customer_id);

  if (error) {
    const fallback = await supabase.from("profiles").select("username").eq("id", userId).maybeSingle();
    username = fallback.data?.username ?? "";
    customDomain = "";
    builder = isBuilderAccount(username);
    paid = builder;
    currentPlan = "";
    expiresLabel = "";
    hasReceipts = false;
  }

  let earlyLeft = 20;
  let earlySoldOut = false;
  try {
    const spots = await earlySpotCount();
    earlyLeft = spots.left;
    earlySoldOut = spots.soldOut;
  } catch (spotError) {
    console.error("Counting Early spots failed:", spotError);
  }

  const selected = planOption(requestedPlan);

  return (
    <main className="px-4 py-10 sm:px-8">
      <SettingsPanel
        username={username}
        customDomain={customDomain}
        paid={paid}
        builder={builder}
        checkout={checkout || ""}
        plan={currentPlan}
        planName={planOption(currentPlan)?.name || ""}
        expiresLabel={expiresLabel}
        earlyLeft={earlyLeft}
        earlySoldOut={earlySoldOut}
        selectedPlan={selected?.id || ""}
        hasReceipts={hasReceipts}
      />
    </main>
  );
}
