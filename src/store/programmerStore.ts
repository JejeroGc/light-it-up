import { create } from "zustand";

export type ProgrammerValues = {
  color?: string;
  intensity?: number;

  pan?: number;
  tilt?: number;

  beamAngle?: number;

  position?: {
    x: number;
    y: number;
    z: number;
  };

  powered?: boolean;
  barId?: number | null;
  offsetX?: number;
  selectedLightOffsetX?: number;
};

type ProgrammerStore = {
  edits: Record<number, ProgrammerValues>;

  setColor: (
    fixtureId: number,
    color: string
  ) => void;

  setIntensity: (
    fixtureId: number,
    intensity: number
  ) => void;

  setPan: (
    fixtureId: number,
    pan: number
  ) => void;

  setTilt: (
    fixtureId: number,
    tilt: number
  ) => void;

  setBeamAngle: (
    fixtureId: number,
    angle: number
  ) => void;

  setPosition: (
    fixtureId: number,
    position: {
      x: number;
      y: number;
      z: number;
    }
  ) => void;

  setPower: (
    fixtureId: number,
    powered: boolean
  ) => void;

  setAttachment: (
    fixtureId: number,
    barId: number | null,
    offsetX?: number
  ) => void;

  clearFixture: (
    fixtureId: number
  ) => void;

  clearProgrammer: () => void;

  /*
   * Limpia los parámetros propios de una Cue (color, intensidad,
   * pan/tilt, beam y power), pero conserva la ubicación física del
   * fixture y su vínculo con la vara. Esto evita que cargar una Cue
   * desarme el rig cuando la posición todavía vive en Programmer.
   */
  clearCueParameters: () => void;

  hasOverrides: (
    fixtureId: number
  ) => boolean;

  getValues: (
    fixtureId: number
  ) => ProgrammerValues | undefined;
};

export const useProgrammerStore =
create<ProgrammerStore>((set, get) => ({

  edits: {},

  setColor: (fixtureId, color) =>
    set((state) => ({
      edits: {
        ...state.edits,
        [fixtureId]: {
          ...state.edits[fixtureId],
          color,
        },
      },
    })),

  setIntensity: (fixtureId, intensity) =>
    set((state) => ({
      edits: {
        ...state.edits,
        [fixtureId]: {
          ...state.edits[fixtureId],
          intensity,
        },
      },
    })),

  setPan: (fixtureId, pan) =>
    set((state) => ({
      edits: {
        ...state.edits,
        [fixtureId]: {
          ...state.edits[fixtureId],
          pan,
        },
      },
    })),

  setTilt: (fixtureId, tilt) =>
    set((state) => ({
      edits: {
        ...state.edits,
        [fixtureId]: {
          ...state.edits[fixtureId],
          tilt,
        },
      },
    })),

  setBeamAngle: (fixtureId, beamAngle) =>
    set((state) => ({
      edits: {
        ...state.edits,
        [fixtureId]: {
          ...state.edits[fixtureId],
          beamAngle,
        },
      },
    })),

  setPosition: (fixtureId, position) =>
    set((state) => ({
      edits: {
        ...state.edits,
        [fixtureId]: {
          ...state.edits[fixtureId],
          position,
        },
      },
    })),

  setPower: (fixtureId, powered) =>
    set((state) => ({
      edits: {
        ...state.edits,
        [fixtureId]: {
          ...state.edits[fixtureId],
          powered,
        },
      },
    })),

  setAttachment: (fixtureId, barId, offsetX = 0) =>
    set((state) => ({
      edits: {
        ...state.edits,
        [fixtureId]: {
          ...state.edits[fixtureId],
          barId,
          offsetX,
          selectedLightOffsetX: offsetX,
        },
      },
    })),

  clearFixture: (fixtureId) =>
    set((state) => {
      const edits = { ...state.edits };
      delete edits[fixtureId];

      return { edits };
    }),

  clearProgrammer: () =>
    set({
      edits: {},
    }),

  clearCueParameters: () =>
    set((state) => {
      const nextEdits: Record<number, ProgrammerValues> = {};

      for (const [fixtureId, values] of Object.entries(state.edits)) {
        const rigValues: ProgrammerValues = {};

        if (values.position !== undefined) {
          rigValues.position = { ...values.position };
        }
        if (values.barId !== undefined) {
          rigValues.barId = values.barId;
        }
        if (values.offsetX !== undefined) {
          rigValues.offsetX = values.offsetX;
        }
        if (values.selectedLightOffsetX !== undefined) {
          rigValues.selectedLightOffsetX = values.selectedLightOffsetX;
        }

        if (Object.keys(rigValues).length > 0) {
          nextEdits[Number(fixtureId)] = rigValues;
        }
      }

      return { edits: nextEdits };
    }),

  hasOverrides: (fixtureId) =>
    get().edits[fixtureId] !== undefined,

  getValues: (fixtureId) =>
    get().edits[fixtureId],

}));