import { prisma } from '@/lib/prisma';
import PodcastListClient from './PodcastListClient';

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  pubDate: Date;
  audioUrl: string;
  links: {
    id: string;
    film: {
      id: string;
      title: string;
      year: number | null;
    };
  }[];
}

async function getPodcastEpisodes(nameId: string): Promise<PodcastEpisode[]> {
  const rssFeed = await prisma.rssFeed.findUnique({
    where: { nameId: nameId }
  });

  if (!rssFeed) {
    return [];
  }

  const episodes = await prisma.podcastEpisode.findMany({
    where: { rssFeedId: rssFeed.id },
    orderBy: { pubDate: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      pubDate: true,
      audioUrl: true,
      links: {
        select: {
          id: true,
          film: {
            select: {
              id: true,
              title: true,
              year: true,
            }
          }
        }
      }
    }
  });

  return episodes;
}

interface PageProps {
  params: {
    'name-id': string;
  };
  searchParams: {
    showLinked?: string;
  };
}

export default async function AdminPodcastList({ params, searchParams }: PageProps) {
  const allEpisodes = await getPodcastEpisodes(params['name-id']);
  
  // Filtrer les épisodes selon le paramètre showLinked
  const showLinked = searchParams.showLinked === 'true';
  const episodes = showLinked 
    ? allEpisodes 
    : allEpisodes.filter(episode => episode.links.length === 0);

  const linkedCount = allEpisodes.filter(episode => episode.links.length > 0).length;
  const unlinkedCount = allEpisodes.filter(episode => episode.links.length === 0).length;

  return (
    <PodcastListClient
      episodes={episodes}
      nameId={params['name-id']}
      showLinked={showLinked}
      linkedCount={linkedCount}
      unlinkedCount={unlinkedCount}
    />
  );
} 