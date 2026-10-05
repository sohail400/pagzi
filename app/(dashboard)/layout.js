import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { createClient } from "@/lib/supabase/server";

export default async function Layout({ children }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) redirect("/login");

  const user = {
    name: claims.user_metadata?.name ?? "",
    email: claims.email ?? "",
  };

  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
