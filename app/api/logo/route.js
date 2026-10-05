import { NextResponse } from "next/server";
import { isPublicDomain, loadLogo } from "@/lib/logo";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const domain = (request.nextUrl.searchParams.get("domain") ?? "").toLowerCase();
  if (!isPublicDomain(domain)) return new NextResponse(null, { status: 404 });

  const supabase = await createClient();
  const { data } = await supabase.from("sites").select("id").eq("name", domain).limit(1).maybeSingle();
  if (!data) return new NextResponse(null, { status: 404 });

  const logo = await loadLogo(domain);
  if (!logo) return new NextResponse(null, { status: 404 });
  const type = logo.type === "image/svg+xml" ? "image/svg+xml; charset=utf-8" : logo.type;

  return new NextResponse(logo.body, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=86400",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
