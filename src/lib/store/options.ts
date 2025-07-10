import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserOptions {
  skipIntro: boolean;
  introSkipTime: number; // en secondes
}

interface OptionsStore {
  options: UserOptions;
  isLoaded: boolean;
  updateOptions: (newOptions: Partial<UserOptions>) => void;
  getSkipTimeMs: () => number;
  resetOptions: () => void;
}

const defaultOptions: UserOptions = {
  skipIntro: false,
  introSkipTime: 42,
};

export const useOptionsStore = create<OptionsStore>()(
  persist(
    (set, get) => ({
      options: defaultOptions,
      isLoaded: false,

      updateOptions: (newOptions: Partial<UserOptions>) => {
        set((state) => ({
          options: { ...state.options, ...newOptions },
        }));
      },

      getSkipTimeMs: () => {
        const { options } = get();
        const skipTime = options.skipIntro ? options.introSkipTime * 1000 : 0;
        return skipTime;
      },

      resetOptions: () => {
        set({ options: defaultOptions });
      },
    }),
    {
      name: "la-boite-de-chocolat-user-options",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoaded = true;
        }
      },
    }
  )
);
