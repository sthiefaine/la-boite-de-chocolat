"use client";

import Image from "next/image";
import { IMAGE_CONFIG } from "@/helpers/imageConfig";
import styles from "./PodcastBackground.module.css";
import { useEffect, useState } from "react";

interface PodcastBackgroundAnimationProps {
  repeatedImages: string[];
  fallbackImages: string[];
}

export function PodcastBackgroundAnimation({
  repeatedImages,
  fallbackImages,
}: PodcastBackgroundAnimationProps) {
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    setIsTransitioning(false);
  }, []);

  return (
    <div className={styles.headerScroll}>
      <div
        className={`${styles.gridContainer} ${
          isTransitioning ? styles.loading : styles.loaded
        }`}
      >
        {Array.from({ length: 100 }, (_, index) => {
          const image = repeatedImages.length > 0
            ? repeatedImages[index]
            : fallbackImages[index % fallbackImages.length];

          return (
            <div
              key={index}
              className={`${styles.heroCoverArtsDiv} ${
                isTransitioning ? styles.fadeIn : ""
              }`}
              style={{
                animationDelay: `${(index % 20) * 50}ms`,
              }}
            >
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
