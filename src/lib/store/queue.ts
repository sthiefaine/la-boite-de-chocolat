import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Podcast {
  id: string;
  title: string;
  artist: string;
  url: string;
  img: string;
  slug: string;
}

interface QueueStore {
  queue: Podcast[];
  currentIndex: number;
  addToQueue: (podcast: Podcast) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  moveInQueue: (fromIndex: number, toIndex: number) => void;
  setCurrentIndex: (index: number) => void;
  getCurrentPodcast: () => Podcast | null;
  getNextPodcast: () => Podcast | null;
  getPreviousPodcast: () => Podcast | null;
  isQueueEmpty: () => boolean;
}

export const useQueueStore = create(
  persist<QueueStore>(
    (set, get) => ({
      queue: [],
      currentIndex: -1,

      addToQueue: (podcast: Podcast) => {
        set((state) => ({
          queue: [...state.queue, podcast],
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

      getCurrentPodcast: () => {
        const { queue, currentIndex } = get();
        return currentIndex >= 0 && currentIndex < queue.length
          ? queue[currentIndex]
          : null;
      },

      getNextPodcast: () => {
        const { queue, currentIndex } = get();
        const nextIndex = currentIndex + 1;
        return nextIndex < queue.length ? queue[nextIndex] : null;
      },

      getPreviousPodcast: () => {
        const { queue, currentIndex } = get();
        const prevIndex = currentIndex - 1;
        return prevIndex >= 0 ? queue[prevIndex] : null;
      },

      isQueueEmpty: () => {
        return get().queue.length === 0;
      },
    }),
    {
      name: "la-boite-de-chocolat-file-d-attente",
    }
  )
);
