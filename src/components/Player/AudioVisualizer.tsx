"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./AudioVisualizer.module.css";

interface AudioVisualizerProps {
  isPlaying: boolean;
  progress: number;
  totalDuration: number;
  onProgressClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

interface WaveformBar {
  height: number;
  intensity: number;
  isActive: boolean;
}

export const AudioVisualizer = ({
  isPlaying,
  progress,
  totalDuration,
  onProgressClick,
}: AudioVisualizerProps) => {
  const [bars, setBars] = useState<WaveformBar[]>([]);
  const animationRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastProgressRef = useRef<number>(0);

  const generateWaveform = useCallback(() => {
    const barCount = Math.max(
      100,
      Math.min(250, Math.floor(totalDuration / 2.5))
    );

    const newBars: WaveformBar[] = Array.from(
      { length: barCount },
      (_, index) => {
        const position = index / barCount;

        let height = 25;

        height += Math.sin(position * Math.PI * 8) * 20;

        height += Math.sin(position * Math.PI * 16) * 10;
        height += Math.sin(position * Math.PI * 32) * 5;

        const seed = Math.sin(index * 0.3) * Math.sin(index * 0.7);
        height += seed * 15;

        const speechProbability = 0.1 + 0.15 * Math.sin(position * Math.PI);
        if (Math.random() < speechProbability) {
          height += Math.random() * 25;
        }

        if (Math.random() > 0.95) {
          height *= 0.2;
        }

        const intensity = Math.random() * 0.3 + 0.7;

        return {
          height: Math.max(8, Math.min(80, height)),
          intensity,
          isActive: false,
        };
      }
    );

    setBars(newBars);
  }, [totalDuration]);

  const animateBars = useCallback(() => {
    if (!isPlaying) return;

    setBars((prevBars) =>
      prevBars.map((bar, index) => {
        const barPosition = index / prevBars.length;
        const currentProgress = progress / 100;

        const isActive = barPosition <= currentProgress;
        const isNearPlayhead = Math.abs(barPosition - currentProgress) < 0.02;

        let animatedHeight = bar.height;
        if (isActive && isNearPlayhead) {
          animatedHeight *= 1 + Math.sin(Date.now() * 0.01) * 0.1;
        }

        return {
          ...bar,
          height: animatedHeight,
          isActive,
        };
      })
    );

    animationRef.current = requestAnimationFrame(animateBars);
  }, [isPlaying, progress]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animateBars);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animateBars]);

  useEffect(() => {
    generateWaveform();
  }, [generateWaveform]);

  const progressGradient = useMemo(() => {
    const activeColor = "rgba(139, 69, 19, 0.6)";
    const inactiveColor = "rgba(255, 255, 255, 0.15)";

    return `linear-gradient(to right, 
      ${activeColor} 0%, 
      ${activeColor} ${progress}%, 
      ${inactiveColor} ${progress}%, 
      ${inactiveColor} 100%)`;
  }, [progress]);

  const handleProgressClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const newProgress = (clickX / rect.width) * 100;

        const syntheticEvent = {
          ...event,
          currentTarget: event.currentTarget,
          target: event.target,
          clientX: rect.left + (newProgress / 100) * rect.width,
        };

        onProgressClick(syntheticEvent as React.MouseEvent<HTMLDivElement>);
      }
    },
    [onProgressClick]
  );

  return (
    <div
      ref={containerRef}
      className={styles.visualizerContainer}
      onClick={handleProgressClick}
      style={{
        background: progressGradient,
        cursor: "pointer",
        transition: "background 0.1s ease-out",
        willChange: isPlaying ? "background" : "auto",
        contain: "layout style paint",
      }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-label={`Progression audio: ${Math.round(progress)}%`}
    >
      {bars.map((bar, index) => (
        <div
          key={index}
          className={`${styles.bar} ${bar.isActive ? styles.activeBar : ""}`}
          style={{
            height: `${bar.height}%`,
            opacity: bar.intensity,
            transform: bar.isActive ? "scaleY(1.05) translateZ(0)" : "scaleY(1) translateZ(0)",
            transition: isPlaying ? "transform 0.1s ease-out" : "none",
            willChange: isPlaying ? "transform, height, opacity" : "auto",
            contain: "layout style paint",
          }}
        />
      ))}

      <div
        className={styles.playhead}
        style={{
          left: `${progress}%`,
          opacity: isPlaying ? 1 : 0.7,
          willChange: isPlaying ? "left" : "auto",
          contain: "layout style paint",
        }}
      />
    </div>
  );
};
