import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/auth-server";
import { isAdminRole, ROLE_LABELS } from "@/lib/auth/auth-helpers";
import styles from "./ProfilePage.module.css";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const user = session.user;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Mon Profil</h1>
            <p className={styles.subtitle}>
              Gérez vos informations personnelles
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/" className={styles.backLink}>
              ← Retour à l'accueil
            </Link>
          </div>
        </div>

        <div className={styles.mainCard}>
          <div className={styles.profileSection}>
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                <span className={styles.avatarText}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className={styles.userInfo}>
                <h2 className={styles.userName}>{user.name}</h2>
                <p className={styles.userEmail}>{user.email}</p>
              </div>
            </div>

            <div className={styles.detailsSection}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Rôle :</span>
                <span
                  className={`${styles.roleBadge} ${
                    styles[
                      `role${
                        (user.role || "user").charAt(0).toUpperCase() +
                        (user.role || "user").slice(1)
                      }`
                    ]
                  }`}
                >
                  {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ||
                    "Utilisateur"}
                </span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Membre depuis :</span>
                <span className={styles.detailValue}>
                  {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {user.banned && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Statut :</span>
                  <span
                    className={`${styles.statusBadge} ${styles.statusBanned}`}
                  >
                    Compte suspendu
                  </span>
                  {user.banReason && (
                    <p className={styles.banReason}>
                      Raison : {user.banReason}
                    </p>
                  )}
                </div>
              )}
            </div>

            {isAdminRole(user.role || null) && (
              <div className={styles.adminSection}>
                <h3 className={styles.adminTitle}>Administration</h3>
                <p className={styles.adminDescription}>
                  Vous avez accès aux fonctionnalités d'administration.
                </p>
                <Link href="/admin" className={styles.adminLink}>
                  Accéder à l'administration
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
