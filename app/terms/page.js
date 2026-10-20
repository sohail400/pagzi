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
        The public page is a one-time payment. Early is $9 for the first 20 spots and lasts for the life of the page.
        The 1-Year Pass is $19 and lasts one year, with no auto-renew. The Lifetime Deal is $29 and lasts for the life
        of the page. There is no subscription. Refunds are described on the refund policy page. You can stop using the
        account at any time. We may suspend a page that is used to break the law or to harm other people.
      </p>
    </InfoPage>
  );
}
