import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BitcoinWalletProvider } from "../lib/bitcoin/BitcoinWalletContext";
import { StarknetProvider } from "@/lib/starknet/StarknetProvider";
import { SessionManager } from "@/components/SessionManager";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enter The Dojo - Universal On-Chain Gaming Marketplace",
  description: "Trade game assets across Dojo-powered games with Bitcoin. One identity, one marketplace, infinite possibilities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900`}
      >
        {/* <BitcoinWalletProvider network="testnet"> */}
        <BitcoinWalletProvider network="testnet4">
          <StarknetProvider>
            <Navigation />
            <SessionManager />
            <main className="pt-16">
              {children}
            </main>
          </StarknetProvider>
        </BitcoinWalletProvider>
      </body>
    </html>
  );
}
