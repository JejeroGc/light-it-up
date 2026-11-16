import { create } from "zustand";

type SaveState = "ready" | "dirty" | "saving" | "saved";

type StatusStore = {
  saveState: SaveState;
  message: string;
  ignoreDirtyUntil: number;
  markDirty: () => void;
  markSaving: () => void;
  markSaved: () => void;
  markReady: () => void;
  setMessage: (message: string) => void;
};

export const useStatusStore = create<StatusStore>((set) => ({
  saveState: "ready",
  message: "Ready",
  ignoreDirtyUntil: Date.now() + 500,
  markDirty: () => set((state) => Date.now() < state.ignoreDirtyUntil
    ? state
    : { ...state, saveState: "dirty", message: "Unsaved changes" }),
  markSaving: () => set({ saveState: "saving", message: "Saving…" }),
  markSaved: () => set({ saveState: "saved", message: "Saved", ignoreDirtyUntil: Date.now() + 300 }),
  markReady: () => set({ saveState: "ready", message: "Ready", ignoreDirtyUntil: Date.now() + 300 }),
  setMessage: (message) => set({ message }),
}));
