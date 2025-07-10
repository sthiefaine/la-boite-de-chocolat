import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/Header/Header";
import { PlayerBar } from "@/components/Player/PlayerBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "La Boîte de Chocolat - Podcast Cinéma",
  description:
    "Podcast cinéma avec Thomas, Charlie et Thomas. Du cinéma, de la mauvaise foi, un soupçon de beauferie et le tour est joué !",
  icons: {
    icon: "/images/icon/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
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
        <main>
          {children}
        </main>
        <PlayerBar />
      </body>
    </html>
  );
}
