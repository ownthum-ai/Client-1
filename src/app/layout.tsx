import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { Instrument_Serif, Outfit } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

const instrument = Instrument_Serif({
  weight: "400",
  style: ["normal"],
  subsets: ["latin"],
  variable: '--font-accent',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: '--font-primary',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Ownthum — Real Estate System",
  description: "Administrative dashboard for real estate management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <body className={`${outfit.className} ${instrument.variable} font-sans antialiased`}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
