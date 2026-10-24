import DashboardLayout from "@/components/DashboardLayout";
import { hasFullAccess } from "@/lib/access";
import { loadOwner } from "@/lib/auth";

export default async function Layout({ children }) {
  const { email, profile } = await loadOwner();
  const published = Boolean(profile?.published_at);
  const paid = hasFullAccess(profile);

  return (
    <DashboardLayout
      user={{ name: profile?.name ?? "", email, avatarUrl: profile?.avatar_url ?? "" }}
      locked={!paid}
      showPublish={!published && paid}
      showView={published && Boolean(profile?.username)}
      publicPath={profile?.username ? `/${profile.username}` : ""}
    >
      {children}
    </DashboardLayout>
  );
}
