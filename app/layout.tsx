import type { Metadata, Viewport } from "next";
import { Imbue, Albert_Sans } from "next/font/google";
import { asset } from "./asset";
import "./globals.css";

const f_imbue = Imbue({ variable: "--f-imbue", subsets: ["latin"], axes: ["opsz"], display: "swap" });
const f_albert = Albert_Sans({ variable: "--f-albert", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Shizuka Luxury | Sell your luxury pieces privately in Dubai",
  description:
    "Get cash for your handbags, watches and jewellery within 72 hours. Shizuka collects, authenticates and gathers private offers on your behalf.",
  openGraph: {
    title: "Shizuka Luxury",
    description: "A private way to sell your handbags, watches and jewellery in Dubai. Cash within 72 hours.",
    images: [{ url: asset("/images/lounge-goyard.jpg"), width: 2000, height: 1333, alt: "Seen from above: a woman in black on a cream boucl\u00e9 sofa, a yellow Goyard clutch in her hands" }],
    locale: "en_GB",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B2826",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${f_imbue.variable} ${f_albert.variable}`}>
      <body>{children}</body>
    </html>
  );
}
