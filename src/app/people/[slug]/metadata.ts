import { Metadata } from "next";
import { getPersonBySlug } from "@/app/actions/person";
import { SITE_URL } from "@/helpers/config";

interface PersonPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PersonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPersonBySlug(slug);

  if (!result.success || !result.person) {
    return {
      title: "Personne non trouvée | La Boîte de Chocolat",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { person } = result;
  const directedCount = person.directedFilms.length;
  const actedCount = person.actedFilms.length;

  const description = `Découvrez ${person.name} sur La Boîte de Chocolat. ${
    directedCount > 0
      ? `${directedCount} film${directedCount > 1 ? "s" : ""} en tant que réalisateur.`
      : ""
  } ${
    actedCount > 0
      ? `${actedCount} film${actedCount > 1 ? "s" : ""} en tant qu'acteur.`
      : ""
  }`.trim();

  const canonicalUrl = `${SITE_URL}/people/${slug}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: `${person.name} | La Boîte de Chocolat`,
    description: description.slice(0, 155),
    keywords: [
      person.name,
      "cinéma",
      "films",
      "réalisateur",
      "acteur",
      "La Boîte de Chocolat",
      "podcast",
    ].join(", "),
    authors: [{ name: "La Boîte de Chocolat" }],
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: `${person.name} | La Boîte de Chocolat`,
      description,
      type: "profile",
      url: canonicalUrl,
      siteName: "La Boîte de Chocolat",
      images: person.photoFileName
        ? [
            {
              url: `https://uploadfiles.clairdev.com/api/display/podcasts/people/${person.photoFileName}`,
              width: 400,
              height: 400,
              alt: person.name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary",
      title: `${person.name} | La Boîte de Chocolat`,
      description,
      images: person.photoFileName
        ? [
            `https://uploadfiles.clairdev.com/api/display/podcasts/people/${person.photoFileName}`,
          ]
        : [],
    },
  };
}
