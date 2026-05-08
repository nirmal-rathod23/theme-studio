import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeInjector from "@/components/ThemeInjector";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Branding & Theme Studio",
  description: "A premium 2026-style visual branding and theme builder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ThemeInjector />
        {children}
      </body>
    </html>
  );
}
