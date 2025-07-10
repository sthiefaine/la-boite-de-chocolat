// Fonction pour créer un slug à partir d'une chaîne de caractères
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Remplace les espaces par des tirets
    .replace(/[^\w\-]+/g, "") // Supprime tous les caractères non alphanumériques
    .replace(/\-\-+/g, "-") // Remplace les tirets multiples par un seul
    .replace(/^-+/, "") // Supprime les tirets au début
    .replace(/-+$/, ""); // Supprime les tirets à la fin
};

function adjustColorBrightness(
  rgb: number[],
  threshold: number,
  adjustment: number
): number[] {
  const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;

  if (luminance > threshold) {
    // Si la luminance est trop élevée, ajuster la couleur en réduisant la luminosité
    const reductionFactor = luminance > 0.9 ? 0.6 : 0.7;
    return rgb.map((color) => Math.max(0, Math.floor(color * reductionFactor)));
  } else {
    return rgb;
  }
}

/* function adjustColorBrown(
  rgb: number[],
  threshold: number,
  adjustment: number
): number[] {
  const yellowProportion = (rgb[0] + rgb[1]) / (rgb[2] + 1);

  if (yellowProportion > threshold) {
    // - Réduire légèrement le rouge avec un facteur plus proche de 1
    // - Augmenter le vert avec un adjustment atténué
    return [
      Math.min(255, Math.floor(rgb[0] * 0.95)), // Réduction plus légère du rouge
      Math.min(255, rgb[1] + Math.floor(adjustment * 0.5)), // Moitié de l'ajustement sur le vert
      rgb[2], // Bleu inchangé
    ];
  } else {
    return rgb;
  }
} */

export async function getAverageRGB(src: string): Promise<number[]> {
  /* https://stackoverflow.com/questions/2541481/get-average-color-of-image-via-javascript */
  return new Promise((resolve) => {
    const context = document.createElement("canvas").getContext("2d");
    context!.imageSmoothingEnabled = true;

    const img = new Image();
    img.src = src;
    img.crossOrigin = "";

    img.onload = () => {
      context!.drawImage(img, 0, 0, 1, 1);
      const imageData = context!.getImageData(0, 0, 1, 1);
      const rgb: Uint8ClampedArray = imageData.data.slice(0, 3);

      // Appeler la fonction d'ajustement de la luminosité
      // Seuil plus bas et ajustement plus agressif
      let adjustedRGB = adjustColorBrightness(Array.from(rgb), 0.6, 30);

      // adjustedRGB = adjustColorBrown(adjustedRGB, 2, 20);
      resolve(adjustedRGB);
    };
  });
}

export const PODCAST_CATEGORIES = {
  MARVEL: {
    id: 'marvel',
    name: 'Marvel Cinematic Universe',
    icon: '🦸‍♂️',
    color: '#e62429',
    sagaNames: [
      'Marvel Cinematic Universe',
      'Avengers - Saga',
      'Iron Man - Saga',
      'Doctor Strange - Saga',
      'Ant-Man - Saga',
      'Captain America - Saga',
      'Thor - Saga',
      'Spider-Man (Avengers) - Saga',
      'Les Gardiens de la Galaxie - Saga'
    ]
  },
} as const;

export type PodcastCategory = keyof typeof PODCAST_CATEGORIES;
