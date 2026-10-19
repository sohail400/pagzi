import { cookies } from "next/headers";
import DashboardLayout from "@/components/DashboardLayout";
import { hasFullAccess } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { profileDetailsReady, selectProfile, STYLE_SAVED_COOKIE } from "@/lib/profile";

export default async function Layout({ children }) {
  const { supabase, userId, email } = await requireUser();
  const [{ data: profile }, sites, cookieStore] = await Promise.all([
    selectProfile(supabase, userId, "name, username, bio, location, paid_at, plan, plan_expires_at, published_at"),
    supabase.from("sites").select("id", { count: "exact", head: true }).eq("user_id", userId),
    cookies(),
  ]);
  const published = Boolean(profile?.published_at);
  const ready =
    profileDetailsReady(profile) &&
    (sites.count ?? 0) > 0 &&
    cookieStore.get(STYLE_SAVED_COOKIE)?.value === "1";

  return (
    <DashboardLayout
      user={{ name: profile?.name ?? "", email }}
      locked={!hasFullAccess(profile)}
      showPublish={!published && ready}
      showView={published && Boolean(profile?.username)}
      publicPath={profile?.username ? `/${profile.username}` : ""}
    >
      {children}
    </DashboardLayout>
  );
}
