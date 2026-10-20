import "server-only";
import { createClient } from "@supabase/supabase-js";

// Public reads that do not touch the visitor's session, so marketing and profile pages can be cached.
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured.");

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
