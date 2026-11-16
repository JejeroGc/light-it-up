import { create } from "zustand";

export type HistorySnapshot = {
  stage: {
    width: number;
    depth: number;
    height: number;
    bars: any[];
    selectedBarId: number | null;
  };
  lighting: {
    lights: any[];
  };
  programmer: { edits: Record<number, any> };
};

type HistoryStore = {
  snapshots: HistorySnapshot[];
  index: number;
  isApplying: boolean;

  record: (snapshot: HistorySnapshot) => void;
  undo: () => HistorySnapshot | null;
  redo: () => HistorySnapshot | null;
  setApplying: (value: boolean) => void;
};

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  snapshots: [],
  index: -1,
  isApplying: false,

  record: (snapshot) => {
    const { snapshots, index, isApplying } = get();
    if (isApplying) return;

    const last = snapshots[index];

    if (last && JSON.stringify(last) === JSON.stringify(snapshot)) {
      return;
    }

    const nextSnapshots = snapshots.slice(0, index + 1);

    set({
      snapshots: [...nextSnapshots, snapshot].slice(-80),
      index: Math.min(nextSnapshots.length, 79),
    });
  },

  undo: () => {
    const { snapshots, index } = get();

    if (index <= 0) return null;

    const nextIndex = index - 1;

    set({ index: nextIndex });

    return snapshots[nextIndex];
  },

  redo: () => {
    const { snapshots, index } = get();

    if (index >= snapshots.length - 1) return null;

    const nextIndex = index + 1;

    set({ index: nextIndex });

    return snapshots[nextIndex];
  },

  setApplying: (value) => set({ isApplying: value }),
}));