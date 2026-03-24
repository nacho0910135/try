import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { LanguageProvider } from "@/components/layout/LanguageProvider";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const adsenseClientId = "ca-pub-2377742951907894";
const siteName = "BienesRaicesCR";
const defaultTitle = "Mapa y radar inmobiliario de Costa Rica";
const defaultDescription =
  "Explora venta y renta en Costa Rica con mapa interactivo, alertas, comparativas y señales de mercado.";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/property-placeholder.svg`
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      description: defaultDescription,
      inLanguage: "es-CR",
      publisher: {
        "@id": `${siteUrl}/#organization`
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    }
  ]
};

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | ${defaultTitle}`,
    template: `%s | ${siteName}`
  },
  description: defaultDescription,
  applicationName: siteName,
  category: "real estate",
  keywords: [
    "bienes raices Costa Rica",
    "casas en venta Costa Rica",
    "alquileres Costa Rica",
    "mapa inmobiliario Costa Rica",
    "lotes Costa Rica",
    "apartamentos Costa Rica"
  ],
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    locale: "es_CR",
    title: `${siteName} | ${defaultTitle}`,
    description: defaultDescription
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | ${defaultTitle}`,
    description: defaultDescription
  }
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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
