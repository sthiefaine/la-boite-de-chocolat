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
    uploadServer: "https://uploadfiles.clairdev.com/api/upload",
    uploadReadServer: "https://uploadfiles.clairdev.com/api/display/podcasts",
    uploadFilesBase: "https://uploadfiles.clairdev.com/uploads/podcasts",
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

// Fonction utilitaire pour construire l'URL du serveur d'upload
export function getUploadServerUrl(
  imgFileName: string,
  folder: "films" | "sagas" | "people" | string = "films"
): string {
  if (folder.includes("/")) {
    // Pour les chemins complexes comme "podcasts/la-boite-de-chocolat/episodes"
    return `${IMAGE_CONFIG.domains.uploadReadServer}${folder}/${imgFileName}`;
  }

  // Pour les dossiers simples comme "films", "sagas", "people" - utiliser l'API display
  const baseUrl = `${IMAGE_CONFIG.domains.uploadReadServer}`;

  // Mapping des dossiers spéciaux
  const folderMap: Record<string, string> = {
    films: "films",
    sagas: "sagas",
    people: "people",
  };

  const imgFolder = folderMap[folder] || (folder.endsWith("s") ? folder : `${folder}s`);
  return `${baseUrl}/${imgFolder}/${imgFileName}`;
}

// Fonction utilitaire pour construire l'URL TMDB
export function getTMDBUrl(posterPath: string, size: string = "w342"): string {
  return `https://${IMAGE_CONFIG.domains.tmdb}/t/p/${size}${posterPath}`;
}

// ---------------------------------------------------------------------------
// Médias canoniques partagés entre sites (laboitedechocolat, scene2films,
// agrégateur…). Convention : une image TMDB est stockée UNE SEULE FOIS sur le
// serveur d'upload, sous un chemin déterministe dérivé du tmdbId :
//   media/films/{tmdbId}.jpg · media/people/{tmdbId}.jpg · media/sagas/{tmdbId}.jpg
// Les images custom (hors TMDB) vivent dans media/{kind}/custom/ et sont
// référencées par imgFileName/photoFileName, qui agit comme un OVERRIDE :
// s'il est non nul on le sert, sinon on sert l'URL canonique.
// ---------------------------------------------------------------------------

export type MediaKind = "films" | "people" | "sagas";

export const MEDIA_FOLDER = "media";

export const PLACEHOLDER_IMAGE = "/images/navet.png";

// URL canonique d'une image partagée, fonction pure du tmdbId.
export function getCanonicalMediaUrl(kind: MediaKind, tmdbId: number): string {
  return `${IMAGE_CONFIG.domains.uploadReadServer}/${MEDIA_FOLDER}/${kind}/${tmdbId}.jpg`;
}

type FilmImageRef = {
  tmdbId?: number | null;
  imgFileName?: string | null;
};

type PersonImageRef = {
  tmdbId?: number | null;
  photoFileName?: string | null;
};

// Résolution unique des images : override custom > canonique tmdbId > placeholder.
export function getFilmPosterUrl(film: FilmImageRef): string {
  if (film.imgFileName) {
    return film.imgFileName.startsWith("custom-")
      ? `${IMAGE_CONFIG.domains.uploadReadServer}/${MEDIA_FOLDER}/films/custom/${film.imgFileName}`
      : getUploadServerUrl(film.imgFileName, "films");
  }
  if (film.tmdbId) return getCanonicalMediaUrl("films", film.tmdbId);
  return PLACEHOLDER_IMAGE;
}

export function getPersonPhotoUrl(person: PersonImageRef): string {
  if (person.photoFileName) {
    return getUploadServerUrl(person.photoFileName, "people");
  }
  if (person.tmdbId) return getCanonicalMediaUrl("people", person.tmdbId);
  return PLACEHOLDER_IMAGE;
}

export function getSagaPosterUrl(saga: FilmImageRef): string {
  if (saga.imgFileName) {
    return getUploadServerUrl(saga.imgFileName, "sagas");
  }
  if (saga.tmdbId) return getCanonicalMediaUrl("sagas", saga.tmdbId);
  return PLACEHOLDER_IMAGE;
}

// Version floutée (18+) : la route /api/image/masked résout elle-même
// canonique ({tmdbId}.jpg), custom (custom-…) et legacy.
export function getMaskedFilmPosterUrl(film: FilmImageRef): string {
  const filename = film.imgFileName ?? (film.tmdbId ? `${film.tmdbId}.jpg` : null);
  if (!filename) return PLACEHOLDER_IMAGE;
  return `/api/image/masked/${encodeURIComponent(filename)}`;
}

// Helper combiné : floutée si contenu adulte, normale sinon.
export function getFilmPosterUrlWithAge(
  film: FilmImageRef,
  age: string | null | undefined
): string {
  const isAdult = age === "18+" || age === "adult";
  return isAdult ? getMaskedFilmPosterUrl(film) : getFilmPosterUrl(film);
}

// Fonction utilitaire pour construire l'URL d'image Open Graph optimisée
export function getOpenGraphImageUrl(filename: string): string {
  return `/api/image/og/${filename}`;
}

// Fonction utilitaire pour déterminer si une image doit être prioritaire
export function shouldPrioritizeImage(
  index: number,
  threshold: number = 3
): boolean {
  return index < threshold;
}
