import InfoPage from "@/components/InfoPage";
import { LAUNCH_DEAL_PRICE, LAUNCH_DEAL_SPOTS, LIFETIME_PRICE, YEARLY_PRICE, formatPrice } from "@/lib/plans";

export const metadata = { title: "Refund policy · pagzi.online" };

export default function RefundPage() {
  return (
    <InfoPage title="Refund policy">
      <p>
        Every price on pagzi.online is a one-time payment. There is no subscription and nothing renews automatically.
      </p>
      <p>
        The Launch deal is ${formatPrice(LAUNCH_DEAL_PRICE)}, lifetime access, and only the first {LAUNCH_DEAL_SPOTS} spots. The 1-Year Pass is ${formatPrice(YEARLY_PRICE)} and keeps your public page
        for one year from the day you pay. It does not charge you again. The Lifetime Deal is ${formatPrice(LIFETIME_PRICE)} and opens after the launch spots are sold out. You pay once and
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
