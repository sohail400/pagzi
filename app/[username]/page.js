import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import Avatar from "@/components/Avatar";
import SocialLinks from "@/components/SocialLinks";
import { PROFILE_COLUMNS, socialLinksOf, USERNAME_PATTERN } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

const getProfile = cache(async (username) => {
  const normalized = username.toLowerCase();
  if (!USERNAME_PATTERN.test(normalized)) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("username", normalized)
    .maybeSingle();
  return data;
});

export async function generateMetadata({ params }) {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile) return { title: "Page not found · indie.site" };

  const displayName = profile.name || `@${profile.username}`;
  return {
    title: `${displayName} · indie.site`,
    description: profile.bio || `${displayName} on indie.site`,
  };
}

export default async function ProfilePage({ params }) {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile) notFound();

  const links = socialLinksOf(profile);

  return (
    <div className="min-h-screen bg-[#f5f0e8] px-4 py-8 font-sans text-stone-900 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="link mb-8 inline-block text-sm font-semibold text-stone-500 no-underline hover:text-stone-900">
          indie.site
        </Link>

        <div className="mb-7 px-2">
          <Avatar
            src={profile.avatar_url}
            name={profile.name}
            className="w-24 ring-4 ring-amber-200 shadow-sm sm:w-28"
            textClassName="text-3xl"
          />
          <p className="mt-4 text-3xl font-bold leading-none tracking-tight sm:text-4xl">
            {profile.name || `@${profile.username}`}
          </p>
          {profile.location && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-stone-600">
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                  <path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                </svg>
                {profile.location}
              </span>
            </div>
          )}
          {profile.bio && (
            <p className="mt-4 max-w-lg whitespace-pre-line break-words text-sm font-medium leading-relaxed text-stone-700 sm:text-base">
              {profile.bio}
            </p>
          )}
          <SocialLinks links={links} className="mt-5" />
        </div>
      </div>
    </div>
  );
}
