"use client";

import { useState, useEffect } from "react";
import styles from "./AdminPage.module.css";
import { getAdminStats } from "../actions/admin";
import AdminHeader from "@/components/Admin/AdminHeader/AdminHeader";
import StatsGrid from "@/components/Admin/StatsGrid/StatsGrid";
import AdminCardsGrid from "@/components/Admin/AdminCardsGrid/AdminCardsGrid";

interface AdminStats {
  episodes: number;
  films: number;
  links: number;
  sagas: number;
}

const adminCards = [
  {
    id: "podcasts",
    title: "Podcasts",
    description: "Gérer les épisodes et les liens avec les films",
    icon: "🎧",
    color: "chocolate" as const,
    href: "/admin/list/podcast/la-boite-de-chocolat",
  },
  {
    id: "films",
    title: "Films",
    description: "Base de données des films et sagas",
    icon: "🎬",
    color: "blue" as const,
    href: "/admin/list/films",
  },
  {
    id: "users",
    title: "Utilisateurs",
    description: "Gérer les utilisateurs, rôles et permissions",
    icon: "👥",
    color: "red" as const,
    href: "/admin/users",
  },
  {
    id: "import",
    title: "Import RSS",
    description: "Importer de nouveaux contenus",
    icon: "📥",
    color: "green" as const,
    buttonText: "Importer",
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Statistiques et performances",
    icon: "📊",
    color: "purple" as const,
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

  const statsData = [
    { icon: "🎧", value: stats.episodes, label: "Épisodes" },
    { icon: "🔗", value: stats.links, label: "Liens" },
    { icon: "📈", value: stats.sagas, label: "Sagas" },
    { icon: "🎬", value: stats.films, label: "Films" },
  ];

  const cardsWithHandlers = adminCards.map((card) => {
    if (card.id === "import") {
      return {
        ...card,
        onClick: handleImport,
        loading: isImporting,
      };
    }
    return card;
  });

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <AdminHeader
          title="Administration"
          subtitle="Gestion du contenu et des données de La Boîte de Chocolat"
          backHref="/"
          backText="Retour au site"
        />

        <StatsGrid stats={statsData} loading={loading} />

        <AdminCardsGrid cards={cardsWithHandlers} />
      </div>
    </div>
  );
}
