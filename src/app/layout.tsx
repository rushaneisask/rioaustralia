import type { Metadata, Viewport } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";
import { site, divisions } from "@/content/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";

const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], display: "swap" });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.home.seoTitle, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: site.name,
    url: site.url,
    title: site.home.seoTitle,
    description: site.description,
  },
  twitter: { card: "summary_large_image", title: site.home.seoTitle, description: site.description },
  alternates: { canonical: "/" },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  themeColor: "#f3fbfb",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${site.url}/#organization`,
  name: site.name,
  url: site.url,
  logo: `${site.url}/icon.svg`,
  foundingDate: site.foundedDate,
  telephone: "+61421799458",
  ...(site.contact.email ? { email: site.contact.email } : {}),
  areaServed: { "@type": "AdministrativeArea", name: site.region },
  subOrganization: divisions.map((d) => ({
    "@type": "CleaningService",
    "@id": `${site.url}${d.href}#business`,
    name: d.name,
    url: `${site.url}${d.href}`,
    description: d.summary,
    telephone: "+61421799458",
    parentOrganization: { "@id": `${site.url}/#organization` },
    areaServed: site.cleaning.areas.list.map((name) => ({ "@type": "City", name: `${name}, VIC` })),
  })),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-AU" className={`${outfit.variable} ${dmSans.variable} h-full antialiased`} data-brand="group">
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-semibold focus:text-teal-900 focus:shadow-lg"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
