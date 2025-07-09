'use client';

import { useState } from 'react';
import Link from 'next/link';
import Modal from '@/components/Modal/Modal';
import { deleteEpisode } from '@/app/actions/admin';
import styles from './PodcastAdmin.module.css';

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  pubDate: Date;
  audioUrl: string;
  links: {
    id: string;
    film: {
      id: string;
      title: string;
      year: number | null;
    };
  }[];
}

interface PodcastListClientProps {
  episodes: PodcastEpisode[];
  nameId: string;
  showLinked: boolean;
  linkedCount: number;
  unlinkedCount: number;
}

export default function PodcastListClient({
  episodes,
  nameId,
  showLinked,
  linkedCount,
  unlinkedCount
}: PodcastListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState<PodcastEpisode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (episode: PodcastEpisode) => {
    setEpisodeToDelete(episode);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!episodeToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteEpisode(episodeToDelete.id);
      if (result.success) {
        // Recharger la page pour mettre à jour la liste
        window.location.reload();
      } else {
        alert('Erreur lors de la suppression : ' + result.error);
      }
    } catch (error) {
      alert('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div>
                <h1 className={styles.title}>
                  Administration - {nameId}
                </h1>
                <p className={styles.subtitle}>
                  {episodes.length} épisode{episodes.length > 1 ? "s" : ""} affiché{episodes.length > 1 ? "s" : ""} 
                  {!showLinked && linkedCount > 0 && (
                    <span className={styles.filterInfo}>
                      ({linkedCount} épisode{linkedCount > 1 ? "s" : ""} lié{linkedCount > 1 ? "s" : ""} masqué{linkedCount > 1 ? "s" : ""})
                    </span>
                  )}
                </p>
              </div>
              <div className={styles.actions}>
                <Link
                  href={`/api/import/${nameId}`}
                  className={styles.importButton}
                >
                  Importer les épisodes
                </Link>
                <Link
                  href="/admin"
                  className={styles.backButton}
                >
                  ← Retour à l&apos;admin
                </Link>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className={styles.filters}>
            <div className={styles.filterToggle}>
              <span className={styles.filterLabel}>Afficher les épisodes liés :</span>
              <div className={styles.toggleButtons}>
                <Link
                  href={`/admin/list/podcast/${nameId}?showLinked=false`}
                  className={`${styles.toggleButton} ${!showLinked ? styles.active : ''}`}
                >
                  Non ({unlinkedCount})
                </Link>
                <Link
                  href={`/admin/list/podcast/${nameId}?showLinked=true`}
                  className={`${styles.toggleButton} ${showLinked ? styles.active : ''}`}
                >
                  Oui ({episodes.length + (showLinked ? 0 : linkedCount)})
                </Link>
              </div>
            </div>
          </div>

          {/* Episodes Table */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Épisode</th>
                  <th>Date</th>
                  <th>Films liés</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {episodes.map((episode) => (
                  <tr key={episode.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div>
                        <p className={styles.episodeTitle}>
                          {episode.title}
                        </p>
                        <p className={styles.episodeDescription}>
                          {episode.description.length > 100 
                            ? `${episode.description.substring(0, 100)}...` 
                            : episode.description
                          }
                        </p>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.episodeDate}>
                        {new Date(episode.pubDate).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.filmTags}>
                        {episode.links.length > 0 ? (
                          episode.links.map((link) => (
                            <span
                              key={link.id}
                              className={styles.filmTag}
                            >
                              {link.film.title} {link.film.year && `(${link.film.year})`}
                            </span>
                          ))
                        ) : (
                          <span className={styles.noFilms}>Aucun film lié</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.actionButtons}>
                        <a
                          href={episode.audioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${styles.actionLink} ${styles.listenLink}`}
                        >
                          Écouter
                        </a>
                        <Link
                          href={`/admin/episode/${episode.id}/edit`}
                          className={`${styles.actionLink} ${styles.editLink}`}
                        >
                          Éditer
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(episode)}
                          className={`${styles.actionLink} ${styles.deleteButton}`}
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Suppression...' : 'Supprimer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {episodes.length === 0 && (
            <div className={styles.emptyState}>
              <svg className={styles.emptyIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <h3 className={styles.emptyTitle}>
                {showLinked ? 'Aucun épisode' : 'Aucun épisode non lié'}
              </h3>
              <p className={styles.emptyDescription}>
                {showLinked 
                  ? "Aucun épisode n'a été importé pour le moment."
                  : "Tous les épisodes sont déjà liés à des films."
                }
              </p>
              <Link
                href={`/api/import/${nameId}`}
                className={styles.importButton}
              >
                Importer les premiers épisodes
              </Link>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer l'épisode "${episodeToDelete?.title}" ? Cette action est irréversible et supprimera également tous les liens avec les films.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </>
  );
} 