// Helper pour les uploads vers uploadfiles.clairdev.com

interface UploadResponse {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

interface UploadFileResponse {
  success: boolean;
  data?: {
    fileName: string;
    url: string;
  };
  error?: string;
}

/**
 * Upload un fichier vers le serveur uploadfiles.clairdev.com
 */
export async function uploadSingleFile(
  file: File,
  folder: string = 'podcasts/films'
): Promise<UploadResponse> {
  try {
    const uploadUrl = process.env.UPLOADFILES_URL;
    const writeToken = process.env.UPLOADFILES_WRITE_TOKEN;

    if (!uploadUrl || !writeToken) {
      throw new Error("Configuration d'upload manquante");
    }

    const formData = new FormData();
    formData.append('folder', folder);
    formData.append('files', file);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${writeToken}`
      },
      body: formData
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload réussi:', result);
      return {
        success: true,
        url: result.url || result.files?.[0]?.url,
        filename: result.filename || result.files?.[0]?.filename,
      };
    } else {
      console.error('❌ Erreur upload:', result.error);
      return {
        success: false,
        error: result.error || "Erreur d'upload inconnue",
      };
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur d'upload",
    };
  }
}

/**
 * Upload un fichier pour les films
 */
export async function uploadToServer(
  file: File,
  fileName: string,
  folder: string = "films"
): Promise<UploadResponse> {
  return await uploadSingleFile(file, folder);
}

/**
 * Upload un fichier pour les épisodes de podcast
 */
export async function uploadPodcastFile(
  file: File,
  fileName: string
): Promise<UploadFileResponse> {
  try {
    const result = await uploadSingleFile(file, 'podcasts/la-boite-de-chocolat/episodes');

    if (result.success) {
      return {
        success: true,
        data: {
          fileName: fileName,
          url: result.url || '',
        },
      };
    } else {
      return {
        success: false,
        error: result.error || "Erreur d'upload",
      };
    }
  } catch (error) {
    console.error("Erreur upload podcast vers serveur:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur d'upload",
    };
  }
}

/**
 * Upload une image depuis une URL (pour TMDB)
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  fileName: string,
  folder: string = "films"
): Promise<UploadResponse> {
  try {
    // Télécharger l'image depuis l'URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Impossible de télécharger l'image depuis l'URL");
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBlob = new Blob([imageBuffer]);

    // Créer un fichier à partir du blob
    const file = new File([imageBlob], fileName, { type: 'image/jpeg' });

    // Upload vers le serveur
    return await uploadSingleFile(file, folder);
  } catch (error) {
    console.error("Erreur upload image depuis URL:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur d'upload",
    };
  }
} 