import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useQueueStore } from "./queue";

type PodcastInfo = {
  id: string;
  artist: string;
  title: string;
  url: string;
  img: string;
  slug: string;
  year?: number | null;
};

type PlayerState = {
  isPlaying: boolean;
  launchPlay: boolean;
  currentPlayTime: number;
  podcast: PodcastInfo | null;
  totalDuration: number;
  isMinimized: boolean;
};

export type PlayerActions = {
  setIsPlaying: (isPlaying: boolean) => void;
  setLaunchPlay: (launchPlay: boolean) => void;
  setPodcast: (podcast: PodcastInfo) => void;
  setCurrentPlayTime: (currentPlayTime: number) => void;
  setTotalDuration: (totalDuration: number) => void;
  setClearPlayerStore: () => void;
  setIsMinimized: (isMinimized: boolean) => void;
  playNext: () => void;
  playPrevious: () => void;
};

export type PlayerStore = PlayerState & PlayerActions;

export const defaultInitState: PlayerState = {
  isPlaying: false,
  launchPlay: false,
  currentPlayTime: 0,
  totalDuration: 0,
  podcast: null,
  isMinimized: false
};

export const usePlayerStore = create(
  persist(
    (set, get) => ({
      ...defaultInitState,
      setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
      setPodcast: (podcast: PodcastInfo) => {
        set({ podcast });
        const queueStore = useQueueStore.getState();
        const queueIndex = queueStore.queue.findIndex(item => item.id === podcast.id);
        if (queueIndex !== -1) {
          queueStore.setCurrentIndex(queueIndex);
        }
      },
      setLaunchPlay: (launchPlay: boolean) => set({ launchPlay }),
      setCurrentPlayTime: (currentPlayTime: number) => set({ currentPlayTime }),
      setTotalDuration: (totalDuration: number) => set({ totalDuration }),
      setIsMinimized: (isMinimized: boolean) => set({ isMinimized }),
      setClearPlayerStore: () => set(defaultInitState),
      playNext: () => {
        const queueStore = useQueueStore.getState();
        const nextPodcast = queueStore.getNextPodcast();
        if (nextPodcast) {
          set({ podcast: nextPodcast, isPlaying: true });
          queueStore.setCurrentIndex(queueStore.currentIndex + 1);
        }
      },
      playPrevious: () => {
        const queueStore = useQueueStore.getState();
        const previousPodcast = queueStore.getPreviousPodcast();
        if (previousPodcast) {
          set({ podcast: previousPodcast, isPlaying: true });
          queueStore.setCurrentIndex(queueStore.currentIndex - 1);
        }
      },
    }),
    {
      name: "la-boite-de-chocolat-player",
      partialize: (state: PlayerStore) => ({
        podcast: state.podcast ? { ...state.podcast } : null,
        currentPlayTime: state.currentPlayTime,
        totalDuration: state.totalDuration,
        isMinimized: state.isMinimized,
      }),
    }
  )
);
