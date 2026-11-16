import { create } from "zustand";

export type CueFixtureState = {
  fixtureId: number;

  /*
   * Ubicación física del foco
   * dentro del escenario.
   */
  position: {
    x: number;
    y: number;
    z: number;
  };

  /*
   * Orientación del foco.
   */
  pan: number;
  tilt: number;

  /*
   * Información visual.
   */
  color: string;
  intensity: number;
  beamAngle: number;
  powered: boolean;

  /*
   * Ubicación en una vara.
   */
  barId: number | null;
  offsetX: number;
  selectedLightOffsetX: number;
};

export type CueTransitionType = "cut" | "linear" | "ease-in" | "ease-out" | "ease-in-out";
export type CueEffectType = "none" | "strobe" | "pulse" | "chase" | "flicker" | "color-chase";
export type CueTransitionEffectLayer = { type: Exclude<CueEffectType, "none">; speed: number; amount: number };

export type Cue = {
  id: number;
  number: number;
  name: string;

  /*
   * Duración de la transición
   * y espera previa.
   */
  fadeDuration: number;
  delay: number;

  /* Playback design for the transition INTO this cue. Optional so old .lightitup files remain compatible. */
  transitionType?: CueTransitionType;
  transitionEffect?: CueEffectType;
  transitionEffectSpeed?: number;
  transitionEffectAmount?: number;
  transitionEffects?: CueTransitionEffectLayer[];

  /*
   * Momento en el que la Cue
   * se ejecuta dentro del Timeline.
   *
   * El valor se expresa en segundos.
   */
  timelineTime: number;

  fixtureStates: CueFixtureState[];
};

type ReplaceCuesData = {
  cues: Cue[];
  activeCueId: number | null;
};

type CueStore = {
  cues: Cue[];

  /*
   * Cue que actualmente está
   * cargada en el escenario.
   */
  activeCueId: number | null;

  /*
   * Reemplaza todas las Cues
   * al abrir un proyecto.
   */
  replaceCues: (
    data: ReplaceCuesData
  ) => void;

  createCue: (
    name: string,
    fixtureStates: CueFixtureState[]
  ) => number | null;

  updateCue: (
    id: number,
    fixtureStates: CueFixtureState[]
  ) => void;

  renameCue: (
    id: number,
    name: string
  ) => void;

  removeCue: (
    id: number
  ) => void;

  setActiveCue: (
    id: number | null
  ) => void;

  setCueFadeDuration: (
    id: number,
    duration: number
  ) => void;

  setCueDelay: (
    id: number,
    delay: number
  ) => void;

  setCueTransitionType: (id: number, transitionType: CueTransitionType) => void;
  setCueTransitionEffect: (id: number, transitionEffect: CueEffectType) => void;
  setCueTransitionEffectSpeed: (id: number, speed: number) => void;
  setCueTransitionEffectAmount: (id: number, amount: number) => void;
  setCueTransitionEffects: (id: number, effects: CueTransitionEffectLayer[]) => void;

  setCueTimelineTime: (
    id: number,
    timelineTime: number
  ) => void;

  getActiveCueIndex: () => number;

  getNextCue: () => Cue | null;

  getPreviousCue: () => Cue | null;
};

const cloneFixtureStates = (
  fixtureStates: CueFixtureState[]
): CueFixtureState[] =>
  fixtureStates.map(
    (fixtureState) => ({
      ...fixtureState,

      position: {
        ...fixtureState.position,
      },
    })
  );

const cloneCue = (
  cue: Cue
): Cue => ({
  ...cue,

  fixtureStates:
    cloneFixtureStates(
      cue.fixtureStates
    ),
});

const getNextCueId = (
  cues: Cue[]
) =>
  cues.length > 0
    ? Math.max(
        ...cues.map(
          (cue) =>
            cue.id
        )
      ) + 1
    : 1;

const getNextCueNumber = (
  cues: Cue[]
) =>
  cues.length > 0
    ? Math.max(
        ...cues.map(
          (cue) =>
            cue.number
        )
      ) + 1
    : 1;

/*
 * Coloca cada Cue nueva diez
 * segundos después de la última.
 */
const getNextTimelineTime = (
  cues: Cue[]
) => {
  if (cues.length === 0) {
    return 0;
  }

  const latestTimelineTime =
    Math.max(
      ...cues.map(
        (cue) =>
          cue.timelineTime ?? 0
      )
    );

  return latestTimelineTime + 10;
};

