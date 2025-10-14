import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BitcoinWalletProvider } from "../lib/bitcoin/BitcoinWalletContext";
import { StarknetProvider } from "@/lib/starknet/StarknetProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enter the Dojo",
  description: "Trade game assets across Dojo-powered games with Bitcoin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <BitcoinWalletProvider network="testnet"> */}
        <BitcoinWalletProvider network="testnet4">
          <StarknetProvider>
            {children}
          </StarknetProvider>
        </BitcoinWalletProvider>
      </body>
    </html>
  );
}
