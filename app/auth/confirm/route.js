import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  // Default Supabase emails arrive with `code`; custom email templates (after SMTP setup) use `token_hash`.
  if (code || (tokenHash && type)) {
    const supabase = await createClient();
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) redirect("/admin");
    redirect("/login?error=confirm_failed");
  }

  redirect("/login?error=invalid_link");
}
