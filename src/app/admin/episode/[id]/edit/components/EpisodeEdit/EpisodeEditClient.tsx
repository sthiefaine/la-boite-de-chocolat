"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateEpisode, deleteEpisodeLink, linkEpisodeToFilm } from "@/app/actions/episode";
import EpisodeInfoCard from "./EpisodeInfoCard";
import EpisodeEditForm from "./EpisodeEditForm";
import FilmsSection from "./FilmsSection";
import LinkFilmForm from "./LinkFilmForm";
import AddFilmForm from "../../AddFilmForm";
import styles from "./EpisodeEditClient.module.css";

interface Film {
  id: string;
  title: string;
  year: number | null;
  director: string | null;
  imgFileName: string | null;
  saga?: {
    name: string;
  } | null;
}

interface EpisodeLink {
  id: string;
  film: Film;
}

interface RSSFeed {
  id: string;
  name: string;
  url: string;
}

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: number | null;
  pubDate: Date;
  audioUrl: string;
  slug: string | null;
  season?: number | null;
  episode?: number | null;
  genre: string | null;
  imgFileName: string | null;
  age: string | null;
  rssFeed: RSSFeed;
  links: EpisodeLink[];
}

interface EpisodeEditClientProps {
  episode: Episode;
  episodeLinks: EpisodeLink[];
}

export default function EpisodeEditClient({
  episode,
  episodeLinks,
}: EpisodeEditClientProps) {
  const router = useRouter();
  const [currentEpisodeLinks, setCurrentEpisodeLinks] = useState(episodeLinks);
  const [showLinkFilmForm, setShowLinkFilmForm] = useState(false);
  const [showCreateFilmForm, setShowCreateFilmForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdateEpisode = async (data: {
    title: string;
    description: string;
    genre: string | null;
    imgFileName: string | null;
    age: string | null;
  }) => {
    setLoading(true);
    try {
      await updateEpisode(episode.id, data);
      // Optionnel : afficher un message de succès
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteEpisodeLink(linkId);
      setCurrentEpisodeLinks((prev) =>
        prev.filter((link) => link.id !== linkId)
      );
    } catch (error) {
      console.error("Erreur lors de la suppression du lien:", error);
    }
  };

  const handleFilmAdded = () => {
    console.log("Film added");
    router.refresh();
  };

  const handleLinkFilm = () => {
    setShowLinkFilmForm(true);
  };

  const handleCreateFilm = () => {
    setShowCreateFilmForm(true);
    console.log("Create film");
    router.refresh();
  };

  const handleCloseLinkFilmForm = () => {
    setShowLinkFilmForm(false);
  };

  const handleCloseCreateFilmForm = () => {
    setShowCreateFilmForm(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Édition de l'épisode</h1>
          <p className={styles.pageSubtitle}>
            Modifiez les informations de l'épisode et gérez les films associés
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link
            href="/admin/list/podcast/la-boite-de-chocolat"
            className={styles.backButton}
          >
            ← Retour à la liste
          </Link>
        </div>
      </div>

      <div className={styles.content}>
        <EpisodeInfoCard episode={episode} />

        <FilmsSection
          episodeLinks={currentEpisodeLinks}
          onLinkFilm={handleLinkFilm}
          onCreateFilm={handleCreateFilm}
          onDeleteLink={handleDeleteLink}
        />

        <EpisodeEditForm
          initialData={{
            title: episode.title,
            description: episode.description,
            genre: episode.genre,
            imgFileName: episode.imgFileName,
            age: episode.age,
          }}
          onSubmit={handleUpdateEpisode}
          loading={loading}
        />
      </div>

      {showLinkFilmForm && (
        <LinkFilmForm
          episodeId={episode.id}
          onClose={handleCloseLinkFilmForm}
          onFilmAdded={handleFilmAdded}
        />
      )}

      {showCreateFilmForm && (
        <AddFilmForm
          episodeId={episode.id}
          podcastName={episode.title}
          onFilmCreated={(filmId) => {
            linkEpisodeToFilm(episode.id, filmId).then(() => {
              console.log("Film created");
              handleFilmAdded();
              handleCloseCreateFilmForm();
            });
          }}
          onFilmLinked={(filmId) => {
            linkEpisodeToFilm(episode.id, filmId).then(() => {
              console.log("Film linked");
              handleFilmAdded();
              handleCloseCreateFilmForm();
            });
          }}
          onCancel={handleCloseCreateFilmForm}
        />
      )}
    </div>
  );
}
