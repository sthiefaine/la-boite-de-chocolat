import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import styles from "./Header.module.css";
import { getUser } from "@/lib/auth/auth-server";
import { Suspense } from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const ButtonSkeleton = ({ className }: { className: string }) => (
  <div className={`${className}`}>
    <div>Chargement</div>
  </div>
);

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>
            <Image
              src="/images/icon.png"
              alt="Logo"
              width={32}
              height={32}
              className={styles.logoIcon}
            />
          </span>
          <span className={styles.logoText}>La Boîte de Chocolat</span>
        </Link>

        <input
          type="checkbox"
          id="mobile-menu-toggle"
          className={styles.mobileMenuToggle}
        />

        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            Accueil
          </Link>
          <Link href="/podcasts" className={styles.navLink}>
            Podcasts
          </Link>
          <Link href="/options" className={styles.navLink}>
            Options
          </Link>
          <Suspense fallback={<ButtonSkeleton className={styles.navLink} />}>
            <AdminLinkConditional className={styles.navLink} />
          </Suspense>
          <Suspense fallback={<ButtonSkeleton className={styles.navLink} />}>
            <AuthButton className={styles.navLink} />
          </Suspense>
        </nav>

        {/* Bouton hamburger */}
        <label htmlFor="mobile-menu-toggle" className={styles.menuButton}>
          <Menu size={24} className={styles.menuIcon} />
          <X size={24} className={styles.closeIcon} />
        </label>

        {/* Menu mobile */}
        <nav className={styles.mobileNav}>
          <Link href="/" className={styles.mobileNavLink}>
            Accueil
          </Link>
          <Link href="/podcasts" className={styles.mobileNavLink}>
            Podcasts
          </Link>
          <Link href="/options" className={styles.mobileNavLink}>
            Options
          </Link>
          <Suspense fallback={<ButtonSkeleton className={styles.mobileNavLink} />}>
            <AdminLinkConditional className={styles.mobileNavLink} />
          </Suspense>
          <Suspense fallback={<ButtonSkeleton className={styles.mobileNavLink} />}>
            <AuthButton className={styles.mobileNavLink} />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}

export const AdminLinkConditional = async ({
  className,
}: {
  className: string;
}) => {
  const user = await getUser();

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <Link href="/admin" className={className}>
      Admin
    </Link>
  );
};

export const AuthButton = async ({
  className,
}: {
  className?: string;
}) => {

  const user = await getUser();

  if (!user) {
    return (
      <Link href="/signin" className={className}>
        Connexion
      </Link>
    );
  }

  async function signOutAction() {
    "use server";
    await auth.api.signOut({
      headers: await headers(),
    });
    redirect("/signin");
  }

  return (
    <form action={signOutAction}>
      <button type="submit" className={className}>
        Déconnexion
      </button>
    </form>
  );
};
