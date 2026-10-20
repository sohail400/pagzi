import InfoPage from "@/components/InfoPage";

export const metadata = { title: "Refund policy · pagzi.online" };

export default function RefundPage() {
  return (
    <InfoPage title="Refund policy">
      <p>
        Every price on pagzi.online is a one-time payment. There is no subscription and nothing renews automatically.
      </p>
      <p>
        Early is $9, lifetime access, and only the first 20 spots. The 1-Year Pass is $19 and keeps your public page
        for one year from the day you pay. It does not charge you again. The Lifetime Deal is $29. You pay once and
        keep the page.
      </p>
      <p>
        You can ask for a refund within 7 days of payment. Email the address on the Support page and include the email
        you used to sign up. A full refund removes your public page. A partial refund does not.
      </p>
      <p>
        After 7 days the purchase is final, except where the law requires a refund. Card payments are processed by Dodo
        Payments. pagzi.online does not store your card number.
      </p>
    </InfoPage>
  );
}
