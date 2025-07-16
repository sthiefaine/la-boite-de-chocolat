"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";

interface AuthButtonClientProps {
  className?: string;
  isAuthenticated: boolean;
}

export default function AuthButtonClient({
  className,
  isAuthenticated,
}: AuthButtonClientProps) {
  const pathname = usePathname();

  if (!isAuthenticated) {
    const signInUrl =
      pathname === "/"
        ? "/signin"
        : `/signin?callbackUrl=${encodeURIComponent(pathname)}`;

    return (
      <Link href={signInUrl} className={className}>
        Connexion
      </Link>
    );
  }

  const handleSignOut = async () => {
    const result = await signOutAction(pathname);
    if (result?.shouldRefresh) {
      window.location.reload();
    }
  };

  return (
    <button onClick={handleSignOut} className={className}>
      Déconnexion
    </button>
  );
}
