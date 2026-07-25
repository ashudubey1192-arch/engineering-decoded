import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://engineering-decoded.example"),
  title: {
    default: "Engineering Decoded",
    template: "%s | Engineering Decoded",
  },
  description: "Practical architecture for engineers who build production systems.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    type: "article",
    siteName: "Engineering Decoded",
    title: "PostgreSQL LISTEN/NOTIFY with Java",
    description: "Real-time cache invalidation, complete Spring Boot implementation, and the limits you need to know.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
