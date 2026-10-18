import InfoPage from "@/components/InfoPage";

export const metadata = { title: "Terms of use · pagzi.online" };

export default function TermsPage() {
  return (
    <InfoPage title="Terms of use">
      <p>By creating an account you agree to use pagzi.online for your own public page and the sites you add to it.</p>
      <p>
        You keep the text, photos, and site details you add. You are responsible for having the right to publish them.
        Connecting Google Search Console lets pagzi.online read the traffic for the sites you choose and show it on your
        page.
      </p>
      <p>
        The public page is a one-time payment of $9 for the first 30 users, with no subscription. After that, the price goes up. You can stop using the account at any time. We may suspend a page that is used
        to break the law or to harm other people.
      </p>
    </InfoPage>
  );
}
