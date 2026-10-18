import InfoPage from "@/components/InfoPage";

export const metadata = { title: "About us · pagzi.online" };

export default function AboutPage() {
  return (
    <InfoPage title="About us">
      <p>
        pagzi.online is a public page for people who build websites. You add your name, photo, and sites, connect Google
        Search Console, and share clicks and impressions in one link.
      </p>
      <p>Sohail Shaikh built pagzi.online. The example page is pagzi.online/sohail.</p>
    </InfoPage>
  );
}
