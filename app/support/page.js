import InfoPage from "@/components/InfoPage";
import { loadCreator } from "@/components/SiteFooter";

export const metadata = { title: "Support · pagzi.online" };

export default async function SupportPage() {
  const creator = await loadCreator();
  const email = creator?.email_url || "";

  return (
    <InfoPage title="Support">
      <p>Questions about your page, sign-in, or connecting Google Search Console can go straight to Sohail.</p>
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
