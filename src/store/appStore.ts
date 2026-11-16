import { create } from "zustand";

export type AppScreen = "launcher" | "editor";

type AppStore = {
  currentScreen: AppScreen;
  tutorialOpen: boolean;

  openLauncher: () => void;
  openEditor: (withTutorial?: boolean) => void;
  openTutorial: () => void;
  closeTutorial: () => void;
};

export const useAppStore = create<AppStore>((set) => ({
  currentScreen: "launcher",
  tutorialOpen: false,

  openLauncher: () =>
    set({
      currentScreen: "launcher",
      tutorialOpen: false,
    }),

  openEditor: (withTutorial = false) =>
    set({
      currentScreen: "editor",
      tutorialOpen: withTutorial,
    }),

  openTutorial: () =>
    set({
      currentScreen: "editor",
      tutorialOpen: true,
    }),

  closeTutorial: () =>
    set({ tutorialOpen: false }),
}));
