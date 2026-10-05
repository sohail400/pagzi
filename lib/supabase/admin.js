import "server-only";
import { createClient } from "@supabase/supabase-js";

// Bypasses Row Level Security. Only use after checking who the user is.
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) throw new Error("SUPABASE_SECRET_KEY is not set.");

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
