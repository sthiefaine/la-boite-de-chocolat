import { Metadata } from "next";
import Link from "next/link";
import {
  SITE_URL,
  PODCAST_URLS,
  SOCIAL_URLS,
  CONTACT_URLS,
} from "@/helpers/config";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "À propos | La Boîte de Chocolat",
    description:
      "Découvrez La Boîte de Chocolat, le podcast cinéma francophone animé par Thomas, Charlie et Thomas. Critiques, analyses et débats sur le cinéma avec humour et mauvaise foi.",
    alternates: {
      canonical: `${SITE_URL}/about`,
    },
    openGraph: {
      title: "À propos | La Boîte de Chocolat",
      description:
        "Découvrez La Boîte de Chocolat, le podcast cinéma francophone animé par Thomas, Charlie et Thomas. Critiques, analyses et débats sur le cinéma avec humour et mauvaise foi.",
      type: "website",
      url: `${SITE_URL}/about`,
    },
    twitter: {
      card: "summary_large_image",
      title: "À propos | La Boîte de Chocolat",
      description:
        "Découvrez La Boîte de Chocolat, le podcast cinéma francophone animé par Thomas, Charlie et Thomas. Critiques, analyses et débats sur le cinéma avec humour et mauvaise foi.",
    },
  };
}

async function getStats() {
  const [episodeCount, filmCount, sagaCount] = await Promise.all([
    prisma.podcastEpisode.count(),
    prisma.film.count(),
    prisma.saga.count(),
  ]);
  return { episodeCount, filmCount, sagaCount };
}

export default async function AboutPage() {
  const { episodeCount, filmCount, sagaCount } = await getStats();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "À propos de La Boîte de Chocolat",
    description:
      "Découvrez La Boîte de Chocolat, le podcast cinéma francophone animé par Thomas, Charlie et Thomas.",
    url: `${SITE_URL}/about`,
    mainEntity: {
      "@type": "Organization",
      name: "La Boîte de Chocolat",
      url: SITE_URL,
      description:
        "Podcast francophone dédié au cinéma. Critiques, analyses et débats sur le cinéma avec humour et mauvaise foi.",
      founder: [
        { "@type": "Person", name: "Thomas" },
        { "@type": "Person", name: "Charlie" },
        { "@type": "Person", name: "Thomas" },
      ],
      knowsAbout: [
        "Cinéma",
        "Critique de film",
        "Podcast",
        "Analyse cinématographique",
      ],
      sameAs: [
        `${SOCIAL_URLS.instagramBase}${SOCIAL_URLS.instagram1}`,
        PODCAST_URLS.spotify,
        PODCAST_URLS.apple,
        PODCAST_URLS.deezer,
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 pb-24 pt-[60px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-amber-100 sm:text-5xl md:text-6xl">
          La Boîte de Chocolat
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-amber-200/70">
          Le podcast cinéma avec mauvaise foi, humour et passion.
        </p>
      </section>

      <div className="mx-auto max-w-4xl space-y-16 px-4">
        {/* Qui sommes-nous ? */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-amber-100">
            Qui sommes-nous ?
          </h2>
          <p className="leading-relaxed text-zinc-300">
            La Boîte de Chocolat est un podcast francophone dédié au cinéma.
            Animé par Thomas, Charlie et Thomas, chaque épisode propose une
            analyse détaillée d&apos;un film — du blockbuster hollywoodien au
            film d&apos;auteur, en passant par les classiques et les nanars. Le
            ton est humoristique, décalé et volontairement de mauvaise foi.
          </p>
        </section>

        {/* Notre mission */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-amber-100">
            Notre mission
          </h2>
          <p className="leading-relaxed text-zinc-300">
            Décortiquer le cinéma avec passion et humour. Que vous soyez
            cinéphile averti ou simple amateur de bons films, on vous promet des
            débats enflammés, des avis tranchés et une bonne dose de mauvaise
            foi assumée.
          </p>
        </section>

        {/* Stats */}
        <section>
          <h2 className="mb-6 text-2xl font-semibold text-amber-100">
            En quelques chiffres
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-center">
              <p className="text-3xl font-bold text-amber-200">
                {episodeCount}
              </p>
              <p className="mt-1 text-sm text-zinc-400">épisodes</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-center">
              <p className="text-3xl font-bold text-amber-200">{filmCount}</p>
              <p className="mt-1 text-sm text-zinc-400">films analysés</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-center">
              <p className="text-3xl font-bold text-amber-200">{sagaCount}</p>
              <p className="mt-1 text-sm text-zinc-400">sagas couvertes</p>
            </div>
          </div>
        </section>

        {/* Où nous écouter ? */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-amber-100">
            Où nous écouter ?
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={PODCAST_URLS.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:border-green-500/50 hover:text-green-400"
            >
              Spotify
            </Link>
            <Link
              href={PODCAST_URLS.apple}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:border-purple-500/50 hover:text-purple-400"
            >
              Apple Podcasts
            </Link>
            <Link
              href={PODCAST_URLS.deezer}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:border-pink-500/50 hover:text-pink-400"
            >
              Deezer
            </Link>
            <Link
              href={PODCAST_URLS.rss}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:border-orange-500/50 hover:text-orange-400"
            >
              Flux RSS
            </Link>
          </div>
        </section>

        {/* Nous contacter */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-amber-100">
            Nous contacter
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={CONTACT_URLS.email}
              className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:border-amber-500/50 hover:text-amber-400"
            >
              Email
            </Link>
            <Link
              href={`${SOCIAL_URLS.instagramBase}${SOCIAL_URLS.instagram1}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:border-fuchsia-500/50 hover:text-fuchsia-400"
            >
              Instagram
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
