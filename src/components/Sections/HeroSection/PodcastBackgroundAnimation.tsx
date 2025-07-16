"use client";

import Image from "next/image";
import { IMAGE_CONFIG } from "@/helpers/imageConfig";
import styles from "./PodcastBackground.module.css";
import { useEffect, useState } from "react";

interface PodcastBackgroundAnimationProps {
  podcastImages: string[];
  fallbackImages: string[];
}

export function PodcastBackgroundAnimation({
  podcastImages,
  fallbackImages,
}: PodcastBackgroundAnimationProps) {
  const [repeatedImages, setRepeatedImages] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

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

    const repeated = [];
    for (let i = 0; i < 100; i++) {
      repeated.push(shuffledImages[i % shuffledImages.length]);
    }

    setRepeatedImages(repeated);
  }, [podcastImages, fallbackImages]);

  if (!isClient || repeatedImages.length === 0) {
    return (
      <div className={styles.headerScroll}>
        <div className={styles.gridContainer}>
          {/* Afficher les images non mélangées pendant le chargement */}
          {Array.from({ length: 60 }, (_, index) => {
            const images =
              podcastImages.length > 0 ? podcastImages : fallbackImages;
            const image = images[index % images.length];
            return (
              <div key={index} className={styles.heroCoverArtsDiv}>
                <Image
                  src={image}
                  alt=""
                  fill
                  className={styles.image33}
                  sizes="80px"
                  quality={IMAGE_CONFIG.defaultQuality}
                  placeholder="blur"
                  priority={index < 10}
                  blurDataURL={IMAGE_CONFIG.defaultBlurDataURL}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const fallbackIndex = index % fallbackImages.length;
                    target.src = fallbackImages[fallbackIndex];
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
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
              sizes="80px"
              quality={IMAGE_CONFIG.defaultQuality}
              placeholder="blur"
              priority={index < 10} // Priorité pour les 10 premières images
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
