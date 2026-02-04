import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import FooterTransition from "@/components/Footer/FooterTransition";
import { Player } from "@/components/Player/Player";
import { Suspense } from "react";
import { SITE_URL, PODCAST_URLS, SOCIAL_URLS } from "@/helpers/config";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "La Boîte de Chocolat | Podcast Cinéma Français - Critiques & Analyses de Films",
    template: "%s | La Boîte de Chocolat",
  },
  description:
    "Le podcast cinéma français qui analyse vos films préférés avec mauvaise foi. Des centaines d'épisodes de critiques : blockbusters, Marvel, classiques et films d'auteur. Disponible sur Spotify, Apple Podcasts et Deezer.",
  keywords: [
    "podcast cinéma",
    "podcast film",
    "critique cinéma",
    "podcast cinéma français",
    "analyse film",
    "critique film podcast",
    "La Boîte de Chocolat",
  ],
  authors: [{ name: "La Boîte de Chocolat" }],
  creator: "La Boîte de Chocolat",
  publisher: "La Boîte de Chocolat",
  icons: {
    icon: [
      { url: "/images/icons/favicon.ico", sizes: "32x32 48x48", type: "image/x-icon" },
      { url: "/images/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/icons/android-icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/icons/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/icons/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/images/icons/apple-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "La Boîte de Chocolat | Podcast Cinéma Français",
    description:
      "Le podcast cinéma français qui analyse vos films préférés avec mauvaise foi. Des centaines d'épisodes de critiques disponibles.",
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "La Boîte de Chocolat",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "La Boîte de Chocolat - Podcast Cinéma Français",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "La Boîte de Chocolat | Podcast Cinéma Français",
    description:
      "Le podcast cinéma français qui analyse vos films préférés avec mauvaise foi. Des centaines d'épisodes de critiques.",
    images: ["/twitter-image"],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: "entertainment",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6b3e26",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "La Boîte de Chocolat",
  alternateName: "La BDC",
  url: SITE_URL,
  description:
    "Le podcast cinéma français qui analyse vos films préférés avec mauvaise foi.",
  inLanguage: "fr-FR",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/episodes?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "La Boîte de Chocolat",
  url: SITE_URL,
  logo: `${SITE_URL}/images/icons/web-app-manifest-512x512.png`,
  description:
    "Podcast cinéma français - critiques et analyses de films avec mauvaise foi.",
  sameAs: [
    `https://www.instagram.com/${SOCIAL_URLS.instagram1}`,
    PODCAST_URLS.spotify,
    PODCAST_URLS.apple,
    PODCAST_URLS.deezer,
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "laboitedechocolatmail@gmail.com",
    availableLanguage: "French",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <GoogleAnalytics gaId="G-Z1Y3QWL2C5" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
        <Suspense fallback={null}>
          <FooterTransition />
          <Player />
        </Suspense>
      </body>
    </html>
  );
}
