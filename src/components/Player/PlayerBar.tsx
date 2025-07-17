"use client";
import { useEffect, RefObject } from "react";
import { useShallow } from "zustand/react/shallow";
import styles from "./PlayerBar.module.css";
import { AudioVisualizer } from "./AudioVisualizer";
import { usePlayerStore } from "@/lib/store/player";

interface PlayerBarProps {
  audioRef: RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
}

export const PlayerBar = ({ audioRef, isPlaying }: PlayerBarProps) => {
  const { 
    setCurrentPlayTime, 
    setTotalDuration: setStoreTotalDuration, 
    currentPlayTime, 
    totalDuration 
  } = usePlayerStore(
    useShallow((state) => ({
      setCurrentPlayTime: state.setCurrentPlayTime,
      setTotalDuration: state.setTotalDuration,
      currentPlayTime: state.currentPlayTime,
      totalDuration: state.totalDuration,
    }))
  );

  // Fonction utilitaire pour formater les nombres
  const padZero = (num: number) => {
    return num.toString().padStart(2, "0");
  };

  // Calculer le pourcentage de progression
  const progress = totalDuration > 0 ? (currentPlayTime / totalDuration) * 100 : 0;

  // Formater les durées
  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  };

  const formattedDuration = formatTime(currentPlayTime);
  const formattedDurationTotal = formatTime(totalDuration);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    let lastUpdate = 0;
    const updateProgress = () => {
      const currentTime = audioElement.currentTime;
      const now = Date.now();
      
      // Mettre à jour le store seulement toutes les 500ms
      if (now - lastUpdate >= 500) {
        setCurrentPlayTime(currentTime);
        lastUpdate = now;
      }
    };

    audioElement.addEventListener("timeupdate", updateProgress);

    return () => {
      audioElement.removeEventListener("timeupdate", updateProgress);
    };
  }, [audioRef, setCurrentPlayTime]);



  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const updateDuration = () => {
      const duration = audioElement.duration;
      if (duration > 0) {
        setStoreTotalDuration(duration);
      }
    };

    if (audioElement.readyState >= 2) {
      updateDuration();
    } else {
      audioElement.addEventListener("loadedmetadata", updateDuration);
    }

    return () => {
      audioElement.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [audioRef, setStoreTotalDuration]);

  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const target = event.currentTarget;
    const clickX = event.pageX - target.getBoundingClientRect().left;
    const progressBarWidth = target.offsetWidth;
    const clickPercentage = (clickX / progressBarWidth) * 100;
    const newTime = (clickPercentage * audioElement.duration) / 100;

    if (!isNaN(newTime) && newTime >= 0) {
      audioElement.currentTime = newTime;
      setCurrentPlayTime(newTime);
    }
  };

  return (
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
  );
};
