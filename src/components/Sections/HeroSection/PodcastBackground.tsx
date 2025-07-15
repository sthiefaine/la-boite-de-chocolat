import {
  getPodcastImagesByFeed,
  getPodcastImageUrls,
} from "@/app/actions/podcast-images";
import { PodcastBackgroundAnimation } from "./PodcastBackgroundAnimation";

const fallbackImages = [
  "/images/navet.png",
  "/images/boite-de-chocolat-404.png",
];

export default async function PodcastBackground() {
  let podcastImages: string[] = [];

  try {
    const episodes = await getPodcastImagesByFeed("la-boite-de-chocolat");
    const imageUrls = await getPodcastImageUrls(episodes);
    podcastImages = imageUrls.length > 0 ? imageUrls : fallbackImages;
  } catch (error) {
    console.error("Erreur lors de la récupération des images:", error);
    podcastImages = fallbackImages;
  }

  return (
    <PodcastBackgroundAnimation
      podcastImages={podcastImages}
      fallbackImages={fallbackImages}
    />
  );
}
