"use client";
import { useCallback, useEffect, useMemo, useRef } from "react";
import styles from "./AudioVisualizer.module.css";
import type { SpeakerSegment } from "@/helpers/transcriptionHelpers";
import { getSpeakerColor } from "@/helpers/transcriptionHelpers";

interface AudioVisualizerProps {
  isPlaying: boolean;
  progress: number;
  totalDuration: number;
  onProgressClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  speakerSegments?: SpeakerSegment[] | null;
}

// Générateur pseudo-aléatoire déterministe (mulberry32)
function seededRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface BarData {
  height: number;
  intensity: number;
}

function generateStaticWaveform(totalDuration: number): BarData[] {
  const barCount = Math.max(
    100,
    Math.min(250, Math.floor(totalDuration / 2.5))
  );
  const random = seededRandom(42 + barCount);

  return Array.from({ length: barCount }, (_, index) => {
    const position = index / barCount;

    let height = 25;
    height += Math.sin(position * Math.PI * 8) * 20;
    height += Math.sin(position * Math.PI * 16) * 10;
    height += Math.sin(position * Math.PI * 32) * 5;

    const seed = Math.sin(index * 0.3) * Math.sin(index * 0.7);
    height += seed * 15;

    const speechProbability = 0.1 + 0.15 * Math.sin(position * Math.PI);
    if (random() < speechProbability) {
      height += random() * 25;
    }

    if (random() > 0.95) {
      height *= 0.2;
    }

    const intensity = random() * 0.3 + 0.7;

    return {
      height: Math.max(8, Math.min(80, height)),
      intensity,
    };
  });
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * For each bar, determine the speaker color based on the time position.
 * Returns an array of hex colors (or null for default).
 */
function computeBarColors(
  barCount: number,
  totalDuration: number,
  speakerSegments: SpeakerSegment[]
): (string | null)[] {
  if (totalDuration <= 0) return new Array(barCount).fill(null);

  return Array.from({ length: barCount }, (_, index) => {
    const timePosition = (index / barCount) * totalDuration;

    // Find the speaker active at this time position
    for (const segment of speakerSegments) {
      if (timePosition >= segment.start && timePosition < segment.end) {
        return getSpeakerColor(segment.speakerId);
      }
    }

    return null;
  });
}

export const AudioVisualizer = ({
  isPlaying,
  progress,
  totalDuration,
  onProgressClick,
  speakerSegments,
}: AudioVisualizerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);

  // Générer la waveform une seule fois
  const bars = useMemo(
    () => generateStaticWaveform(totalDuration),
    [totalDuration]
  );

  // Compute speaker colors for each bar
  const barColors = useMemo(() => {
    if (!speakerSegments || speakerSegments.length === 0) return null;
    return computeBarColors(bars.length, totalDuration, speakerSegments);
  }, [bars.length, totalDuration, speakerSegments]);

  // Mettre à jour le progress via DOM direct (pas de re-render)
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.style.clipPath = `inset(0 ${100 - progress}% 0 0)`;
    }
    if (playheadRef.current) {
      playheadRef.current.style.left = `${progress}%`;
    }
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
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-label={`Progression audio: ${Math.round(progress)}%`}
    >
      {/* Couche inactive (barres grises ou colorées à faible opacité) */}
      <div className={styles.barsLayer}>
        {bars.map((bar, index) => {
          const color = barColors?.[index];
          const isOdd = index % 2 === 1;

          return (
            <div
              key={index}
              className={color ? undefined : styles.bar}
              style={{
                height: `${bar.height}%`,
                opacity: bar.intensity * 0.5,
                ...(color
                  ? {
                      flex: 1,
                      background: hexToRgba(color, isOdd ? 0.35 : 0.45),
                      borderRadius: "0.5px",
                      minHeight: "4px",
                      margin: "0 0.25px",
                    }
                  : undefined),
              }}
            />
          );
        })}
      </div>

      {/* Couche active (barres colorées) - clippée par le progress */}
      <div
        ref={overlayRef}
        className={styles.barsLayerActive}
        style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
      >
        {bars.map((bar, index) => {
          const color = barColors?.[index];
          const isOdd = index % 2 === 1;

          return (
            <div
              key={index}
              className={color ? undefined : styles.activeBar}
              style={{
                flex: 1,
                height: `${bar.height}%`,
                opacity: bar.intensity,
                borderRadius: "0.5px",
                minHeight: "4px",
                margin: "0 0.25px",
                ...(color
                  ? {
                      background: hexToRgba(color, isOdd ? 0.75 : 0.9),
                    }
                  : undefined),
              }}
            />
          );
        })}
      </div>

      {/* Playhead */}
      <div
        ref={playheadRef}
        className={`${styles.playhead} ${isPlaying ? styles.playheadActive : ""}`}
        style={{ left: `${progress}%` }}
      />
    </div>
  );
};
