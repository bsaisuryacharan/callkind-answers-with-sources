import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({ variable: "--font-sans", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL("https://answers-with-sources.bsaisuryacharan.chatgpt.site"),
  title: "Answers With Sources — Callkind",
  description: "An interactive reference build for evidence-grounded answers, claim-level citations, safe abstention and inspectable evaluation.",
  openGraph: { title: "Answers With Sources — Callkind", description: "Evidence before confidence.", images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Answers With Sources — Callkind", description: "Evidence before confidence.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${sans.variable} ${serif.variable}`}>{children}</body></html>;
}
