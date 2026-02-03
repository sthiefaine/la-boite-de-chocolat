import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accès non autorisé",
  robots: {
    index: false,
    follow: false,
  },
};

export default function UnauthorizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
