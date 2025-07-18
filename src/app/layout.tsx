import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import FooterTransition from "@/components/Footer/FooterTransition";
import { Player } from "@/components/Player/Player";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "La Boîte de Chocolat - Podcast Cinéma",
  description:
    "Podcast cinéma avec Thomas, Charlie et Thomas. Du cinéma, de la mauvaise foi, un soupçon de beauferie et le tour est joué !",
  icons: {
    icon: "/images/icons/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "La Boîte de Chocolat - Podcast Cinéma",
    description:
      "Podcast cinéma avec Thomas, Charlie et Thomas. Du cinéma, de la mauvaise foi, un soupçon de beauferie et le tour est joué !",
    type: "website",
    locale: "fr_FR",
    siteName: "La Boîte de Chocolat",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "La Boîte de Chocolat - Podcast Cinéma",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "La Boîte de Chocolat - Podcast Cinéma",
    description:
      "Podcast cinéma avec Thomas, Charlie et Thomas. Du cinéma, de la mauvaise foi, un soupçon de beauferie et le tour est joué !",
    images: ["/twitter-image"],
  },
  verification: {
    google: "jrDp0QVGcGDSNDLuJYNCjT9n7upHjSNow3WRqDNGFDc",
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
