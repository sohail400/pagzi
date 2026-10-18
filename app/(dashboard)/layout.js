import DashboardLayout from "@/components/DashboardLayout";
import { hasFullAccess } from "@/lib/access";
import { requireUser } from "@/lib/auth";

export default async function Layout({ children }) {
  const { supabase, userId, email } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("name, username, paid_at").eq("id", userId).maybeSingle();

  return (
    <DashboardLayout user={{ name: profile?.name ?? "", email }} locked={!hasFullAccess(profile)}>
      {children}
    </DashboardLayout>
  );
}
