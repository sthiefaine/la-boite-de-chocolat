"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/lib/store/player";
import { Play, Pause, Download, MessageCircleHeart } from "lucide-react";
import styles from "./PodcastDetail.module.css";
import { useShallow } from "zustand/shallow";

interface Episode {
  title: string;
  movieTitle?: string;
  audio: string;
  poster?: string;
  speakers?: string[];
  releaseDate?: string;
  directorsName?: string[];
  saison?: number;
  episode?: number;
  descriptionHtml?: string;
  description?: string;
  idTmdb?: string;
  isMovie?: boolean;
  createdAt: Date;
  guid?: string;
  slug?: string;
}

interface ReviewInfo {
  userName?: string;
  review?: string;
  idAlloCine?: string;
}

interface NavigationEpisode {
  title: string;
  movieTitle?: string;
  audio: string;
  poster?: string;
  speakers?: string[];
  releaseDate?: string;
  directorsName?: string[];
  saison?: number;
  episode?: number;
  descriptionHtml?: string;
  description?: string;
  idTmdb?: string;
  isMovie?: boolean;
  createdAt: Date;
  guid?: string;
  slug?: string;
}

interface PodcastDetailProps {
  episode: Episode;
  reviewInfo: ReviewInfo[];
  previousEpisode?: NavigationEpisode;
  nextEpisode?: NavigationEpisode;
}

export const PodcastDetail = ({
  episode,
  reviewInfo,
  previousEpisode,
  nextEpisode,
}: PodcastDetailProps) => {
  const [podcast, setPodcast, isPlaying, setIsPlaying, setClearPlayerStore] =
    usePlayerStore(
      useShallow((state) => [
        state.podcast,
        state.setPodcast,
        state.isPlaying,
        state.setIsPlaying,
        state.setClearPlayerStore,
      ])
    );
  const [displayReview, setDisplayReview] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setDisplayReview(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleListen = () => {
    if (podcast?.url !== episode.audio) {
      setClearPlayerStore();
      setPodcast({
        title: episode.title ?? episode.movieTitle ?? "Podcast",
        url: episode.audio,
        img: episode.poster ?? "/images/boite-de-chocolat-404.png",
        artist: episode.speakers?.join(", ") ?? "La Boîte de Chocolat",
        slug: episode.slug ?? "",
      });
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  return (
    <>
      <div className={styles.container}>
        <Image
          className={styles.landingImage}
          src={
            episode?.poster && episode?.poster !== "null"
              ? episode?.poster
              : "/images/boite-de-chocolat-404.png"
          }
          style={{ objectFit: "cover" }}
          alt="Poster of the movie"
          quality={100}
          fill={true}
          priority={true}
        />
        <div className={styles.informations}>
          <h1 className={styles.title}>
            {episode.title ?? episode.movieTitle}
          </h1>
          {episode.releaseDate && (
            <span className={styles.releaseDate}>
              {"(" + new Date(episode.releaseDate).getFullYear() + ")"}
            </span>
          )}

          <div className={styles.subtitle}>
            {episode.directorsName && (
              <span className={styles.directors}>
                de {episode.directorsName?.join(", ")}
              </span>
            )}
          </div>
          <div className={styles.text}>
            {episode.saison && (
              <span className={styles.saison}>S{episode.saison}</span>
            )}
            {episode.episode && (
              <span className={styles.episode}>E{episode.episode}</span>
            )}
            <span className={styles.description}>
              {episode.descriptionHtml ?? episode.description}
            </span>
          </div>
          <div className={styles.actionBar}>
            {(!isPlaying || episode.audio !== podcast?.url) && (
              <button
                className={styles.buttonAction}
                onClick={() => handleListen()}
              >
                <Play /> Écouter
              </button>
            )}
            {isPlaying && episode.audio === podcast?.url && (
              <button
                className={styles.buttonAction}
                onClick={() => handlePause()}
              >
                <Pause /> Pause
              </button>
            )}

            <button className={styles.buttonAction}>
              <a
                href={episode.audio}
                download
                about="Télécharger le podcast"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download /> Télécharger
              </a>
            </button>

            {reviewInfo[0]?.userName === "fandecaoch" && (
              <button
                className={styles.buttonAction}
                onClick={() => setDisplayReview(true)}
              >
                <MessageCircleHeart /> Fandecoatch
              </button>
            )}

            {episode.idTmdb && episode.isMovie && (
              <button className={styles.buttonAction}>
                <a
                  href={`https://www.themoviedb.org/movie/${episode.idTmdb}`}
                  about="ouvrir le lien Tmdb"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/images/tmdb_icon.svg"
                    alt="tmdb"
                    width={100}
                    height={30}
                  />
                </a>
              </button>
            )}

            {reviewInfo[0]?.idAlloCine && (
              <button className={styles.buttonAction}>
                <a
                  href={`https://www.allocine.fr/film/fichefilm_gen_cfilm=${reviewInfo[0]?.idAlloCine}.html`}
                  about="ouvrir le lien Allociné"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/images/allocine_icon.svg"
                    alt="allocine"
                    width={100}
                    height={30}
                  />
                </a>
              </button>
            )}
          </div>

          <div>
            <span className={styles.publishDate}>
              Publié le{" "}
              {episode.createdAt.toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            {episode?.speakers && (
              <span className={styles.speakers}>
                Avec {episode?.speakers?.join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation entre épisodes */}
      {(previousEpisode || nextEpisode) && (
        <div className={styles.navigationSection}>
          <div className={styles.navigationContainer}>
            {nextEpisode && (
              <div className={styles.navigationCard}>
                <span className={styles.navigationLabel}>Suivant</span>
                <div className={styles.navigationItem}>
                  <h3>{nextEpisode.title ?? nextEpisode.movieTitle}</h3>
                  <p>{nextEpisode.description}</p>
                </div>
              </div>
            )}
            {previousEpisode && (
              <div className={styles.navigationCard}>
                <span className={styles.navigationLabel}>Précédent</span>
                <div className={styles.navigationItem}>
                  <h3>{previousEpisode.title ?? previousEpisode.movieTitle}</h3>
                  <p>{previousEpisode.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {displayReview && (
        <div className={styles.popup} ref={modalRef}>
          <div className={styles.popupContent}>
            <button
              className={styles.closeButton}
              onClick={() => setDisplayReview(false)}
            >
              X
            </button>
            <div className={styles.reviewContent}>{reviewInfo[0]?.review}</div>
          </div>
        </div>
      )}
    </>
  );
};
