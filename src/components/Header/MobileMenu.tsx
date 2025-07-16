"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import styles from "./Header.module.css";
import { User } from "@/lib/auth/auth-client";
import { signOutAction } from "@/app/actions/auth";

interface MobileMenuProps {
  user?: User;
}

export function MobileMenu({ user }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  if (!mounted) {
    return (
      <button className={styles.menuButton} onClick={toggleMenu}>
        <Menu size={24} className={styles.menuIcon} />
        <X size={24} className={styles.closeIcon} />
      </button>
    );
  }

  return (
    <>
      <button
        className={styles.menuButton}
        onClick={toggleMenu}
        data-open={isOpen}
      >
        <Menu size={24} className={styles.menuIcon} />
        <X size={24} className={styles.closeIcon} />
      </button>

      {isOpen && (
        <nav className={styles.mobileNav}>
          <Link
            href="/"
            className={styles.mobileNavLink}
            onClick={handleLinkClick}
          >
            Accueil
          </Link>
          <Link
            href="/episodes"
            className={styles.mobileNavLink}
            onClick={handleLinkClick}
          >
            Épisodes
          </Link>
          <Link
            href="/options"
            className={styles.mobileNavLink}
            onClick={handleLinkClick}
          >
            Options
          </Link>
          {user && (
            <MobileProfileLink
              className={styles.mobileNavLink}
              onLinkClick={handleLinkClick}
              user={user}
            />
          )}
          <MobileAuthButton
            className={styles.mobileNavLink}
            onLinkClick={handleLinkClick}
            user={user}
          />
        </nav>
      )}
    </>
  );
}

function MobileProfileLink({
  className,
  onLinkClick,
  user,
}: {
  className: string;
  onLinkClick: () => void;
  user: User;
}) {
  if (!user) {
    return null;
  }

  return (
    <Link href="/user/profile" className={className} onClick={onLinkClick}>
      Profil
    </Link>
  );
}

function MobileAuthButton({
  className,
  onLinkClick,
  user,
}: {
  className: string;
  onLinkClick: () => void;
  user?: User;
}) {
  const pathname = usePathname();

  if (!user) {
    // Construire l'URL avec la callbackUrl
    const signInUrl =
      pathname === "/"
        ? "/signin"
        : `/signin?callbackUrl=${encodeURIComponent(pathname)}`;

    return (
      <Link href={signInUrl} className={className} onClick={onLinkClick}>
        Connexion
      </Link>
    );
  }

  const handleSignOut = async () => {
    try {
      onLinkClick();
      const result = await signOutAction(pathname);

      // Si on doit rafraîchir la page (pages normales)
      if (result?.shouldRefresh) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <button type="button" className={className} onClick={handleSignOut}>
      Déconnexion
    </button>
  );
}
