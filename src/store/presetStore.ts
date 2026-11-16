import { create } from "zustand";

export type PresetType =
  | "color"
  | "intensity"
  | "beam"
  | "position";

type BasePreset = {
  id: number;
  name: string;
};

export type ColorPreset =
  BasePreset & {
    type: "color";
    color: string;
  };

export type BeamPreset =
  BasePreset & {
    type: "beam";
    beamAngle: number;
  };

export type PositionPreset =
  BasePreset & {
    type: "position";
    pan: number;
    tilt: number;
    fixtureValues?: Record<number, { pan: number; tilt: number }>;
  };

export type Preset =
  | ColorPreset
  | BeamPreset
  | PositionPreset;

type PresetStore = {
  presets: Preset[];

  /*
   * Reemplaza todos los presets
   * al abrir un proyecto.
   */
  replacePresets: (
    presets: Preset[]
  ) => void;

  createColorPreset: (
    name: string,
    color: string
  ) => void;

  createBeamPreset: (
    name: string,
    beamAngle: number
  ) => void;

  createPositionPreset: (
    name: string,
    pan: number,
    tilt: number,
    fixtureValues?: Record<number, { pan: number; tilt: number }>
  ) => void;

  renamePreset: (
    id: number,
    name: string
  ) => void;

  removePreset: (
    id: number
  ) => void;
};

const getNextPresetId = (
  presets: Preset[]
) =>
  presets.length > 0
    ? Math.max(
        ...presets.map(
          (preset) =>
            preset.id
        )
      ) + 1
    : 1;

const clonePreset = (
  preset: Preset
): Preset => {
  if (
    preset.type ===
    "color"
  ) {
    return {
      ...preset,
    };
  }

  if (
    preset.type ===
    "beam"
  ) {
    return {
      ...preset,
    };
  }

  return {
    ...preset,
  };
};

export const usePresetStore =
  create<PresetStore>((set) => ({
    presets: [],

    replacePresets: (
      presets
    ) =>
      set({
        presets:
          presets.map(
            clonePreset
          ),
      }),

    createColorPreset: (
      name,
      color
    ) =>
      set((state) => {
        const trimmedName =
          name.trim();

        if (!trimmedName) {
          return state;
        }

        const newPreset:
          ColorPreset = {
            id:
              getNextPresetId(
                state.presets
              ),

            name:
              trimmedName,

            type:
              "color",

            color,
          };

        return {
          presets: [
            ...state.presets,
            newPreset,
          ],
        };
      }),

    createBeamPreset: (
      name,
      beamAngle
    ) =>
      set((state) => {
        const trimmedName =
          name.trim();

        if (!trimmedName) {
          return state;
        }

        const newPreset:
          BeamPreset = {
            id:
              getNextPresetId(
                state.presets
              ),

            name:
              trimmedName,

            type:
              "beam",

            beamAngle,
          };

        return {
          presets: [
            ...state.presets,
            newPreset,
          ],
        };
      }),

    createPositionPreset: (
      name,
      pan,
      tilt,
      fixtureValues
    ) =>
      set((state) => {
        const trimmedName =
          name.trim();

        if (!trimmedName) {
          return state;
        }

        const newPreset:
          PositionPreset = {
            id:
              getNextPresetId(
                state.presets
              ),

            name:
              trimmedName,

            type:
              "position",

            pan,
            tilt,

            fixtureValues: fixtureValues
              ? Object.fromEntries(
                  Object.entries(fixtureValues).map(([id, values]) => [id, { ...values }])
                )
              : undefined,
          };

        return {
          presets: [
            ...state.presets,
            newPreset,
          ],
        };
      }),

    renamePreset: (
      id,
      name
    ) =>
      set((state) => {
        const trimmedName =
          name.trim();

        if (!trimmedName) {
          return state;
        }

        return {
          presets:
            state.presets.map(
              (preset) =>
                preset.id ===
                id
                  ? {
                      ...preset,

                      name:
                        trimmedName,
                    }
                  : preset
            ),
        };
      }),

    removePreset: (
      id
    ) =>
      set((state) => ({
        presets:
          state.presets.filter(
            (preset) =>
              preset.id !==
              id
          ),
      })),
  }));