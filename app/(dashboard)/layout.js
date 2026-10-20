import DashboardLayout from "@/components/DashboardLayout";
import { hasFullAccess } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { selectProfile } from "@/lib/profile";

export default async function Layout({ children }) {
  const { supabase, userId, email } = await requireUser();
  const { data: profile } = await selectProfile(
    supabase,
    userId,
    "name, username, bio, location, paid_at, plan, plan_expires_at, published_at",
  );
  const published = Boolean(profile?.published_at);
  const paid = hasFullAccess(profile);

  return (
    <DashboardLayout
      user={{ name: profile?.name ?? "", email }}
      locked={!paid}
      showPublish={!published && paid}
      showView={published && Boolean(profile?.username)}
      publicPath={profile?.username ? `/${profile.username}` : ""}
    >
      {children}
    </DashboardLayout>
  );
}
