import type { Metadata } from "next";
import { Gloock, Instrument_Sans } from "next/font/google";
import "./globals.css";

const gloock = Gloock({
  weight: "400",
  variable: "--font-gloock",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PoBo — your city's poster board.",
  description:
    "Restaurants, bars and studios post their events. Find what's happening near you right now, on a map, and send it to friends.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${gloock.variable} ${instrumentSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
