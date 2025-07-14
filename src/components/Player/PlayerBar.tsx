"use client";
import { useEffect, useState, RefObject } from "react";
import styles from "./PlayerBar.module.css";
import { AudioVisualizer } from "./AudioVisualizer";

interface PlayerBarProps {
  audioRef: RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
}

export const PlayerBar = ({ audioRef, isPlaying }: PlayerBarProps) => {
  const [progress, setProgress] = useState(0);
  const [formattedDuration, setFormattedDuration] = useState("00:00:00");
  const [formattedDurationTotal, setFormattedDurationTotal] =
    useState("00:00:00");
  const [totalDuration, setTotalDuration] = useState(0);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const updateProgress = () => {
      const currentTime = audioElement.currentTime;
      const duration = audioElement.duration;

      if (duration > 0) {
        const progressPercentage = (currentTime / duration) * 100;
        setProgress(progressPercentage);
      }
    };

    audioElement.addEventListener("timeupdate", updateProgress);

    return () => {
      audioElement.removeEventListener("timeupdate", updateProgress);
    };
  }, [audioRef]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const updateDuration = () => {
      const duration = audioElement.duration;
      if (duration > 0) {
        setTotalDuration(duration);
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = Math.floor(duration % 60);
        setFormattedDurationTotal(
          `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`
        );
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
  }, [audioRef]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const updateCurrentTime = () => {
      const currentTime = audioElement.currentTime;
      const hours = Math.floor(currentTime / 3600);
      const minutes = Math.floor((currentTime % 3600) / 60);
      const seconds = Math.floor(currentTime % 60);
      setFormattedDuration(
        `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`
      );
    };

    audioElement.addEventListener("timeupdate", updateCurrentTime);

    return () => {
      audioElement.removeEventListener("timeupdate", updateCurrentTime);
    };
  }, [audioRef]);

  const padZero = (num: number) => {
    return num.toString().padStart(2, "0");
  };

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
