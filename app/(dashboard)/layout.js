import DashboardLayout from "@/components/DashboardLayout";
import { requireUser } from "@/lib/auth";

export default async function Layout({ children }) {
  const { supabase, userId, email } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("name").eq("id", userId).maybeSingle();

  return <DashboardLayout user={{ name: profile?.name ?? "", email }}>{children}</DashboardLayout>;
}
