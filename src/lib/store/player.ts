import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useQueueStore } from "./queue";
import type { SpeakerSegment } from "@/helpers/transcriptionHelpers";

type EpisodeInfo = {
  id: string;
  artist: string;
  title: string;
  url: string;
  img: string;
  slug: string;
  year?: number | null;
  age?: string | null;
};

// Segments tagués par épisode : le visualiseur ne doit colorer le waveform
// que si les segments appartiennent à l'épisode en cours de lecture.
type TaggedSpeakerSegments = {
  episodeId: string;
  segments: SpeakerSegment[];
};

type PlayerState = {
  isPlaying: boolean;
  launchPlay: boolean;
  currentPlayTime: number;
  episode: EpisodeInfo | null;
  totalDuration: number;
  isMinimized: boolean;
  speakerSegments: TaggedSpeakerSegments | null;
};

export type PlayerActions = {
  setIsPlaying: (isPlaying: boolean) => void;
  setLaunchPlay: (launchPlay: boolean) => void;
  setEpisode: (episode: EpisodeInfo) => void;
  setCurrentPlayTime: (currentPlayTime: number) => void;
  setTotalDuration: (totalDuration: number) => void;
  setClearPlayerStore: () => void;
  setIsMinimized: (isMinimized: boolean) => void;
  playNext: () => void;
  playPrevious: () => void;
  setRandomEpisode: (episode: EpisodeInfo) => void;
  setSpeakerSegments: (tagged: TaggedSpeakerSegments | null) => void;
};

export type PlayerStore = PlayerState & PlayerActions;

export const defaultInitState: PlayerState = {
  isPlaying: false,
  launchPlay: false,
  currentPlayTime: 0,
  totalDuration: 0,
  episode: null,
  isMinimized: false,
  speakerSegments: null,
};

export const usePlayerStore = create(
  persist(
    (set, get) => ({
      ...defaultInitState,
      setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
      setEpisode: (episode: EpisodeInfo) => {
        set({ episode });
        const queueStore = useQueueStore.getState();
        const queueIndex = queueStore.queue.findIndex(item => item.id === episode.id);
        if (queueIndex !== -1) {
          queueStore.setCurrentIndex(queueIndex);
        }
      },
      setRandomEpisode: (episode: EpisodeInfo) => {
        set({ isPlaying: false });
        set({ currentPlayTime: 0 });
        set({ episode });
        set({ launchPlay: true });
        set({ isPlaying: true });
      },
      setLaunchPlay: (launchPlay: boolean) => set({ launchPlay }),
      setCurrentPlayTime: (currentPlayTime: number) => set({ currentPlayTime }),
      setTotalDuration: (totalDuration: number) => set({ totalDuration }),
      setIsMinimized: (isMinimized: boolean) => set({ isMinimized }),
      setSpeakerSegments: (tagged: TaggedSpeakerSegments | null) => set({ speakerSegments: tagged }),
      setClearPlayerStore: () => set(defaultInitState),
      playNext: () => {
        const queueStore = useQueueStore.getState();
        const nextEpisode = queueStore.getNextEpisode();
        if (nextEpisode) {
          set({ episode: nextEpisode, isPlaying: true });
          queueStore.setCurrentIndex(queueStore.currentIndex + 1);
        }
      },
      playPrevious: () => {
        const queueStore = useQueueStore.getState();
        const previousEpisode = queueStore.getPreviousEpisode();
        if (previousEpisode) {
          set({ episode: previousEpisode, isPlaying: true });
          queueStore.setCurrentIndex(queueStore.currentIndex - 1);
        }
      },
    }),
    {
      name: "la-boite-de-chocolat-player",
      partialize: (state: PlayerStore) => ({
        isPlaying: false,
        episode: state.episode ? { ...state.episode } : null,
        currentPlayTime: state.currentPlayTime,
        totalDuration: state.totalDuration,
        isMinimized: state.isMinimized,
      }),
    }
  )
);
