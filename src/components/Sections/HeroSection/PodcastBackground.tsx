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

    const episodes = await getPodcastImagesByFeed("la-boite-de-chocolat");
    const imageUrls = await getPodcastImageUrls(episodes);
    podcastImages = imageUrls.length > 0 ? imageUrls : fallbackImages;

  if (podcastImages.length === 0) {
    podcastImages = fallbackImages;
  }

  return (
    <PodcastBackgroundAnimation
      podcastImages={podcastImages}
      fallbackImages={fallbackImages}
    />
  );
}
