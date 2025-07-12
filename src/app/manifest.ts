import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "La Boîte de Chocolat",
    short_name: "La Boîte de Chocolat",
    description:
      "La Boîte de Chocolat, c'est un podcast présenté par Thomas, Charlie ainsi qu'un autre Thomas (oui en effet, nous pouvons convenir que le prénom Thomas n'aura pas la palme de l'originalité, mais c'est toujours mieux qu'Herpès) il y aura également différents invités selon les épisodes histoire de varier les plaisirs. Les épisodes ça parle de quoi ? Et bien ça va parler cinema - ou cinoche si tu es un boomer - avec légèreté, humour et second degré... pis aussi parfois de façon graveleuse. En effet notre recette est assez simple : du cinema, de la mauvaise foi, un soupçon de beauferie et le tour est joué ! Installe toi confortablement, nous on s'occupe du reste.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF",
    theme_color: "#FFF",
    icons: [
      {
        src: "/images/icons/favicon.ico",
        sizes: "192x192",
        type: "image/x-icon",
      },
    ],
  };
}
