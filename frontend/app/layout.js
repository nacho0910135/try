import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { LanguageProvider } from "@/components/layout/LanguageProvider";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const adsenseClientId = "ca-pub-2377742951907894";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "BienesRaicesCR",
  description: "Compra, renta y lotes en Costa Rica con exploracion geoespacial moderna."
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans">
        <LanguageProvider>
          <AnalyticsProvider>
            <SiteHeader />
            <main className="min-h-[calc(100vh-160px)]">{children}</main>
            <SiteFooter />
            <CookieBanner />
          </AnalyticsProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
