"use client";

import Image from "next/image";
import { IMAGE_CONFIG } from "@/lib/imageConfig";
import styles from "./PodcastBackground.module.css";

interface PodcastBackgroundAnimationProps {
  podcastImages: string[];
  fallbackImages: string[];
}

export function PodcastBackgroundAnimation({
  podcastImages,
  fallbackImages,
}: PodcastBackgroundAnimationProps) {
  const images = podcastImages.length > 0 ? podcastImages : fallbackImages;

  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const shuffledImages = shuffleArray(images);

  const repeatedImages = [];
  for (let i = 0; i < 200; i++) {
    repeatedImages.push(shuffledImages[i % shuffledImages.length]);
  }

  return (
    <div className={styles.headerScroll}>
      <div className={styles.gridContainer}>
        {repeatedImages.map((image, index) => (
          <div key={index} className={styles.heroCoverArtsDiv}>
            <Image
              src={image}
              alt=""
              fill
              className={styles.image33}
              sizes="120px"
              quality={IMAGE_CONFIG.defaultQuality}
              placeholder="blur"
              priority
              blurDataURL={IMAGE_CONFIG.defaultBlurDataURL}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const fallbackIndex = index % fallbackImages.length;
                target.src = fallbackImages[fallbackIndex];
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
