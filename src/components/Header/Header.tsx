"use server";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { getUser } from "@/lib/auth/auth-server";
import { MobileMenu } from "./MobileMenu";
import AuthButtonClient from "./AuthButtonClient";

import styles from "./Header.module.css";


const ButtonSkeleton = ({ className }: { className: string }) => (
  <div className={`${className}`}>
    <div>Chargement</div>
  </div>
);

export default async function Header() {
  const user = await getUser();

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

        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            Accueil
          </Link>
          <Link href="/episodes" className={styles.navLink}>
            Épisodes
          </Link>
          <Link href="/options" className={styles.navLink}>
            Options
          </Link>
          <Suspense fallback={<ButtonSkeleton className={styles.navLink} />}>
            <ProfileLinkConditional className={styles.navLink} />
          </Suspense>
          <Suspense fallback={<ButtonSkeleton className={styles.navLink} />}>
            <AuthButtonClient 
              className={styles.navLink} 
              isAuthenticated={!!user}
            />
          </Suspense>
        </nav>

        <MobileMenu user={user} />
      </div>
    </header>
  );
}

export const ProfileLinkConditional = async ({
  className,
}: {
  className: string;
}) => {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return (
    <Link href="/user/profile" className={className}>
      Profil
    </Link>
  );
};


