import { loadOwner } from "@/lib/auth";
import { hasFullAccess, isBuilderAccount } from "@/lib/access";
import { planOption } from "@/lib/plans";
import { earlySpotCount } from "@/lib/payments";
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
  const { profile, profileError } = await loadOwner();

  let username = profile?.username ?? "";
  let customDomain = profile?.custom_domain ?? "";
  let builder = isBuilderAccount(username);
  let paid = hasFullAccess(profile) || builder;
  let currentPlan = profile?.plan || "";
  let expiresLabel = currentPlan === "year" ? dateLabel(profile?.plan_expires_at) : "";
  let hasReceipts = Boolean(profile?.dodo_customer_id);

  if (profileError) {
    username = "";
    customDomain = "";
    builder = false;
    paid = false;
    currentPlan = "";
    expiresLabel = "";
    hasReceipts = false;
  }

  let earlyLeft = 20;
  let earlySoldOut = false;
  if (!paid) {
    try {
      const spots = await earlySpotCount();
      earlyLeft = spots.left;
      earlySoldOut = spots.soldOut;
    } catch (spotError) {
      console.error("Counting Early spots failed:", spotError);
    }
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