export const useCueStore =
  create<CueStore>((set, get) => ({
    cues: [],

    activeCueId: null,

    replaceCues: (
      data
    ) => {
      const clonedCues =
        data.cues.map(
          cloneCue
        );

      const activeCueExists =
        data.activeCueId !== null &&
        clonedCues.some(
          (cue) =>
            cue.id ===
            data.activeCueId
        );

      set({
        cues: clonedCues,

        activeCueId:
          activeCueExists
            ? data.activeCueId
            : null,
      });
    },

    createCue: (
      name,
      fixtureStates
    ) => {
      const trimmedName =
        name.trim();

      if (
        !trimmedName ||
        fixtureStates.length === 0
      ) {
        return null;
      }

      const currentCues =
        get().cues;

      const cue: Cue = {
        id:
          getNextCueId(
            currentCues
          ),

        number:
          getNextCueNumber(
            currentCues
          ),

        name:
          trimmedName,

        fadeDuration: 2,
        delay: 0,
        transitionType: "linear",
        transitionEffect: "none",
        transitionEffectSpeed: 8,
        transitionEffectAmount: 0.85,

        timelineTime:
          getNextTimelineTime(
            currentCues
          ),

        fixtureStates:
          cloneFixtureStates(
            fixtureStates
          ),
      };

      set((state) => ({
        cues: [
          ...state.cues,
          cue,
        ],
      }));

      return cue.id;
    },

    updateCue: (
      id,
      fixtureStates
    ) =>
      set((state) => ({
        cues:
          state.cues.map(
            (cue) =>
              cue.id === id
                ? {
                    ...cue,

                    fixtureStates:
                      cloneFixtureStates(
                        fixtureStates
                      ),
                  }
                : cue
          ),
      })),

    renameCue: (
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
          cues:
            state.cues.map(
              (cue) =>
                cue.id === id
                  ? {
                      ...cue,

                      name:
                        trimmedName,
                    }
                  : cue
            ),
        };
      }),

    removeCue: (
      id
    ) =>
      set((state) => {
        const removedCueIndex =
          state.cues.findIndex(
            (cue) =>
              cue.id === id
          );

        const remainingCues =
          state.cues.filter(
            (cue) =>
              cue.id !== id
          );

        if (
          state.activeCueId !== id
        ) {
          return {
            cues:
              remainingCues,
          };
        }

        const fallbackCue =
          remainingCues[
            Math.min(
              removedCueIndex,
              remainingCues.length - 1
            )
          ];

        return {
          cues:
            remainingCues,

          activeCueId:
            fallbackCue?.id ??
            null,
        };
      }),

    setActiveCue: (
      id
    ) =>
      set((state) => {
        if (id === null) {
          return {
            activeCueId:
              null,
          };
        }

        const cueExists =
          state.cues.some(
            (cue) =>
              cue.id === id
          );

        if (!cueExists) {
          return state;
        }

        return {
          activeCueId:
            id,
        };
      }),

    setCueFadeDuration: (
      id,
      duration
    ) =>
      set((state) => ({
        cues:
          state.cues.map(
            (cue) =>
              cue.id === id
                ? {
                    ...cue,

                    fadeDuration:
                      Math.max(
                        0,
                        duration
                      ),
                  }
                : cue
          ),
      })),

    setCueDelay: (
      id,
      delay
    ) =>
      set((state) => ({
        cues:
          state.cues.map(
            (cue) =>
              cue.id === id
                ? {
                    ...cue,

                    delay:
                      Math.max(
                        0,
                        delay
                      ),
                  }
                : cue
          ),
      })),

    setCueTransitionType: (id, transitionType) => set((state) => ({
      cues: state.cues.map((cue) => cue.id === id ? { ...cue, transitionType } : cue),
    })),

    setCueTransitionEffect: (id, transitionEffect) => set((state) => ({
      cues: state.cues.map((cue) => cue.id === id ? { ...cue, transitionEffect } : cue),
    })),

    setCueTransitionEffectSpeed: (id, speed) => set((state) => ({
      cues: state.cues.map((cue) => cue.id === id ? { ...cue, transitionEffectSpeed: Math.max(0.1, Math.min(20, speed)) } : cue),
    })),

    setCueTransitionEffectAmount: (id, amount) => set((state) => ({
      cues: state.cues.map((cue) => cue.id === id ? { ...cue, transitionEffectAmount: Math.max(0, Math.min(1, amount)) } : cue),
    })),

    setCueTransitionEffects: (id, effects) => set((state) => ({
      cues: state.cues.map((cue) => cue.id === id ? { ...cue, transitionEffects: effects.map((effect) => ({ ...effect, speed: Math.max(0.1, Math.min(20, effect.speed)), amount: Math.max(0, Math.min(1, effect.amount)) })) } : cue),
    })),

    setCueTimelineTime: (
      id,
      timelineTime
    ) =>
      set((state) => ({
        cues:
          state.cues.map(
            (cue) =>
              cue.id === id
                ? {
                    ...cue,

                    timelineTime:
                      Math.max(
                        0,
                        timelineTime
                      ),
                  }
                : cue
          ),
      })),

    getActiveCueIndex: () => {
      const {
        cues,
        activeCueId,
      } = get();

      if (
        activeCueId === null
      ) {
        return -1;
      }

      return cues.findIndex(
        (cue) =>
          cue.id ===
          activeCueId
      );
    },

    getNextCue: () => {
      const {
        cues,
        activeCueId,
      } = get();

      if (
        cues.length === 0
      ) {
        return null;
      }

      if (
        activeCueId === null
      ) {
        return (
          cues[0] ??
          null
        );
      }

      const activeIndex =
        cues.findIndex(
          (cue) =>
            cue.id ===
            activeCueId
        );

      if (
        activeIndex === -1
      ) {
        return (
          cues[0] ??
          null
        );
      }

      return (
        cues[
          activeIndex + 1
        ] ?? null
      );
    },

    getPreviousCue: () => {
      const {
        cues,
        activeCueId,
      } = get();

      if (
        cues.length === 0 ||
        activeCueId === null
      ) {
        return null;
      }

      const activeIndex =
        cues.findIndex(
          (cue) =>
            cue.id ===
            activeCueId
        );

      if (
        activeIndex <= 0
      ) {
        return null;
      }

      return (
        cues[
          activeIndex - 1
        ] ?? null
      );
    },
  }));