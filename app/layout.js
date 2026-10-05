import { DM_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

export const metadata = {
  title: "indie.site",
  description: "Your personal page for everything you're building.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmMono.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
