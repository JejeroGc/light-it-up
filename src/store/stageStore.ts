import { create } from "zustand";
import type { StageBar } from "../core";

type ReplaceStageData = {
  width: number;
  depth: number;
  height: number;
  bars: StageBar[];
};

type StageState = {
  width: number;
  depth: number;
  height: number;

  bars: StageBar[];
  selectedBarId: number | null;

  setWidth: (
    width: number
  ) => void;

  setDepth: (
    depth: number
  ) => void;

  setHeight: (
    height: number
  ) => void;

  addBar: () => void;

  removeBar: (
    id: number
  ) => void;

  updateBar: (
    id: number,
    updates: Partial<StageBar>
  ) => void;

  selectBar: (
    id: number | null
  ) => void;

  /*
   * Reemplaza el escenario completo
   * al abrir un proyecto.
   */
  replaceStage: (
    stage: ReplaceStageData
  ) => void;
};

const cloneBars = (
  bars: StageBar[]
): StageBar[] =>
  bars.map((bar) => ({
    ...bar,
  }));

export const useStageStore =
  create<StageState>((set) => ({
    width: 12,
    depth: 10,
    height: 6,

    selectedBarId: null,

    bars: [
      {
        id: 1,
        name: "LX 1",
        x: 0,
        y: 5.6,
        z: 2,
        width: 12,
      },
      {
        id: 2,
        name: "LX 2",
        x: 0,
        y: 5.6,
        z: -1.5,
        width: 12,
      },
      {
        id: 3,
        name: "LX 3",
        x: 0,
        y: 5.6,
        z: -5,
        width: 12,
      },
    ],

    setWidth: (width) =>
      set((state) => ({
        width,

        bars:
          state.bars.map(
            (bar) => ({
              ...bar,
              width,
            })
          ),
      })),

    setDepth: (depth) =>
      set({
        depth,
      }),

    setHeight: (height) =>
      set((state) => ({
        height,

        bars:
          state.bars.map(
            (bar) => ({
              ...bar,
              y: height - 0.4,
            })
          ),
      })),

    addBar: () =>
      set((state) => {
        const nextId =
          state.bars.length === 0
            ? 1
            : Math.max(
                ...state.bars.map(
                  (bar) => bar.id
                )
              ) + 1;

        return {
          bars: [
            ...state.bars,
            {
              id: nextId,
              name: `LX ${nextId}`,
              x: 0,
              y: state.height - 0.4,
              z:
                -state.depth / 2 +
                1,
              width: state.width,
            },
          ],

          selectedBarId: nextId,
        };
      }),

    removeBar: (id) =>
      set((state) => ({
        bars:
          state.bars.filter(
            (bar) =>
              bar.id !== id
          ),

        selectedBarId:
          state.selectedBarId === id
            ? null
            : state.selectedBarId,
      })),

    updateBar: (
      id,
      updates
    ) =>
      set((state) => ({
        bars:
          state.bars.map(
            (bar) =>
              bar.id === id
                ? {
                    ...bar,
                    ...updates,
                  }
                : bar
          ),
      })),

    selectBar: (id) =>
      set({
        selectedBarId: id,
      }),

    replaceStage: (stage) =>
      set({
        width: stage.width,
        depth: stage.depth,
        height: stage.height,

        bars:
          cloneBars(
            stage.bars
          ),

        /*
         * La selección es temporal
         * y no se restaura.
         */
        selectedBarId: null,
      }),
  }));