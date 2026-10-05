import { headers } from "next/headers";
import { requireUser } from "@/lib/auth";
import { PROFILE_COLUMNS } from "@/lib/profile";
import ProfileForm from "./ProfileForm";

export const metadata = {
  title: "Your profile · indie.site",
};

export default async function AdminPage() {
  const { supabase, userId } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  const requestHeaders = await headers();
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const siteUrl = `${protocol}://${requestHeaders.get("host")}`;

  return (
    <main className="px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-3xl font-bold tracking-[-0.035em] text-stone-900">Your indie.site</p>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Update what people see when they visit your public page.
          </p>
        </div>

        {profile ? (
          <ProfileForm profile={profile} siteUrl={siteUrl} />
        ) : (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            We couldn’t load your profile. Please refresh the page. If this keeps happening, contact hello@indie.site.
          </p>
        )}
      </div>
    </main>
  );
}
