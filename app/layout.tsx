import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RedStory - Erotische Geschichten",
  description: "Erlebe fesselnde erotische Geschichten mit passenden Live-Cam-Empfehlungen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <meta name="rating" content="RTA-5042-1996-1400-1577-RTA" />
        <meta name="rating" content="adult" />
        <meta name="RATING" content="RTA-5042-1996-1400-1577-RTA" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
