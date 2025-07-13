"use server";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { getUser } from "@/lib/auth/auth-server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MobileMenu } from "./MobileMenu";
import styles from "./Header.module.css";


const ButtonSkeleton = ({ className }: { className: string }) => (
  <div className={`${className}`}>
    <div>Chargement</div>
  </div>
);

export default async function Header() {
  const user = await getUser();

  async function signOutAction() {
    "use server";
    await auth.api.signOut({
      headers: await headers(),
    });
    redirect("/signin");
  }

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
            <AdminLinkConditional className={styles.navLink} />
          </Suspense>
          <Suspense fallback={<ButtonSkeleton className={styles.navLink} />}>
            <AuthButton className={styles.navLink} />
          </Suspense>
        </nav>

        <MobileMenu user={user} onSignOut={signOutAction} />
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
