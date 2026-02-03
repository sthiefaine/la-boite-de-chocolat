import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Options",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
