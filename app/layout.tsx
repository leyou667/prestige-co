import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { EntryGate, gateBootScript } from "@/components/gate/entry-gate";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { JsonLd } from "@/components/json-ld";
import { SITE } from "@/lib/site";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-display",
  display: "swap",
});
const sans = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "PRESTIGE CONCIERGERIE — Location de voitures, de l'économique à la supercar",
    template: "%s | PRESTIGE CONCIERGERIE",
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    locale: "fr_BE",
    siteName: SITE.name,
    url: SITE.url,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const organization = {
  "@context": "https://schema.org",
  "@type": "AutoRental",
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}${SITE.logo}`,
  image: `${SITE.url}/opengraph-image.jpg`,
  description: SITE.description,
  telephone: SITE.phone,
  email: SITE.email,
  priceRange: "€€ - €€€€",
  areaServed: [
    { "@type": "Country", name: "Belgique" },
    { "@type": "AdministrativeArea", name: "Hauts-de-France" },
    { "@type": "City", name: "Paris" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: gateBootScript }} />
      </head>
      <body>
        <EntryGate />
        <div id="site-root" className="flex min-h-screen flex-col overflow-x-clip">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <WhatsAppFloat />
        <JsonLd data={organization} />
      </body>
    </html>
  );
}
