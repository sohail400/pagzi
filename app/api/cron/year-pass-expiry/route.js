import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { sendYearPassExpiryEmails } from "@/lib/year-pass-mail";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authorized(request) {
  const secret = process.env.CRON_SECRET || "";
  const header = request.headers.get("authorization") || "";
  const expected = `Bearer ${secret}`;
  if (!secret || header.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}

export async function GET(request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await sendYearPassExpiryEmails();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Year-pass expiry emails failed:", error);
    return NextResponse.json({ error: "Could not send expiry emails." }, { status: 500 });
  }
}
