import type { CueFixtureState } from "./cueStore";

import { create } from "zustand";

export type PlaybackStatus =
  | "idle"
  | "playing"
  | "paused";

export type PlaybackSource =
  | "manual"
  | "timeline"
  | null;

type PlaybackStore = {
  /*
   * Cue que actualmente está
   * siendo mostrado en escena.
   */
  liveCueId: number | null;

  /*
   * Cue preparado para ejecutarse
   * cuando se presiona GO.
   */
  nextCueId: number | null;

  /*
   * Estado general del playback.
   */
  status: PlaybackStatus;

  source: PlaybackSource;

  /*
   * Progreso del fade actual.
   *
   * 0 = inicio
   * 1 = final
   */
  progress: number;

  /*
   * Duración temporal del fade.
   *
   * Más adelante este valor
   * vendrá de cada cue.
   */
  fadeDuration: number;

  /* Estado interpolado visible durante un fade. */
  transitionFixtureStates: CueFixtureState[] | null;

  setLiveCue: (
    cueId: number | null
  ) => void;

  setNextCue: (
    cueId: number | null
  ) => void;

  setStatus: (
    status: PlaybackStatus
  ) => void;

  setSource: (
    source: PlaybackSource
  ) => void;

  setProgress: (
    progress: number
  ) => void;

  setFadeDuration: (
    duration: number
  ) => void;

  setTransitionFixtureStates: (
    fixtureStates: CueFixtureState[] | null
  ) => void;

  resetPlayback: () => void;
};

export const usePlaybackStore =
  create<PlaybackStore>((set) => ({
    liveCueId: null,

    nextCueId: null,

    status: "idle",

    source: null,

    progress: 0,

    fadeDuration: 2,

    transitionFixtureStates: null,

    setLiveCue: (cueId) =>
      set({
        liveCueId: cueId,
      }),

    setNextCue: (cueId) =>
      set({
        nextCueId: cueId,
      }),

    setStatus: (status) =>
      set({
        status,
      }),

    setSource: (source) =>
      set({ source }),

    setProgress: (progress) =>
      set({
        progress: Math.max(
          0,
          Math.min(1, progress)
        ),
      }),

    setFadeDuration: (duration) =>
      set({
        fadeDuration: Math.max(
          0,
          duration
        ),
      }),

    setTransitionFixtureStates: (fixtureStates) =>
      set({
        transitionFixtureStates: fixtureStates
          ? fixtureStates.map((fixtureState) => ({
              ...fixtureState,
              position: { ...fixtureState.position },
            }))
          : null,
      }),

    resetPlayback: () =>
      set({
        liveCueId: null,
        nextCueId: null,
        status: "idle",

    source: null,
        progress: 0,
        transitionFixtureStates: null,
      }),
  }));
  