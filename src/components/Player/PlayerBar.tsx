"use client";
import { getAverageRGB } from "@/lib/helpers";
import { usePlayerStore } from "@/lib/store/player";
import { useQueueStore } from "@/lib/store/queue";
import { getVercelBlobUrl } from "@/lib/imageConfig";
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
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./PlayerBar.module.css";
import { useShallow } from "zustand/shallow";
import { AudioVisualizer } from "./AudioVisualizer";
import { PlayerQueue } from "./PlayerQueue";
import { useOptionsStore } from "@/lib/store/options";

export const PlayerBar = () => {
  const [
    podcast,
    isPlaying,
    setIsPlaying,
    setCurrentPlayTime,
    setClearPlayerStore,
    currentPlayTime,
    setTotalDuration,
    totalDuration,
    setPodcast,
    isMinimized,
    setIsMinimized,
  ] = usePlayerStore(
    useShallow((state) => [
      state.podcast,
      state.isPlaying,
      state.setIsPlaying,
      state.setCurrentPlayTime,
      state.setClearPlayerStore,
      state.currentPlayTime,
      state.setTotalDuration,
      state.totalDuration,
      state.setPodcast,
      state.isMinimized,
      state.setIsMinimized,
    ])
  );

  const {
    queue,
    currentIndex,
    getNextPodcast,
    getPreviousPodcast,
    setCurrentIndex,
  } = useQueueStore(
    useShallow((state) => ({
      queue: state.queue,
      currentIndex: state.currentIndex,
      getNextPodcast: state.getNextPodcast,
      getPreviousPodcast: state.getPreviousPodcast,
      setCurrentIndex: state.setCurrentIndex,
    }))
  );

  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [formattedDuration, setFormattedDuration] = useState("00:00:00");
  const [durationTotal, setDurationTotal] = useState(0);
  const [formattedDurationTotal, setFormattedDurationTotal] =
    useState("00:00:00");
  const [backgroundColor, setBackgroundColor] = useState<number[]>([0, 0, 0]);
  const [showQueue, setShowQueue] = useState(false);
  const [ options] = useOptionsStore(
    useShallow((state) => [
      state.options,
    ])
  );

  const setData = () => {
    if (podcast?.url === audioRef.current?.src && audioRef.current) {
      const audioDuration = audioRef.current.duration;
      if (audioDuration && audioDuration > 0) {
        setDurationTotal(audioDuration);
        setTotalDuration(audioDuration);
        setDuration(currentPlayTime);
        const progressPercentage = (currentPlayTime / audioDuration) * 100;
        setProgress(progressPercentage);
      }
    }
  };

  useEffect(() => {
    if (podcast?.img) {
      const imageUrl = podcast.img.startsWith("http")
        ? podcast.img
        : podcast.img
        ? getVercelBlobUrl(podcast.img)
        : "/images/navet.png";

      getAverageRGB(imageUrl)
        .then((res: number[]) => {
          setBackgroundColor(res);
        })
        .catch(() => {
          setBackgroundColor([139, 69, 19]);
        });
    } else {
      setBackgroundColor([139, 69, 19]);
    }
  }, [podcast?.img]);

  useEffect(() => {
    if ("mediaSession" in navigator && podcast) {
      // Construire l'URL complète si c'est juste un imgFileName
      const imageUrl = podcast.img.startsWith("http")
        ? podcast.img
        : podcast.img
        ? getVercelBlobUrl(podcast.img)
        : "/images/navet.png";

      navigator.mediaSession.metadata = new MediaMetadata({
        title: podcast.title,
        artist: podcast.artist,
        artwork: [
          {
            src: imageUrl,
            sizes: "1280x720",
            type: "image/png",
          },
        ],
      });
    }
  }, [podcast]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const setAudioData = () => {
      const audioDuration = audioElement.duration;
      if (audioDuration && audioDuration > 0) {
        setDurationTotal(audioDuration);
        setTotalDuration(audioDuration);

        if (currentPlayTime > 0 && totalDuration > 0) {
          const progressPercentage = (currentPlayTime / audioDuration) * 100;
          setProgress(progressPercentage);
          setDuration(currentPlayTime);
        }
      }
    };

    const updateProgress = () => {
      if (podcast?.url === audioElement.src) {
        const currentTime = audioElement.currentTime;
        const duration = audioElement.duration;
        if (duration > 0) {
          const progressPercentage = (currentTime / duration) * 100;
          setDuration(currentTime);
          setProgress(progressPercentage);
          setCurrentPlayTime(currentTime);
        }
      }
    };

    if (audioElement.readyState >= 2) {
      setAudioData();
    } else {
      audioElement.addEventListener("loadedmetadata", setAudioData);
    }

    audioElement.addEventListener("timeupdate", updateProgress);

    return () => {
      audioElement.removeEventListener("loadedmetadata", setAudioData);
      audioElement.removeEventListener("timeupdate", updateProgress);
    };
  }, [
    podcast?.url,
    setCurrentPlayTime,
    setTotalDuration,
    currentPlayTime,
    totalDuration,
  ]);

  useEffect(() => {
    if (durationTotal > 0) {
      const hours = Math.floor(durationTotal / 3600);
      const minutes = Math.floor((durationTotal % 3600) / 60);
      const seconds = Math.floor(durationTotal % 60);
      setFormattedDurationTotal(
        `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`
      );
    }
  }, [durationTotal]);

  useEffect(() => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);
    setFormattedDuration(
      `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`
    );
  }, [duration]);

  useEffect(() => {
    const audioElement = audioRef.current;

    if (!audioElement) return;
    if (!isPlaying) {
      audioElement.pause();
    } else {
      if (podcast?.url === audioElement.src) {
        audioElement.currentTime = currentPlayTime;
      }

      audioElement.play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !isPlaying) return;

    const skipTimeMs = options.skipIntro ? options.introSkipTime * 1000 : 0;
    if (skipTimeMs > 0 && audioElement.currentTime < skipTimeMs / 1000) {
      // si le podcast fait moins de 1h, on ne skip pas l'intro
      if (audioElement.duration && !isNaN(audioElement.duration) && audioElement.duration > 3600) {
        audioElement.currentTime = skipTimeMs / 1000;
      }
    }
  }, [isPlaying, options, podcast?.url, duration]);

  const padZero = (num: number) => {
    return num.toString().padStart(2, "0");
  };

  const togglePlay = () => {
    const audioElement = audioRef.current;

    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }

    setIsPlaying(!isPlaying);
  };

  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const clickX = event.pageX - target.getBoundingClientRect().left;
    const progressBarWidth = target.offsetWidth;
    const clickPercentage = (clickX / progressBarWidth) * 100;
    const newTime = (clickPercentage * durationTotal) / 100;
    if (!isNaN(newTime) && newTime >= 0 && audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleLeftCurrentPlaying = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    audioElement.currentTime = 0;
    audioElement.pause();
    setClearPlayerStore();
  };

  const handleNext = () => {
    const nextPodcast = getNextPodcast();
    if (nextPodcast) {
      setPodcast(nextPodcast);
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    const previousPodcast = getPreviousPodcast();
    if (previousPodcast) {
      setPodcast(previousPodcast);
      setCurrentIndex(currentIndex - 1);
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

  if (!podcast?.url) {
    return null;
  }

  return (
    <div
      className={`${styles.container} ${isMinimized ? styles.minimized : ""} ${
        isMinimized && showQueue ? styles.showQueue : ""
      }`}
      style={{
        backgroundColor: `rgba(${backgroundColor[0]}, ${backgroundColor[1]}, ${backgroundColor[2]}, 0.9)`,
      }}
    >
      <div className={styles.player_title}>{podcast.title}</div>
      <div id="playerBar" className={styles.player_bar_container}>
        <audio
          onPlaying={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedData={() => setData()}
          ref={audioRef}
          src={podcast?.url}
          autoPlay={true}
          preload="metadata"
          id="audio"
        />
        {/* Desktop: contrôles inline */}
        <div className={styles.controls_inline + " " + styles.desktopOnly}>
          <button
            className={styles.nav_button}
            onClick={handlePrevious}
            disabled={!getPreviousPodcast()}
            title="Précédent"
          >
            <SkipBack />
          </button>
          <button className={styles.player_button} onClick={togglePlay}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            className={styles.nav_button}
            onClick={handleNext}
            disabled={!getNextPodcast()}
            title="Suivant"
          >
            <SkipForward />
          </button>
        </div>
        <div className={styles.visualizer_section}>
          <AudioVisualizer
            isPlaying={isPlaying}
            progress={progress}
            totalDuration={totalDuration}
            onProgressClick={handleProgressBarClick}
          />
          <div className={styles.timer_container}>
            <span className={styles.player_bar_timer}>
              {formattedDuration} / {formattedDurationTotal}
            </span>
          </div>
        </div>
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
            title={`${showQueue ? "Masquer" : "Afficher"} la file d'attente (${
              queue.length
            })`}
          >
            <List />
          </button>
          <Link
            href={`/podcasts/${podcast.slug}`}
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
      </div>
      {/* Mobile : tous les boutons sur la même ligne */}
      <div className={styles.mobileControlsRow + " " + styles.mobileOnly}>
        <button
          className={styles.nav_button}
          onClick={handlePrevious}
          disabled={!getPreviousPodcast()}
          title="Précédent"
        >
          <SkipBack />
        </button>
        <button className={styles.player_button} onClick={togglePlay}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          className={styles.nav_button}
          onClick={handleNext}
          disabled={!getNextPodcast()}
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
        <Link
          href={`/podcasts/${podcast.slug}`}
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
  );
};
