import Link from "next/link";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { profileDetailsReady, selectProfile, STYLE_SAVED_COOKIE } from "@/lib/profile";
import { publishPage } from "./actions";

export const metadata = {
  title: "Publish · pagzi.online",
};

export default async function PublishPage({ searchParams }) {
  const { supabase, userId } = await requireUser();
  const [{ data: profile }, sites, cookieStore, query] = await Promise.all([
    selectProfile(supabase, userId, "username, name, bio, location, published_at"),
    supabase.from("sites").select("id", { count: "exact", head: true }).eq("user_id", userId),
    cookies(),
    searchParams,
  ]);
  const { done, error } = await query;
  const published = Boolean(profile?.published_at) || done === "1";
  const styleSaved = cookieStore.get(STYLE_SAVED_COOKIE)?.value === "1";
  const ready = profileDetailsReady(profile) && (sites.count ?? 0) > 0 && styleSaved;
  const publicPath = profile?.username ? `/${profile.username}` : "";

  return (
    <main className="px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-xl">
        <p className="text-3xl font-bold tracking-[-0.035em] text-white">Publish</p>
        <p className="mt-2 text-sm leading-6 text-stone-400">Put your page online when the profile, websites, and style are ready.</p>

        <div className="card mt-8 rounded-3xl border border-white/10 bg-[#1F1F1F]">
          <div className="card-body gap-4 p-6 sm:p-8">
            {published ? (
              <>
                <p className="text-lg font-semibold text-white">Your page is live.</p>
                <p className="text-sm leading-6 text-stone-300">Open the View tab to see what visitors see.</p>
                {publicPath && (
                  <Link href={publicPath} className="btn btn-save h-11 w-full rounded-xl border-0 font-semibold text-white shadow-none">
                    View my page
                  </Link>
                )}
              </>
            ) : ready ? (
              <>
                <p className="text-sm leading-6 text-stone-300">
                  Your name, bio, location, website, and style are saved. Publishing makes this page public.
                </p>
                {error === "setup" && (
                  <p role="alert" className="text-sm text-red-300">
                    Publishing needs a database update. Run the latest SQL in Supabase, then try again.
                  </p>
                )}
                {error === "save" && (
                  <p role="alert" className="text-sm text-red-300">
                    We couldn't publish your page. Please try again.
                  </p>
                )}
                <form action={publishPage}>
                  <button type="submit" className="btn btn-save h-11 w-full rounded-xl border-0 font-semibold text-white shadow-none">
                    Publish
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="text-sm leading-6 text-stone-300">Finish these steps and the Publish tab will stay here.</p>
                <ul className="space-y-2 text-sm text-stone-200">
                  <li>{profileDetailsReady(profile) ? "Profile saved" : "Add your name, username, bio, and location"}</li>
                  <li>{(sites.count ?? 0) > 0 ? "Website added" : "Add at least one website"}</li>
                  <li>{styleSaved ? "Style saved" : "Save your colors and text on the Style tab"}</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
