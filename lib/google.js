import "server-only";
import { OAuth2Client } from "google-auth-library";
import { decrypt, encrypt } from "@/lib/encryption";
import { rowsFromSearchAnalytics } from "@/lib/search-console";
import { createAdminClient } from "@/lib/supabase/admin";

export const SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const SEARCH_CONSOLE_API = "https://www.googleapis.com/webmasters/v3";

// Short-lived cookie that proves the Google callback belongs to a connect this browser started.
export const STATE_COOKIE = "google_oauth_state";

export function isGoogleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function oauthClient(origin) {
  return new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: origin ? `${origin}/api/google/callback` : undefined,
  });
}

export function googleAuthUrl(origin, state) {
  return oauthClient(origin).generateAuthUrl({
    access_type: "offline",
    // Always ask, so Google always returns a refresh token.
    prompt: "consent",
    include_granted_scopes: true,
    scope: ["openid", "email", SEARCH_CONSOLE_SCOPE],
    state,
  });
}

export async function exchangeCode(origin, code) {
  const client = oauthClient(origin);
  const { tokens } = await client.getToken(code);

  let email = "";
  if (tokens.id_token) {
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
    email = ticket.getPayload()?.email ?? "";
  }

  return {
    email,
    refreshToken: tokens.refresh_token ?? null,
    hasSearchConsoleAccess: (tokens.scope ?? "").split(" ").includes(SEARCH_CONSOLE_SCOPE),
  };
}

export async function revokeToken(refreshToken) {
  await oauthClient().revokeToken(refreshToken);
}

// True when the user removed pagzi.online's access in their Google account (or it expired).
export function isAccessRevoked(error) {
  const status = error?.response?.status;
  const code = error?.response?.data?.error;
  return code === "invalid_grant" || error?.message === "invalid_grant" || status === 401;
}

export function isRateLimited(error) {
  const status = error?.response?.status;
  return status === 429 || status === 503;
}

function apiClient(refreshToken) {
  const client = oauthClient();
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

// "sc-domain:example.com" or "https://www.example.com/" → "example.com"
export function siteNameOf(property) {
  return property
    .replace(/^sc-domain:/, "")
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

export async function listProperties(refreshToken) {
  const { data } = await apiClient(refreshToken).request({ url: `${SEARCH_CONSOLE_API}/sites` });
  return (data.siteEntry ?? [])
    .filter((entry) => entry.permissionLevel !== "siteUnverifiedUser")
    .map((entry) => ({ property: entry.siteUrl, name: siteNameOf(entry.siteUrl) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Daily clicks and impressions for Web search, dates as "YYYY-MM-DD" in Pacific Time.
// Google omits days with no traffic. The default Performance report is the Web search type.
export async function fetchDailyTraffic(refreshToken, property, startDate, endDate) {
  const { data } = await apiClient(refreshToken).request({
    url: `${SEARCH_CONSOLE_API}/sites/${encodeURIComponent(property)}/searchAnalytics/query`,
    method: "POST",
    data: {
      startDate,
      endDate,
      dimensions: ["date"],
      type: "web",
      rowLimit: 25000,
      dataState: "all",
    },
  });
  return rowsFromSearchAnalytics(data);
}

export async function getConnection(userId) {
  const { data, error } = await createAdminClient()
    .from("google_connections")
    .select("google_email, refresh_token")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? { email: data.google_email, refreshToken: decrypt(data.refresh_token) } : null;
}

export async function saveConnection(userId, { email, refreshToken }) {
  const { error } = await createAdminClient()
    .from("google_connections")
    .upsert({ user_id: userId, google_email: email, refresh_token: encrypt(refreshToken) });
  if (error) throw error;
}

export async function deleteConnection(userId) {
  const { error } = await createAdminClient().from("google_connections").delete().eq("user_id", userId);
  if (error) throw error;
}
