import InfoPage from "@/components/InfoPage";
import { loadCreator } from "@/components/SiteFooter";

export const metadata = { title: "Support · pagzi.online" };

export default async function SupportPage() {
  const creator = await loadCreator();
  const email = creator?.email_url || "";

  return (
    <InfoPage title="Support">
      <p>
        Questions about your page, sign-in, a payment, or a refund can go straight to Sohail. Refund requests need to
        arrive within 7 days of payment.
      </p>
      {email ? (
        <p>
          Email{" "}
          <a className="font-semibold text-white underline" href={email}>
            {email.replace(/^mailto:/i, "")}
          </a>
          .
        </p>
      ) : (
        <p>Use the email link in the footer to write to Sohail.</p>
      )}
    </InfoPage>
  );
}
