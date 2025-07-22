"use client";
import { getAverageRGB } from "@/helpers/helpers";
import { usePlayerStore } from "@/lib/store/player";
import { useQueueStore } from "@/lib/store/queue";
import { useOptionsStore } from "@/lib/store/options";
import { getUploadServerUrl } from "@/helpers/imageConfig";
import {
  CircleX,
  Eye,
  PauseIcon,
  PlayIcon,
  SkipBack,
  SkipForward,
  List,
  Minimize2,
  Maximize2,
  RotateCcw,
  RotateCw,
  Gauge,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";
import { PlayerBar } from "@/components/Player/PlayerBar";
import { PlayerQueue } from "./PlayerQueue";
import styles from "./PlayerBar.module.css";

const useBackgroundColor = (episodeImg?: string) => {
  const [backgroundColor, setBackgroundColor] = useState<number[]>([
    139, 69, 19,
  ]);

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        let imageUrl: string;

        if (episodeImg) {
          imageUrl = episodeImg.startsWith("http")
            ? episodeImg
            : getUploadServerUrl(episodeImg);
        } else {
          imageUrl = "/images/navet.png";
        }

        const res = await getAverageRGB(imageUrl);
        setBackgroundColor(res);
      } catch (error) {
        setBackgroundColor([139, 69, 19]);
      }
    };

    fetchImageUrl();
  }, [episodeImg]);

  return backgroundColor;
};

// Hook pour les métadonnées MediaSession
const useMediaSession = (episode: any) => {
  useEffect(() => {
    if ("mediaSession" in navigator && episode) {
      const imageUrl = episode.img.startsWith("http")
        ? episode.img
        : episode.img
        ? getUploadServerUrl(episode.img)
        : "/images/navet.png";

      navigator.mediaSession.metadata = new MediaMetadata({
        title: episode.title,
        artist: episode.artist,
        artwork: [
          {
            src: imageUrl,
            sizes: "1280x720",
            type: "image/png",
          },
        ],
      });
    }
  }, [episode]);
};

