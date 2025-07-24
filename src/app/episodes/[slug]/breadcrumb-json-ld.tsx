"use server";
import { SITE_URL } from "@/helpers/config";

interface BreadcrumbJsonLdProps {
  episodeTitle: string;
  episodeSlug: string;
  filmTitle?: string;
}

export async function BreadcrumbJsonLd({
  episodeTitle,
  episodeSlug,
  filmTitle,
}: BreadcrumbJsonLdProps) {
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Accueil",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Épisodes",
      item: `${SITE_URL}/episodes`,
    },
  ];

  if (filmTitle) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 3,
      name: filmTitle,
      item: `${SITE_URL}/episodes/${episodeSlug}`,
    });
  } else {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 3,
      name: episodeTitle,
      item: `${SITE_URL}/episodes/${episodeSlug}`,
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  );
}
