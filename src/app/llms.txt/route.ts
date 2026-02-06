import { prisma } from "@/lib/prisma";
import {
  SITE_URL,
  PODCAST_URLS,
  SOCIAL_URLS,
  CONTACT_URLS,
} from "@/helpers/config";

export async function GET() {
  const [episodeCount, filmCount, sagaCount, personCount, latestEpisodes, sagas] =
    await Promise.all([
      prisma.podcastEpisode.count(),
      prisma.film.count(),
      prisma.saga.count(),
      prisma.person.count(),
      prisma.podcastEpisode.findMany({
        orderBy: { pubDate: "desc" },
        take: 10,
        select: { title: true, slug: true, pubDate: true },
      }),
      prisma.saga.findMany({
        orderBy: { name: "asc" },
        select: { name: true, slug: true },
      }),
    ]);

  const latestEpisodesMarkdown = latestEpisodes
    .map((ep) => `- [${ep.title}](${SITE_URL}/episodes/${ep.slug})`)
    .join("\n");

  const sagasMarkdown = sagas
    .map((s) => `- [${s.name}](${SITE_URL}/sagas/${s.slug})`)
    .join("\n");

  const content = `# La Boîte de Chocolat

> Podcast cinéma français qui analyse vos films préférés avec mauvaise foi. Animé par Thomas, Charlie et Thomas.

## À propos

La Boîte de Chocolat est un podcast francophone dédié au cinéma. Chaque épisode propose une analyse détaillée d'un film — du blockbuster hollywoodien au film d'auteur, en passant par les classiques et les nanars. Le ton est humoristique, décalé et volontairement de mauvaise foi.

## Contenu du site

- [Tous les épisodes](${SITE_URL}/episodes) : ${episodeCount} épisodes de podcast avec critiques et analyses de films
- [Catalogue des films](${SITE_URL}/films) : ${filmCount} films analysés dans le podcast
- [Les sagas](${SITE_URL}/sagas) : ${sagaCount} sagas cinématographiques couvertes
- [Les personnes](${SITE_URL}/people) : ${personCount} acteurs et réalisateurs référencés
- [Classement](${SITE_URL}/episodes/top) : Les épisodes les mieux notés

## Derniers épisodes

${latestEpisodesMarkdown}

## Sagas couvertes

${sagasMarkdown}

## Écouter le podcast

- [Spotify](${PODCAST_URLS.spotify})
- [Apple Podcasts](${PODCAST_URLS.apple})
- [Deezer](${PODCAST_URLS.deezer})
- [Flux RSS](${PODCAST_URLS.rss})

## Contact

- Email : ${CONTACT_URLS.email.replace("mailto:", "")}
- Instagram : [@${SOCIAL_URLS.instagram1}](${SOCIAL_URLS.instagramBase}${SOCIAL_URLS.instagram1})

## Informations techniques

- Langue : Français (fr-FR)
- Catégorie : Divertissement, Cinéma, Podcast
- Fréquence : Épisodes publiés régulièrement
- Site web : ${SITE_URL}
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
