import "server-only";

import { isBuilderAccount } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { isYearPassDue, yearPassExpiryEmail } from "@/lib/year-pass-expiry";

const BATCH = 20;

async function sendEmail(to) {
  const apiKey = process.env.RESEND_API_KEY || "";
  if (!apiKey) throw new Error("RESEND_API_KEY is not set.");
  const { subject, html } = yearPassExpiryEmail();
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Pagzi <noreply@pagzi.online>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!response.ok) {
    console.error("Sending a year-pass expiry email failed:", response.status);
    throw new Error("Could not send the expiry email.");
  }
}

export async function sendYearPassExpiryEmails(now = new Date()) {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set.");
  const admin = createAdminClient();
  const due = await admin
    .from("profiles")
    .select("id, username, plan, paid_at, plan_expires_at, year_expiry_email_sent_at")
    .eq("plan", "year")
    .not("paid_at", "is", null)
    .lte("plan_expires_at", now.toISOString())
    .is("year_expiry_email_sent_at", null)
    .limit(BATCH);
  if (due.error) throw due.error;

  let sent = 0;
  let failed = 0;
  for (const profile of due.data || []) {
    if (!isYearPassDue(profile, now) || isBuilderAccount(profile.username)) continue;
    const user = await admin.auth.admin.getUserById(profile.id);
    const email = user.data?.user?.email || "";
    if (!email) {
      failed += 1;
      console.error("A year-pass expiry email has no account email:", profile.id);
      continue;
    }

    const claimedAt = new Date().toISOString();
    const claim = await admin
      .from("profiles")
      .update({ year_expiry_email_sent_at: claimedAt })
      .eq("id", profile.id)
      .is("year_expiry_email_sent_at", null)
      .select("id");
    if (claim.error || !claim.data?.length) {
      failed += claim.error ? 1 : 0;
      if (claim.error) console.error("Claiming a year-pass expiry email failed:", profile.id, claim.error);
      continue;
    }

    try {
      await sendEmail(email);
      sent += 1;
    } catch (error) {
      failed += 1;
      console.error("A year-pass expiry email was not sent:", profile.id, error);
      await admin
        .from("profiles")
        .update({ year_expiry_email_sent_at: null })
        .eq("id", profile.id)
        .eq("year_expiry_email_sent_at", claimedAt);
    }
  }

  return { sent, failed };
}
