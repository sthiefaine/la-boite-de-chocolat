"use server";
import {
  getPodcastImagesByFeed,
  getPodcastImageUrls,
} from "@/app/actions/podcast-images";
import { PodcastBackgroundAnimation } from "./PodcastBackgroundAnimation";
import { Suspense } from "react";
import styles from "./PodcastBackground.module.css";

const fallbackImages = [
  "/images/navet.png",
  "/images/boite-de-chocolat-404.png",
];

function shuffleArray(array: string[]) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function PodcastBackgroundFallback() {
  return (
    <div className={styles.headerScroll}>
      <div className={`${styles.gridContainer} ${styles.loading}`}>
        {Array.from({ length: 100 }, (_, index) => (
          <div 
            key={index} 
            className={styles.heroCoverArtsDiv}
            style={{
              animationDelay: `${(index % 20) * 50}ms`,
            }}
          >
            <div className={styles.imagePlaceholder} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function PodcastBackground() {
  let podcastImages: string[] = [];

  const episodes = await getPodcastImagesByFeed("la-boite-de-chocolat");
  const imageUrls = await getPodcastImageUrls(episodes);
  podcastImages = imageUrls.length > 0 ? imageUrls : fallbackImages;

  if (podcastImages.length === 0) {
    podcastImages = fallbackImages;
  }

  const shuffledImages = shuffleArray(podcastImages);
  const repeatedImages = [];
  for (let i = 0; i < 100; i++) {
    repeatedImages.push(shuffledImages[i % shuffledImages.length]);
  }

  return (
    <Suspense fallback={<PodcastBackgroundFallback />}>
      <PodcastBackgroundAnimation
        repeatedImages={repeatedImages}
        fallbackImages={fallbackImages}
      />
    </Suspense>
  );
}
