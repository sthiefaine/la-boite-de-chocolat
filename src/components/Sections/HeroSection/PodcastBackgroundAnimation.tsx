"use client";

import Image from "next/image";
import { IMAGE_CONFIG } from "@/helpers/imageConfig";
import styles from "./PodcastBackground.module.css";
import { useCallback, useEffect, useRef, useState } from "react";

const GRID_SIZE = 100;
const SWAP_INTERVAL = 2000;
const SWAP_COUNT = 1;
const FLIP_DURATION = 1400;

interface PodcastBackgroundAnimationProps {
  repeatedImages: string[];
  fallbackImages: string[];
}

export function PodcastBackgroundAnimation({
  repeatedImages,
  fallbackImages,
}: PodcastBackgroundAnimationProps) {
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [currentImages, setCurrentImages] = useState<string[]>(() =>
    Array.from({ length: GRID_SIZE }, (_, i) =>
      repeatedImages.length > 0
        ? repeatedImages[i % repeatedImages.length]
        : fallbackImages[i % fallbackImages.length]
    )
  );
  const [flippingCells, setFlippingCells] = useState<Set<number>>(new Set());
  const currentImagesRef = useRef(currentImages);
  currentImagesRef.current = currentImages;
  const pendingSwaps = useRef<Map<number, string>>(new Map());

  useEffect(() => {
    setIsTransitioning(false);
  }, []);

  const pickNewImage = useCallback(
    (currentImage: string) => {
      if (repeatedImages.length <= 1) return repeatedImages[0] || fallbackImages[0];
      let attempts = 0;
      let newImage: string;
      do {
        newImage =
          repeatedImages[Math.floor(Math.random() * repeatedImages.length)];
        attempts++;
      } while (newImage === currentImage && attempts < 10);
      return newImage;
    },
    [repeatedImages, fallbackImages]
  );

  useEffect(() => {
    if (isTransitioning || repeatedImages.length < 2) return;

    const interval = setInterval(() => {
      const indices = new Set<number>();
      while (indices.size < SWAP_COUNT) {
        indices.add(Math.floor(Math.random() * GRID_SIZE));
      }

      const swaps = new Map<number, string>();
      for (const idx of indices) {
        swaps.set(idx, pickNewImage(currentImagesRef.current[idx]));
      }

      pendingSwaps.current = swaps;
      setFlippingCells(new Set(indices));

      // At midpoint (cell is edge-on / invisible), swap the image
      setTimeout(() => {
        setCurrentImages((prev) => {
          const next = [...prev];
          for (const [idx, img] of pendingSwaps.current) {
            next[idx] = img;
          }
          return next;
        });
      }, FLIP_DURATION / 2);

      // After animation ends, clear flipping state
      setTimeout(() => {
        setFlippingCells(new Set());
      }, FLIP_DURATION + 50);
    }, SWAP_INTERVAL);

    return () => clearInterval(interval);
  }, [isTransitioning, repeatedImages, pickNewImage]);

  return (
    <div className={styles.headerScroll}>
      <div
        className={`${styles.gridContainer} ${
          isTransitioning ? styles.loading : styles.loaded
        }`}
      >
        {currentImages.map((image, index) => (
          <div
            key={index}
            className={`${styles.heroCoverArtsDiv} ${
              isTransitioning ? styles.fadeIn : ""
            } ${flippingCells.has(index) ? styles.flipping : ""}`}
            style={{
              animationDelay: isTransitioning
                ? `${(index % 20) * 50}ms`
                : undefined,
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
        ))}
      </div>
    </div>
  );
}
