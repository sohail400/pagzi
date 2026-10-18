import { requireUser } from "@/lib/auth";
import { isBuilderAccount } from "@/lib/payments";
import SettingsPanel from "./SettingsPanel";

export const metadata = {
  title: "Settings · pagzi.online",
};

export default async function SettingsPage({ searchParams }) {
  const { checkout } = await searchParams;
  const { supabase, userId } = await requireUser();
  const { data, error } = await supabase
    .from("profiles")
    .select("username, custom_domain, paid_at")
    .eq("id", userId)
    .maybeSingle();

  let username = data?.username ?? "";
  let customDomain = data?.custom_domain ?? "";
  let builder = isBuilderAccount(username);
  let paid = Boolean(data?.paid_at) || builder;

  if (error) {
    const fallback = await supabase.from("profiles").select("username").eq("id", userId).maybeSingle();
    username = fallback.data?.username ?? "";
    customDomain = "";
    builder = isBuilderAccount(username);
    paid = builder;
  }

  return (
    <main className="px-4 py-10 sm:px-8">
      <SettingsPanel username={username} customDomain={customDomain} paid={paid} builder={builder} checkout={checkout || ""} />
    </main>
  );
}
