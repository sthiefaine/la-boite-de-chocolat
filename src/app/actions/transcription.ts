"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  TRANSCRIPTION_CONFIG,
  isSupportedFileType,
  formatFileSize,
} from "@/helpers/transcriptionHelpers";
import { IMAGE_CONFIG } from "@/helpers/imageConfig";

/**
 * Upload une transcription pour un épisode
 */
export async function uploadTranscription(formData: FormData) {
  try {
    const episodeId = formData.get("episodeId") as string;
    const file = formData.get("transcriptionFile") as File;

    if (!episodeId || !file) {
      return { success: false, error: "Données manquantes" };
    }

    // Vérifier que l'épisode existe
    const episode = await prisma.podcastEpisode.findUnique({
      where: { id: episodeId },
      select: { id: true, slug: true, title: true },
    });

    if (!episode) {
      return { success: false, error: "Épisode non trouvé" };
    }

    // Vérifier le type de fichier
    if (!isSupportedFileType(file.name)) {
      return {
        success: false,
        error: "Type de fichier non supporté. Utilisez .srt, .txt, .vtt ou .json",
      };
    }

    if (file.size > TRANSCRIPTION_CONFIG.maxSize) {
      return {
        success: false,
        error: `Fichier trop volumineux (max ${formatFileSize(
          TRANSCRIPTION_CONFIG.maxSize
        )})`,
      };
    }

    // --- Upload façon uploadImageFromUrl ---
    const uploadUrl = IMAGE_CONFIG.domains.uploadServer;
    const writeToken = process.env.UPLOADFILES_WRITE_TOKEN;
    if (!uploadUrl || !writeToken) {
      return { success: false, error: "Configuration d'upload manquante" };
    }

    const form = new FormData();
    form.append('folder', 'podcasts/laboitedechocolat/episodes');

    // Le serveur d'upload refuse application/json, on force text/plain pour les .json
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
    if (fileExtension === ".json") {
      const blob = new Blob([await file.arrayBuffer()], { type: "text/plain" });
      form.append('files', blob, file.name);
    } else {
      form.append('files', file, file.name);
    }

    let uploadResult;
    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${writeToken}`
        },
        body: form
      });
      const responseText = await response.text();
      try {
        uploadResult = JSON.parse(responseText);
      } catch (e) {
        return { success: false, error: "Erreur parsing JSON: " + responseText };
      }
    } catch (uploadError) {
      console.error("Erreur lors de l'upload vers le serveur externe:", uploadError);
      return {
        success: false,
        error: "Erreur lors de l'upload vers le serveur externe",
      };
    }

    if (!uploadResult.success || !uploadResult.files || !uploadResult.files.length) {
      return { success: false, error: uploadResult.error || "Erreur d'upload" };
    }

    const fileName = uploadResult.files[0].substring(uploadResult.files[0].lastIndexOf('/') + 1);

    // Sauvegarder en base de données
    const transcription = await prisma.transcription.upsert({
      where: { episodeId },
      update: {
        fileName,
        fileSize: file.size,
        fileType: file.name.toLowerCase().substring(file.name.lastIndexOf(".") + 1),
        updatedAt: new Date(),
      },
      create: {
        episodeId,
        fileName,
        fileSize: file.size,
        fileType: file.name.toLowerCase().substring(file.name.lastIndexOf(".") + 1),
      },
    });

    revalidatePath(`/episodes/${episode.slug}`);
    revalidatePath(`/admin/episode/${episodeId}/edit`);

    return {
      success: true,
      transcription,
      message: "Transcription uploadée avec succès !",
    };
  } catch (error) {
    console.error("Erreur lors de l'upload de la transcription:", error);
    return { success: false, error: "Erreur lors de l'upload" };
  }
}

/**
 * Supprime une transcription
 */
export async function deleteTranscription(episodeId: string) {
  try {
    const transcription = await prisma.transcription.findUnique({
      where: { episodeId },
      include: {
        episode: {
          select: { slug: true },
        },
      },
    });

    if (!transcription) {
      return { success: false, error: "Transcription non trouvée" };
    }

    // Supprimer de la base de données
    await prisma.transcription.delete({
      where: { episodeId },
    });

    revalidatePath(`/episodes/${transcription.episode.slug}`);
    revalidatePath(`/admin/episode/${episodeId}/edit`);

    return {
      success: true,
      message: "Transcription supprimée avec succès !",
    };
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

/**
 * Récupère une transcription par ID d'épisode
 */
export async function getTranscription(episodeId: string) {
  try {
    const transcription = await prisma.transcription.findUnique({
      where: { episodeId },
      include: {
        episode: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });

    return { success: true, transcription };
  } catch (error) {
    console.error("Erreur lors de la récupération de la transcription:", error);
    return { success: false, error: "Erreur lors de la récupération" };
  }
}

/**
 * Télécharge le contenu d'une transcription
 */
export async function downloadTranscriptionContent(episodeId: string) {
  try {
    const transcription = await prisma.transcription.findUnique({
      where: { episodeId },
      include: {
        episode: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!transcription) {
      return { success: false, error: "Transcription non trouvée" };
    }

    // Construire l'URL du fichier
    const fileUrl = `${TRANSCRIPTION_CONFIG.readServer}${transcription.fileName}`;

    // Récupérer le contenu du fichier
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      return { 
        success: false, 
        error: `Erreur lors de la récupération du fichier: ${response.status}` 
      };
    }

    const content = await response.text();

    return {
      success: true,
      transcription: {
        ...transcription,
        content,
      },
    };
  } catch (error) {
    console.error("Erreur lors du téléchargement de la transcription:", error);
    return { success: false, error: "Erreur lors du téléchargement" };
  }
}