export const Player = () => {
  const {
    episode,
    isPlaying,
    setIsPlaying,
    setClearPlayerStore,
    setEpisode,
    isMinimized,
    setIsMinimized,
    currentPlayTime,
    setCurrentPlayTime,
  } = usePlayerStore(
    useShallow((state) => {
      return {
        episode: state.episode,
        isPlaying: state.isPlaying,
        setIsPlaying: state.setIsPlaying,
        setClearPlayerStore: state.setClearPlayerStore,
        setEpisode: state.setEpisode,
        isMinimized: state.isMinimized,
        setIsMinimized: state.setIsMinimized,
        currentPlayTime: state.currentPlayTime,
        setCurrentPlayTime: state.setCurrentPlayTime,
      };
    })
  );

  const {
    queue,
    currentIndex,
    getNextEpisode,
    getPreviousEpisode,
    setCurrentIndex,
    getFirstEpisode,
    removeFirstEpisode,
  } = useQueueStore(
    useShallow((state) => {
      return {
        queue: state.queue,
        currentIndex: state.currentIndex,
        getNextEpisode: state.getNextEpisode,
        getPreviousEpisode: state.getPreviousEpisode,
        setCurrentIndex: state.setCurrentIndex,
        getFirstEpisode: state.getFirstEpisode,
        removeFirstEpisode: state.removeFirstEpisode,
      };
    })
  );

  const audioRef = useRef<HTMLAudioElement>(null);
  useMediaSession(episode);
  const [showQueue, setShowQueue] = useState(false);
  const [showSpeedControls, setShowSpeedControls] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const backgroundColor = useBackgroundColor(episode?.img);
  const { options } = useOptionsStore(
    useShallow((state) => ({ options: state.options }))
  );

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    const isRefresh = !sessionStorage.getItem("playerInitialized");
    if (isRefresh) {
      sessionStorage.setItem("playerInitialized", "true");
      setIsPlaying(false);
      audioElement.pause();
    }

    return () => {
      sessionStorage.removeItem("playerInitialized");
    };
  }, []);

  useEffect(() => {
    const audioElement = audioRef.current;

    if (!audioElement) return;
    if (!isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [isPlaying, setIsPlaying, episode]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !episode) return;
    const handleCanPlay = () => {
      if (currentPlayTime > 0) {
        audioElement.currentTime = currentPlayTime;
      } else {
        audioElement.currentTime = 0;
      }
      audioElement.removeEventListener("canplay", handleCanPlay);
    };
    if (audioElement.readyState >= 2) {
      if (currentPlayTime > 0) {
        audioElement.currentTime = currentPlayTime;
      } else {
        audioElement.currentTime = 0;
      }
    } else {
      audioElement.addEventListener("canplay", handleCanPlay);
    }

    return () => {
      audioElement.removeEventListener("canplay", handleCanPlay);
    };
  }, [episode]);

  // Fermer les contrôles de vitesse quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(`.${styles.speed_button}`) && !target.closest(`.${styles.speed_controls}`)) {
        setShowSpeedControls(false);
      }
    };

    if (showSpeedControls) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSpeedControls]);

  const togglePlay = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch(() => {
        setIsPlaying(false);
      });
    }

    setIsPlaying(!isPlaying);
  };

  const handleLeftCurrentPlaying = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    audioElement.currentTime = 0;
    audioElement.pause();
    setClearPlayerStore();
  };

  const handleNext = () => {
    const nextEpisode = getNextEpisode();
    if (nextEpisode) {
      setEpisode(nextEpisode);
      setCurrentIndex(currentIndex + 1);
      setCurrentPlayTime(0);

      const audioElement = audioRef.current;
      if (audioElement && audioElement.readyState >= 2) {
        audioElement.currentTime = 0;
      }

      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    const previousEpisode = getPreviousEpisode();
    if (previousEpisode) {
      setEpisode(previousEpisode);
      setCurrentIndex(currentIndex - 1);
      setCurrentPlayTime(0);
      const audioElement = audioRef.current;
      if (audioElement && audioElement.readyState >= 2) {
        audioElement.currentTime = 0;
      }

      setIsPlaying(true);
    }
  };

  const toggleQueue = () => {
    if (isMinimized && !showQueue) {
      setIsMinimized(false);
    }
    setShowQueue(!showQueue);
  };

  const toggleMinimize = () => {
    if (!isMinimized && showQueue) {
      setShowQueue(false);
    }
    setIsMinimized(!isMinimized);
  };

  const toggleSpeedControls = () => {
    setShowSpeedControls(!showSpeedControls);
    // Fermer la queue si elle est ouverte
    if (showQueue) {
      setShowQueue(false);
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    audioElement.playbackRate = speed;
    setCurrentSpeed(speed);
    // Optionnel : sauvegarder la vitesse dans les options
  };

  const handleSkipBackward = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    const newTime = Math.max(0, audioElement.currentTime - 10);
    audioElement.currentTime = newTime;
    setCurrentPlayTime(newTime);
  };

  const handleSkipForward = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    const newTime = Math.min(audioElement.duration || 0, audioElement.currentTime + 10);
    audioElement.currentTime = newTime;
    setCurrentPlayTime(newTime);
  };

  if (!episode?.url) {
    return null;
  }

  return (
    <>
      <audio
        onPlaying={() => {
          setIsPlaying(true);
          const audioElement = audioRef.current;
          if (!audioElement) return;

          const skipTimeMs = options.skipIntro
            ? options.introSkipTime * 1000
            : 0;
          if (skipTimeMs > 0 && audioElement.currentTime < skipTimeMs / 1000) {
            if (
              audioElement.duration &&
              !isNaN(audioElement.duration) &&
              audioElement.duration > 3600
            ) {
              audioElement.currentTime = skipTimeMs / 1000;
            }
          }
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          const firstEpisode = getFirstEpisode();
          if (firstEpisode) {
            setEpisode(firstEpisode);
            removeFirstEpisode();
            setIsPlaying(true);
          }
        }}
        ref={audioRef}
        src={episode?.url}
        preload="metadata"
        id="audio"
      />
      <div
        className={`${styles.container} ${
          isMinimized ? styles.minimized : ""
        } ${isMinimized && showQueue ? styles.showQueue : ""}`}
        style={{
          backgroundColor: `rgba(${backgroundColor[0]}, ${backgroundColor[1]}, ${backgroundColor[2]}, 0.9)`,
        }}
      >
        <div className={styles.player_title}>{episode.title}</div>
        <div id="playerBar" className={styles.player_bar_container}>
          {/* Desktop: contrôles inline */}
          <div className={styles.controls_inline + " " + styles.desktopOnly}>
            <button
              className={styles.nav_button}
              onClick={handlePrevious}
              disabled={!getPreviousEpisode()}
              title="Précédent"
            >
              <SkipBack />
            </button>
            <button
              className={styles.skip_button}
              onClick={handleSkipBackward}
              title="-10 secondes"
            >
              <RotateCcw />
              <span>-10s</span>
            </button>
            <button className={styles.player_button} onClick={togglePlay}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              className={styles.skip_button}
              onClick={handleSkipForward}
              title="+10 secondes"
            >
              <RotateCw />
              <span>+10s</span>
            </button>
            <button
              className={styles.nav_button}
              onClick={handleNext}
              disabled={!getNextEpisode()}
              title="Suivant"
            >
              <SkipForward />
            </button>
          </div>
          <PlayerBar audioRef={audioRef} isPlaying={isPlaying} />
          <button
            className={styles.button}
            onClick={toggleMinimize}
            title={isMinimized ? "Agrandir le lecteur" : "Réduire le lecteur"}
          >
            {isMinimized ? <Maximize2 /> : <Minimize2 />}
          </button>
          {/* Desktop only: options inline */}
          <div className={styles.button_container + " " + styles.desktopOnly}>
            <button
              className={styles.button}
              onClick={toggleQueue}
              title={`${
                showQueue ? "Masquer" : "Afficher"
              } la file d'attente (${queue.length})`}
            >
              <List />
            </button>
            <div style={{ position: "relative" }}>
              <button
                className={`${styles.speed_button} ${showSpeedControls ? styles.active : ""}`}
                onClick={toggleSpeedControls}
                title={`Vitesse de lecture (${currentSpeed}x)`}
              >
                <Gauge />
              </button>
              {showSpeedControls && (
                <div className={styles.speed_controls}>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      className={`${styles.speed_option} ${currentSpeed === speed ? styles.active : ""}`}
                      onClick={() => changePlaybackSpeed(speed)}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link
              href={`/episodes/${episode.slug}`}
              title="afficher la page"
              className={`${styles.button} ${styles.externalButton}`}
            >
              <Eye />
            </Link>
            <button
              className={styles.button}
              title="quitter la lecture"
              onClick={handleLeftCurrentPlaying}
            >
              <CircleX />
            </button>
          </div>
        </div>
        {/* Mobile : tous les boutons sur la même ligne */}
        <div className={styles.mobileControlsRow + " " + styles.mobileOnly}>
          <button
            className={styles.nav_button}
            onClick={handlePrevious}
            disabled={!getPreviousEpisode()}
            title="Précédent"
          >
            <SkipBack />
          </button>
          <button
            className={styles.skip_button}
            onClick={handleSkipBackward}
            title="-10 secondes"
          >
            <RotateCcw />
            <span>-10s</span>
          </button>
          <button className={styles.player_button} onClick={togglePlay}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            className={styles.skip_button}
            onClick={handleSkipForward}
            title="+10 secondes"
          >
            <RotateCw />
            <span>+10s</span>
          </button>
          <button
            className={styles.nav_button}
            onClick={handleNext}
            disabled={!getNextEpisode()}
            title="Suivant"
          >
            <SkipForward />
          </button>
          <button
            className={styles.button}
            onClick={toggleQueue}
            title={`${showQueue ? "Masquer" : "Afficher"} la file d'attente (${
              queue.length
            })`}
          >
            <List />
          </button>
          <div style={{ position: "relative" }}>
            <button
              className={`${styles.speed_button} ${showSpeedControls ? styles.active : ""}`}
              onClick={toggleSpeedControls}
              title={`Vitesse de lecture (${currentSpeed}x)`}
            >
              <Gauge />
            </button>
            {showSpeedControls && (
              <div className={styles.speed_controls}>
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    className={`${styles.speed_option} ${currentSpeed === speed ? styles.active : ""}`}
                    onClick={() => changePlaybackSpeed(speed)}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link
            href={`/episodes/${episode.slug}`}
            className={`${styles.button} ${styles.externalButton}`}
            title="afficher la page"
          >
            <Eye />
          </Link>
          <button
            className={styles.button}
            title="quitter la lecture"
            onClick={handleLeftCurrentPlaying}
          >
            <CircleX />
          </button>
        </div>
        {/* Queue intégrée */}
        <PlayerQueue showQueue={showQueue} />
      </div>
    </>
  );
};
