import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Episode {
  id: string;
  title: string;
  artist: string;
  url: string;
  img: string;
  slug: string;
  age?: string | null;
  movieAge?: string | null;
}

interface QueueStore {
  queue: Episode[];
  currentIndex: number;
  addToQueue: (episode: Episode) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  moveInQueue: (fromIndex: number, toIndex: number) => void;
  setCurrentIndex: (index: number) => void;
  getCurrentEpisode: () => Episode | null;
  getNextEpisode: () => Episode | null;
  getPreviousEpisode: () => Episode | null;
  isQueueEmpty: () => boolean;
  getFirstEpisode: () => Episode | null;
  removeFirstEpisode: () => void;
}

export const useQueueStore = create(
  persist<QueueStore>(
    (set, get) => ({
      queue: [],
      currentIndex: -1,

      addToQueue: (episode: Episode) => {
        set((state) => ({
          queue: [...state.queue, episode],
        }));
      },

      removeFromQueue: (index: number) => {
        set((state) => {
          const newQueue = state.queue.filter((_, i) => i !== index);
          let newCurrentIndex = state.currentIndex;
          if (index < state.currentIndex) {
            newCurrentIndex--;
          } else if (index === state.currentIndex) {
            newCurrentIndex = -1;
          }
          return {
            queue: newQueue,
            currentIndex: newCurrentIndex,
          };
        });
      },

      clearQueue: () => {
        set({
          queue: [],
          currentIndex: -1,
        });
      },

      moveInQueue: (fromIndex: number, toIndex: number) => {
        set((state) => {
          const newQueue = [...state.queue];
          const [movedItem] = newQueue.splice(fromIndex, 1);
          newQueue.splice(toIndex, 0, movedItem);

          let newCurrentIndex = state.currentIndex;
          if (fromIndex === state.currentIndex) {
            newCurrentIndex = toIndex;
          } else if (
            fromIndex < state.currentIndex &&
            toIndex >= state.currentIndex
          ) {
            newCurrentIndex--;
          } else if (
            fromIndex > state.currentIndex &&
            toIndex <= state.currentIndex
          ) {
            newCurrentIndex++;
          }

          return {
            queue: newQueue,
            currentIndex: newCurrentIndex,
          };
        });
      },

      setCurrentIndex: (index: number) => {
        set({ currentIndex: index });
      },

      getCurrentEpisode: () => {
        const { queue, currentIndex } = get();
        return currentIndex >= 0 && currentIndex < queue.length
          ? queue[currentIndex]
          : null;
      },

      getNextEpisode: () => {
        const { queue, currentIndex } = get();
        const nextIndex = currentIndex + 1;
        return nextIndex < queue.length ? queue[nextIndex] : null;
      },

      getPreviousEpisode: () => {
        const { queue, currentIndex } = get();
        const prevIndex = currentIndex - 1;
        return prevIndex >= 0 ? queue[prevIndex] : null;
      },

      isQueueEmpty: () => {
        return get().queue.length === 0;
      },

      getFirstEpisode: () => {
        const { queue } = get();
        return queue.length > 0 ? queue[0] : null;
      },

      removeFirstEpisode: () => {
        set((state) => {
          if (state.queue.length === 0) return state;
          const newQueue = state.queue.slice(1);
          let newCurrentIndex = state.currentIndex;
          if (state.currentIndex > 0) {
            newCurrentIndex--;
          } else if (state.currentIndex === 0) {
            newCurrentIndex = -1;
          }
          return {
            queue: newQueue,
            currentIndex: newCurrentIndex,
          };
        });
      },
    }),
    {
      name: "la-boite-de-chocolat-file-d-attente",
    }
  )
);
