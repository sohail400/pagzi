import InfoPage from "@/components/InfoPage";

export const metadata = { title: "Privacy policy · pagzi.online" };

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy policy">
      <p>
        We store the account email you sign up with, the profile you write (name, photo, location, bio, and social
        links), and the websites you add.
      </p>
      <p>
        If you connect Google Search Console, we store an encrypted refresh token and the daily clicks and impressions
        for the sites you choose. That traffic is what appears on your public page.
      </p>
      <p>
        If you pay, Dodo Payments processes the card payment. We store the plan you bought, the time you paid, and the
        payment reference. We do not store your card number.
      </p>
      <p>We use this information to run your account and your page. We do not sell it.</p>
    </InfoPage>
  );
}
