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
      'Les Gardiens de la Galaxie - Saga',
      'Black Panther - Saga'
    ]
  },
} as const;

export type PodcastCategory = keyof typeof PODCAST_CATEGORIES;

export const PODCAST_GENRES = {
  ANONCE: 'anonce',
  MUSIQUE: 'musique',
  INTERVIEW: 'interview',
  DEBAT: 'debat',
  CRITIQUE: 'critique',
  CHRONIQUE: 'chronique',
  SPECIAL: 'special',
  HORS_SUJET: 'hors_sujet'
} as const;


export const AGE_RATINGS = {
  ALL: 'all',
  TWELVE_PLUS: '12+',
  SIXTEEN_PLUS: '16+',
  EIGHTEEN_PLUS: '18+'
} as const;

export const AGE_RATING_LABELS = {
  [AGE_RATINGS.ALL]: 'Tous publics',
  [AGE_RATINGS.TWELVE_PLUS]: '12 ans et plus',
  [AGE_RATINGS.SIXTEEN_PLUS]: '16 ans et plus',
  [AGE_RATINGS.EIGHTEEN_PLUS]: '18 ans et plus'
} as const;

export const AGE_RATING_COLORS = {
  [AGE_RATINGS.ALL]: '#4ade80',
  [AGE_RATINGS.TWELVE_PLUS]: '#fbbf24',
  [AGE_RATINGS.SIXTEEN_PLUS]: '#f97316',
  [AGE_RATINGS.EIGHTEEN_PLUS]: '#ef4444'
} as const;

/**
 * Utilitaires pour la validation d'emails Gmail
 */

/**
 * Normalise un email Gmail en supprimant les alias avec "+" et les points
 * @param email - L'email à normaliser
 * @returns L'email normalisé
 */
export function normalizeGmailEmail(email: string): string {
  const [localPart, domain] = email.toLowerCase().split('@');
  
  // Si c'est un email Gmail, normaliser la partie locale
  if (domain === 'gmail.com') {
    // Supprimer tout ce qui suit le "+" dans la partie locale
    const normalizedLocal = localPart.split('+')[0];
    // Supprimer les points (Gmail ignore les points)
    const withoutDots = normalizedLocal.replace(/\./g, '');
    return `${withoutDots}@gmail.com`;
  }
  
  return email.toLowerCase();
}

/**
 * Vérifie si deux emails Gmail sont équivalents
 * @param email1 - Premier email
 * @param email2 - Deuxième email
 * @returns true si les emails sont équivalents
 */
export function areGmailEquivalent(email1: string, email2: string): boolean {
  const normalized1 = normalizeGmailEmail(email1);
  const normalized2 = normalizeGmailEmail(email2);
  return normalized1 === normalized2;
}

/**
 * Exemples d'utilisation de la normalisation Gmail
 * 
 * normalizeGmailEmail("test@gmail.com") → "test@gmail.com"
 * normalizeGmailEmail("test+alias@gmail.com") → "test@gmail.com"
 * normalizeGmailEmail("t.e.s.t@gmail.com") → "test@gmail.com"
 * normalizeGmailEmail("test+alias+other@gmail.com") → "test@gmail.com"
 * normalizeGmailEmail("user@outlook.com") → "user@outlook.com" (pas de changement)
 */