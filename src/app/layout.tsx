import type { Metadata, Viewport } from "next";
import "./globals.css";
import ResponsiveLayout from "./components/ResponsiveLayout";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Plinko No Gamble",
  description: "Plinko game but 0-cost version",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div style={{ width: 0, height: 0, overflow: 'hidden', fontFamily: 'plinko_bold' }}>.</div>
        <Script
          src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"
          strategy="beforeInteractive"
        />
        <ResponsiveLayout>{children}</ResponsiveLayout>
      </body>
    </html>
  );
}
