import { after } from "next/server";
import { requireUser } from "@/lib/auth";
import { getConnection, isAccessRevoked, listProperties } from "@/lib/google";
import { syncStaleSites } from "@/lib/traffic";
import SitesManager from "./SitesManager";

export const metadata = {
  title: "Sites · indie.site",
};

const NOTICES = {
  connected: { type: "success", text: "Google Search Console is connected. Choose the sites to show below." },
  cancelled: { type: "info", text: "You cancelled the Google connection. Nothing was changed." },
  missing_permission: {
    type: "error",
    text: "indie.site needs permission to view your Search Console data. Please connect again and tick that box on Google’s screen.",
  },
  expired: { type: "error", text: "That connection attempt expired. Please try again." },
  failed: { type: "error", text: "We couldn’t connect to Google. Please try again." },
  not_configured: {
    type: "error",
    text: "Google connection isn’t set up yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local.",
  },
};

async function loadGoogle(userId) {
  let connection;
  try {
    connection = await getConnection(userId);
  } catch (error) {
    console.error("Loading Google connection failed:", error);
    return { connection: null, properties: null, loadError: true };
  }
  if (!connection) return { connection: null, properties: null };

  try {
    const properties = await listProperties(connection.refreshToken);
    return { connection: { email: connection.email, status: "ok" }, properties };
  } catch (error) {
    if (!isAccessRevoked(error)) console.error("Listing Search Console sites failed:", error);
    const status = isAccessRevoked(error) ? "revoked" : "error";
    return { connection: { email: connection.email, status }, properties: null };
  }
}

export default async function SitesPage({ searchParams }) {
  const { supabase, userId } = await requireUser();
  const { google } = await searchParams;
  after(() => syncStaleSites(userId).catch((error) => console.error("Syncing traffic failed:", error)));

  const [{ connection, properties, loadError }, { data: sites, error: sitesError }] = await Promise.all([
    loadGoogle(userId),
    supabase.from("sites").select("id, property, name, description").eq("user_id", userId).order("created_at"),
  ]);

  return (
    <main className="px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-3xl font-bold tracking-[-0.035em] text-stone-900">Sites</p>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Connect Google Search Console and choose which websites appear on your page.
          </p>
        </div>

        {loadError || sitesError ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            We couldn’t load your sites. Please refresh the page. If this keeps happening, contact hello@indie.site.
          </p>
        ) : (
          <SitesManager
            connection={connection}
            properties={properties}
            sites={sites}
            notice={NOTICES[google] ?? null}
          />
        )}
      </div>
    </main>
  );
}
