// Helper pour les uploads vers uploadfiles.clairdev.com

import { IMAGE_CONFIG } from "./imageConfig";

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
  folder: string = 'films'
): Promise<UploadResponse> {
  try {
    const uploadUrl = IMAGE_CONFIG.domains.uploadServer;
    const writeToken = process.env.UPLOADFILES_WRITE_TOKEN;

    if (!uploadUrl || !writeToken) {
      throw new Error("Configuration d'upload manquante");
    }

    const formData = new FormData();
    formData.append('folder', folder);
    formData.append('files', file);

    console.log('📤 Upload request:', {
      url: uploadUrl,
      folder: folder,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${writeToken}`
      },
      body: formData
    });

    console.log('📤 Upload response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Lire d'abord le texte brut
    const responseText = await response.text();
    console.log('📤 Response text:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
      console.log('📤 Parsed JSON:', result);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('❌ Response text was:', responseText);
      return {
        success: false,
        error: `Erreur parsing JSON: ${responseText}`,
      };
    }

    const baseUrl = IMAGE_CONFIG.domains.uploadServer
    // ex /uploads/podcasts/films/image1_1703123456789_abc123.jpg en image1_1703123456789_abc123.jpg
    const filesNames = result.files.map((file: string) => file.substring(file.lastIndexOf('/') + 1));
    // baseUrl + filesNames[0] = https://uploadfiles.clairdev.com/uploads/podcasts/films/image1_1703123456789_abc123.jpg

    
    if (result.success) {
      console.log('✅ Upload réussi:', result);
      return {
        success: true,
        url: baseUrl + filesNames[0],
        filename: filesNames[0],
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
    const result = await uploadSingleFile(file, 'la-boite-de-chocolat/episodes');

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
    const uploadUrl = IMAGE_CONFIG.domains.uploadServer;
    const writeToken = process.env.UPLOADFILES_WRITE_TOKEN;

    if (!uploadUrl || !writeToken) {
      throw new Error("Configuration d'upload manquante");
    }

    // Télécharger l'image depuis l'URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Impossible de télécharger l'image depuis l'URL");
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const imageBlob = new Blob([imageBuffer], { type: contentType });


    // Créer un FormData avec le blob directement
    const formData = new FormData();
    formData.append('folder', 'podcasts/' + folder);
    formData.append('files', imageBlob, fileName);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${writeToken}`
      },
      body: formData
    });

    // Lire d'abord le texte brut
    const responseText = await response.text();
    console.log('📤 Response text:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
      console.log('📤 Parsed JSON:', result);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('❌ Response text was:', responseText);
      return {
        success: false,
        error: `Erreur parsing JSON: ${responseText}`,
      };
    }

    const baseUrl = IMAGE_CONFIG.domains.uploadServer;
    // ex /uploads/podcasts/films/image1_1703123456789_abc123.jpg en image1_1703123456789_abc123.jpg
    const filesNames = result.files.map((file: string) => file.substring(file.lastIndexOf('/') + 1));
    // baseUrl + filesNames[0] = https://uploadfiles.clairdev.com/uploads/podcasts/films/image1_1703123456789_abc123.jpg

    if (result.success) {
      console.log('✅ Upload from URL réussi:', result);
      return {
        success: true,
        url: baseUrl + filesNames[0],
        filename: filesNames[0],
      };
    } else {
      console.error('❌ Erreur upload from URL:', result.error);
      return {
        success: false,
        error: result.error || "Erreur d'upload inconnue",
      };
    }
  } catch (error) {
    console.error("Erreur upload image depuis URL:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur d'upload",
    };
  }
} 