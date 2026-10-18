import {
  Caveat,
  DM_Mono,
  DM_Sans,
  Fraunces,
  IBM_Plex_Mono,
  Inter,
  Lora,
  Newsreader,
  Nunito,
  Outfit,
  Playfair_Display,
  Poppins,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  preload: false,
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
  preload: false,
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  preload: false,
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fraunces",
  preload: false,
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-poppins",
  preload: false,
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-nunito",
  preload: false,
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-playfair",
  preload: false,
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-lora",
  preload: false,
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-newsreader",
  preload: false,
  display: "swap",
});

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-plex",
  preload: false,
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-caveat",
  preload: false,
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  preload: false,
  display: "swap",
});

export const metadata = {
  title: "pagzi.online",
  description: "Your personal page for everything you're building.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${outfit.variable} ${space.variable} ${dmSans.variable} ${fraunces.variable} ${poppins.variable} ${nunito.variable} ${playfair.variable} ${lora.variable} ${newsreader.variable} ${plex.variable} ${caveat.variable} ${dmMono.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
