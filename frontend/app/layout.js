import { DM_Sans, Fraunces } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans"
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif"
});

export const metadata = {
  title: "AlquiVentasCR",
  description: "Compra, renta y lotes en Costa Rica con exploracion geoespacial moderna."
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${sans.variable} ${serif.variable} font-sans`}>
        <SiteHeader />
        <main className="min-h-[calc(100vh-160px)]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
