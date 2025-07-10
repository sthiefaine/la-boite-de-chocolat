// Configuration pour les optimisations d'images Next.js

export const IMAGE_CONFIG = {
  // Qualité par défaut pour les images
  defaultQuality: 75,

  // Placeholder blur par défaut (image grise 1x1 pixel)
  defaultBlurDataURL:
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==",

  // Sizes responsives pour différents composants
  sizes: {
    // FilmCard - grille principale
    filmCard: "(max-width: 768px) 160px, (max-width: 1024px) 200px, 220px",

    // FilmCard compact - navigation
    filmCardCompact: "(max-width: 768px) 120px, 150px",

    // Hero section - grande image
    hero: "(max-width: 768px) 100vw, 50vw",

    // Player queue - petite image
    playerQueue: "40px",

    // Film poster - différentes tailles
    posterSmall: "64px",
    posterMedium: "128px",
    posterLarge: "192px",

    // Background image - pleine largeur
    background: "100vw",
  },

  // Configuration des domaines autorisés
  domains: {
    vercelBlob: "cz2cmm85bs9kxtd7.public.blob.vercel-storage.com",
    tmdb: "image.tmdb.org",
  },

  // Formats supportés
  formats: ["image/webp", "image/avif", "image/jpeg"],

  // Tailles de breakpoints pour les images responsives
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
  },
};

// Fonction utilitaire pour construire l'URL Vercel Blob
export function getVercelBlobUrl(imgFileName: string, folder: string = "films"): string {
  const imgFolder = folder.endsWith("s") ? folder : `${folder}s`;
  return `https://${IMAGE_CONFIG.domains.vercelBlob}/${imgFolder}/${imgFileName}`;
}

// Fonction utilitaire pour construire l'URL TMDB
export function getTMDBUrl(posterPath: string, size: string = "w342"): string {
  return `https://${IMAGE_CONFIG.domains.tmdb}/t/p/${size}${posterPath}`;
}

// Fonction utilitaire pour déterminer si une image doit être prioritaire
export function shouldPrioritizeImage(
  index: number,
  threshold: number = 3
): boolean {
  return index < threshold;
}
