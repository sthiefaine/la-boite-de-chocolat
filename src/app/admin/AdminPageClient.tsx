"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./AdminPage.module.css";
import { getAdminStats } from "../actions/admin";

interface AdminCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  href: string;
  stats?: {
    label: string;
    value: string;
  };
}

interface AdminStats {
  episodes: number;
  films: number;
  links: number;
  sagas: number;
}

const adminCards: AdminCard[] = [
  {
    id: "users",
    title: "Utilisateurs",
    description: "Gérer les utilisateurs, rôles et permissions",
    icon: "👥",
    color: "red",
    href: "/admin/users",
  },
  {
    id: "podcasts",
    title: "Podcasts",
    description: "Gérer les épisodes et les liens avec les films",
    icon: "🎧",
    color: "chocolate",
    href: "/admin/list/podcast/la-boite-de-chocolat",
  },
  {
    id: "films",
    title: "Films",
    description: "Base de données des films et sagas",
    icon: "🎬",
    color: "blue",
    href: "/admin/list/films",
  },
  {
    id: "import",
    title: "Import RSS",
    description: "Importer de nouveaux contenus",
    icon: "📥",
    color: "green",
    href: "/api/import/la-boite-de-chocolat",
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Statistiques et performances",
    icon: "📊",
    color: "purple",
    href: "/admin/analytics",
  },
];

export default function AdminPageClient() {
  const [isImporting, setIsImporting] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    episodes: 0,
    films: 0,
    links: 0,
    sagas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Page admin chargée - authentification réussie !");
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const adminStats = await getAdminStats();
      setStats(adminStats);
    } catch (error) {
      console.error("Erreur lors du chargement des stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const response = await fetch("/api/import/la-boite-de-chocolat");
      if (response.ok) {
        alert("Import réussi !");
        // Recharger les stats après l'import
        await loadStats();
      } else {
        alert("Erreur lors de l'import");
      }
    } catch (error) {
      alert("Erreur lors de l'import");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Administration</h1>
            <p className={styles.subtitle}>
              Gestion du contenu et des données de La Boîte de Chocolat
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/" className={styles.backButton}>
              <span className={styles.backIcon}>←</span>
              Retour au site
            </Link>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎧</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {loading ? "..." : stats.episodes}
              </div>
              <div className={styles.statLabel}>Épisodes</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎬</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {loading ? "..." : stats.films}
              </div>
              <div className={styles.statLabel}>Films</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🔗</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {loading ? "..." : stats.links}
              </div>
              <div className={styles.statLabel}>Liens</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📈</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {loading ? "..." : stats.sagas}
              </div>
              <div className={styles.statLabel}>Sagas</div>
            </div>
          </div>
        </div>

        <div className={styles.cardsGrid}>
          {adminCards.map((card) => (
            <div
              key={card.id}
              className={`${styles.card} ${styles[card.color]}`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>{card.icon}</div>
                <div className={styles.cardTitle}>{card.title}</div>
              </div>
              <p className={styles.cardDescription}>{card.description}</p>
              <div className={styles.cardActions}>
                {card.id === "import" ? (
                  <button
                    onClick={handleImport}
                    disabled={isImporting}
                    className={styles.importButton}
                  >
                    {isImporting ? "Import..." : "Importer"}
                  </button>
                ) : (
                  <Link
                    href={card.href}
                    className={styles.cardButton}
                    style={{ color: "white", textDecoration: "none" }}
                  >
                    Accéder
                    <span className={styles.buttonArrow}>→</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 