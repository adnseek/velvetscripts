import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AgeGate from "@/components/AgeGate";

const inter = Inter({ subsets: ["latin"] });
const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "VelvetScripts - Hot Story Magazine",
  description: "Discover captivating erotic stories with matching live cam recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* RTA (Restricted to Adults) — standard adult content label */}
        <meta name="rating" content="RTA-5042-1996-1400-1577-RTA" />
        <meta name="RATING" content="RTA-5042-1996-1400-1577-RTA" />
        {/* General adult rating tags */}
        <meta name="rating" content="adult" />
        <meta name="rating" content="mature" />
        {/* ICRA / SafeSurf labels */}
        <meta httpEquiv="pics-label" content='(pics-1.1 "http://www.icra.org/ratingsv02.html" l gen true for "https://velvetscripts.com" r (nz 1 vz 1 lz 1 oz 1 cz 1) "http://www.rsac.org/ratingsv01.html" l gen true for "https://velvetscripts.com" r (n 4 s 4 v 0 l 4))' />
        {/* Google SafeSearch: mark as adult so it's filtered in safe mode */}
        <meta name="googlebot" content="index, follow" />
      </head>
      <body className={`${inter.className} ${dmSerif.variable}`}>
        {children}
        <AgeGate />
        <Script id="matomo" strategy="afterInteractive">
          {`
            var _paq = window._paq = window._paq || [];
            _paq.push(['trackPageView']);
            _paq.push(['enableLinkTracking']);
            (function() {
              var u="//analytics.velvetscripts.com/";
              _paq.push(['setTrackerUrl', u+'matomo.php']);
              _paq.push(['setSiteId', '1']);
              var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
              g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
