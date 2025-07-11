import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import styles from "./UnauthorizedPage.module.css";

export default async function UnauthorizedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header avec icône */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <svg
              className={styles.icon}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className={styles.title}>Accès non autorisé</h1>
        </div>

        {/* Contenu */}
        <div className={styles.content}>
          {!session?.user ? (
            // Utilisateur non connecté
            <div className={styles.section}>
              <div className={styles.centerContent}>
                <div className={`${styles.iconContainer} ${styles.red}`}>
                  <svg
                    className={`${styles.icon} ${styles.red}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h2 className={styles.subtitle}>Connexion requise</h2>
                <p className={styles.description}>
                  Vous devez être connecté pour accéder à cette page
                </p>
              </div>
              <Link
                href="/signin"
                className={`${styles.button} ${styles.primary}`}
              >
                <svg
                  className={styles.buttonIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Se connecter
              </Link>
            </div>
          ) : session.user.role !== "admin" ? (
            // Utilisateur connecté mais pas admin
            <div className={styles.section}>
              <div className={styles.centerContent}>
                <div className={`${styles.iconContainer} ${styles.orange}`}>
                  <svg
                    className={`${styles.icon} ${styles.orange}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className={styles.subtitle}>Permissions insuffisantes</h2>
                <p className={styles.description}>
                  Vous n'avez pas les droits nécessaires pour accéder à cette
                  page
                </p>
                <div className={styles.userInfo}>
                  Connecté en tant que :{" "}
                  <span className={styles.userEmail}>{session.user.email}</span>
                </div>
              </div>
              <Link href="/" className={`${styles.button} ${styles.secondary}`}>
                <svg
                  className={styles.buttonIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Retour à l'accueil
              </Link>
            </div>
          ) : (
            // Utilisateur connecté et admin (cas improbable mais géré)
            <div className={styles.section}>
              <div className={styles.centerContent}>
                <div className={`${styles.iconContainer} ${styles.green}`}>
                  <svg
                    className={`${styles.icon} ${styles.green}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className={styles.subtitle}>Accès autorisé</h2>
                <p className={styles.description}>
                  Vous avez les droits nécessaires pour accéder à cette page
                </p>
                <div className={styles.userInfo}>
                  Connecté en tant que :{" "}
                  <span className={styles.userEmail}>{session.user.email}</span>
                </div>
              </div>
              <div className={styles.buttonGroup}>
                <Link
                  href="/admin"
                  className={`${styles.button} ${styles.primary}`}
                >
                  <svg
                    className={styles.buttonIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Aller à l'administration
                </Link>
                <Link
                  href="/"
                  className={`${styles.button} ${styles.secondary}`}
                >
                  <svg
                    className={styles.buttonIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Retour à l'accueil
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
