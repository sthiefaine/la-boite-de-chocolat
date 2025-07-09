export interface PodcastDescriptionInfo {
  instagram?: string;
  email?: string;
  hosts?: string[];
  cleanDescription: string;
  socialLinks: string[];
}

export function formatPodcastDescription(description: string): PodcastDescriptionInfo {
  const info: PodcastDescriptionInfo = {
    cleanDescription: description,
    socialLinks: [],
  };

  const instagramMatch = description.match(/insta\s*:\s*([a-zA-Z0-9_.]+)/i);
  if (instagramMatch) {
    info.instagram = instagramMatch[1];
    info.socialLinks.push(`Instagram: ${instagramMatch[1]}`);
  }

  const emailMatch = description.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    info.email = emailMatch[1];
    info.socialLinks.push(`Email: ${emailMatch[1]}`);
  }

  const hostsMatch = description.match(/(?:nous retrouvons|avec|participent?)\s*([^.!?]+)/i);
  if (hostsMatch) {
    const hostsText = hostsMatch[1];
    const names = hostsText
      .split(/[,et]+/)
      .map((name) => name.trim())
      .filter(
        (name) =>
          name.length > 0 &&
          !name.match(/^(et|avec|nous|retrouvons|participent|ce soir|sur les bancs|la défor|s|a|ion)$/i) &&
          name.length > 1 &&
          !name.match(/^[a-z]$/i)
      );

    if (names.length > 0) {
      info.hosts = names;
    }
  }

  info.cleanDescription = cleanDescription(description);
  return info;
}

function cleanDescription(description: string): string {
  let cleaned = description;

  cleaned = cleaned.replace(/^insta\s*:\s*[a-zA-Z0-9_.]+\s*(?:ou\s+[a-zA-Z0-9_.]+)?\s*/i, "");
  cleaned = cleaned.replace(/\s*Hébergé par [^.]*\.?\s*/gi, "");
  cleaned = cleaned.replace(/\s*Visitez [^.]*\.?\s*/gi, "");
  cleaned = cleaned.replace(/\s*(?:PROFITEZ EN POUR VOUS SUIVRE SUR|SUIVEZ NOUS SUR|RETROUVEZ NOUS SUR)[^.!?]*[.!?]?\s*/gi, "");
  cleaned = cleaned.replace(/\s*(?:N'?HÉSITEZ PAS|N'HÉSITEZ PAS D'AILLEURS) À NOUS LAISSER[^.!?]*[.!?]?\s*/gi, "");
  cleaned = cleaned.replace(/\s*(?:N'?HÉSITEZ PAS|N'HÉSITEZ PAS D'AILLEURS) À[^.!?]*[.!?]?\s*/gi, "");
  cleaned = cleaned.replace(/\s*VOUS ETES DE PLUS EN PLUS NOMBREUX[^.!?]*[.!?]?\s*/gi, "");
  cleaned = cleaned.replace(/\s*SOYEZ DE MOINS EN MOINS TIMIDE[^.!?]*[.!?]?\s*/gi, "");
  cleaned = cleaned.replace(/\s*ET AUSSI DES BONNES ETOILES[^.!?]*[.!?]?\s*/gi, "");
  cleaned = cleaned.replace(/\s*ET AUSSI[^.!?]*[.!?]?\s*/gi, "");
  cleaned = cleaned.replace(/\s*SUGGEREZ NOUS[^.!?]*[.!?]?\s*/gi, "");
  cleaned = cleaned.replace(/\s*ON LES FERA[^.!?]*[.!?]?\s*/gi, "");
  cleaned = cleaned.replace(/\s*voici notre mail[^.!?]*[.!?]?\s*/gi, "");
  cleaned = cleaned.replace(/\s*insta\s*:\s*[a-zA-Z0-9_.]+\s*/gi, "");
  cleaned = cleaned.replace(/\s*https?:\/\/[^\s]*\s*/gi, "");
  cleaned = cleaned.replace(/\s*comcom\/[^\s]*\s*/gi, "");
  cleaned = cleaned.replace(/\s*pour plus d'informations[^.!?]*[.!?]?\s*/gi, "");

  cleaned = cleaned.replace(/\s+/g, " ").trim();
  cleaned = formatParagraphs(cleaned);

  return cleaned;
}

function formatParagraphs(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const paragraphs: string[] = [];
  let currentParagraph: string[] = [];

  for (const sentence of sentences) {
    if (sentence.trim().length === 0) continue;

    const isNewParagraph =
      sentence.match(/^(Et oui|Et bien|Et là|Alors|Du coup|Pour ce|Là-bas|Entre en scène)/i) ||
      sentence.match(/^(Oui\.|Non\.|Alors\.|Du coup\.|Et là\.)/i) ||
      (currentParagraph.length > 0 && sentence.length > 100);

    if (isNewParagraph && currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(" "));
      currentParagraph = [];
    }

    currentParagraph.push(sentence);
  }

  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join(" "));
  }

  return paragraphs.join("\n\n");
}

export function extractSocialLinks(description: string): string[] {
  const links: string[] = [];

  const instagramMatch = description.match(/insta\s*:\s*([a-zA-Z0-9_.]+)/i);
  if (instagramMatch) {
    links.push(`Instagram: ${instagramMatch[1]}`);
  }

  const emailMatch = description.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    links.push(`Email: ${emailMatch[1]}`);
  }

  return links;
}

export function extractHosts(description: string): string[] {
  const hostsMatch = description.match(/(?:nous retrouvons|avec|participent?)\s*([^.!?]+)/i);
  if (!hostsMatch) return [];

  const hostsText = hostsMatch[1];
  return hostsText
    .split(/[,et]+/)
    .map((name) => name.trim())
    .filter(
      (name) =>
        name.length > 0 &&
        !name.match(/^(et|avec|nous|retrouvons|participent|ce soir|sur les bancs|la défor|s|a|ion)$/i) &&
        name.length > 1 &&
        !name.match(/^[a-z]$/i)
    );
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + "...";
  }
  
  return truncated + "...";
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '');
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}min`;
  }
}

export function formatEpisodeDescription(description: string, maxLength: number = 200): string {
  let cleanDescription = description.replace(/<[^>]*>/g, '');
  
  cleanDescription = cleanDescription
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  
  cleanDescription = cleanDescription.replace(/https?:\/\/[^\s]+/g, '');
  
  const platformMentions = [
    /spotify\.com/gi,
    /apple\.co/gi,
    /podcasts\.apple\.com/gi,
    /youtube\.com/gi,
    /youtu\.be/gi,
    /acast\.com/gi,
    /rss\.acast\.com/gi
  ];
  
  platformMentions.forEach(pattern => {
    cleanDescription = cleanDescription.replace(pattern, '');
  });
  
  const instagramPhrase = /insta\s*:\s*laboite2chocolat\s+ou\s+la_boitedechocolat/gi;
  cleanDescription = cleanDescription.replace(instagramPhrase, '');
  
  cleanDescription = cleanDescription.replace(/\s+/g, ' ').trim();
  
  if (cleanDescription.length > maxLength) {
    cleanDescription = cleanDescription.substring(0, maxLength);
    const lastSpace = cleanDescription.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      cleanDescription = cleanDescription.substring(0, lastSpace);
    }
    cleanDescription += '...';
  }
  
  return cleanDescription;
}
