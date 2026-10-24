export const YEAR_PASS_RENEW_URL = "https://pagzi.online/login?plan=year";

export function isYearPassDue(profile, now = new Date()) {
  if (!profile || profile.plan !== "year" || !profile.paid_at || profile.year_expiry_email_sent_at) return false;
  const expires = Date.parse(profile.plan_expires_at || "");
  const time = now instanceof Date ? now.getTime() : Date.parse(now);
  return Number.isFinite(expires) && Number.isFinite(time) && expires <= time;
}

export function yearPassExpiryEmail() {
  const subject = "Your Pagzi 1-Year Pass has ended";
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#1f1f1f;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Your 1-Year Pass has ended. Renew it to bring your page back.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1f1f1f;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">
          <tr>
            <td style="padding:0 0 20px 4px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right:10px;vertical-align:middle;">
                    <img src="https://pagzi.online/pagzi-logo.png" width="32" height="49" alt="Pagzi" style="display:block;border:0;outline:none;text-decoration:none;" />
                  </td>
                  <td style="vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:1;font-weight:700;color:#f5f5f4;">Pagzi</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#111111;border:1px solid #2a2a2a;border-radius:16px;padding:28px 24px;">
              <h1 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.3;font-weight:700;color:#f5f5f4;">Your plan has ended</h1>
              <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#d6d3d1;">Your 1-Year Pass has ended, so your public page is offline. Renew it to show your Google Search Console clicks and impressions again. This is a one-time payment. It does not renew by itself.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="#ff78b7" style="border-radius:999px;background-color:#ff78b7;">
                    <a href="${YEAR_PASS_RENEW_URL}" style="display:block;padding:14px 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">Renew my page</a>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#a8a29e;">If the button does not work, copy and paste this link into your browser:</p>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;word-break:break-all;"><a href="${YEAR_PASS_RENEW_URL}" style="color:#ff78b7;text-decoration:underline;">${YEAR_PASS_RENEW_URL}</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#a8a29e;">
              Pagzi turns your Google Search Console clicks and impressions into a public page.<br />
              <a href="https://pagzi.online/" style="color:#ff78b7;text-decoration:none;">https://pagzi.online/</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  return { subject, html };
}
