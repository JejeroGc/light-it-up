import { create } from "zustand";

export type TimelinePlaybackStatus =
  | "stopped"
  | "playing"
  | "paused";

type ReplaceTimelineData = {
  duration: number;
  zoom: number;
};

type TimelineStore = {
  currentTime: number;
  duration: number;
  status: TimelinePlaybackStatus;
  zoom: number;

  /*
   * Restaura la configuración
   * persistente del Timeline.
   *
   * currentTime y status no se cargan
   * porque son estados temporales
   * de reproducción.
   */
  replaceTimeline: (
    timeline: ReplaceTimelineData
  ) => void;

  setCurrentTime: (
    time: number
  ) => void;

  setDuration: (
    duration: number
  ) => void;

  setStatus: (
    status: TimelinePlaybackStatus
  ) => void;

  setZoom: (
    zoom: number
  ) => void;

  resetTimeline: () => void;
};

const clampZoom = (
  zoom: number
) =>
  Math.max(
    8,
    Math.min(
      80,
      zoom
    )
  );

export const useTimelineStore =
  create<TimelineStore>((set) => ({
    currentTime: 0,
    duration: 30,
    status: "stopped",
    zoom: 24,

    replaceTimeline: (
      timeline
    ) =>
      set({
        duration:
          Math.max(
            1,
            timeline.duration
          ),

        zoom:
          clampZoom(
            timeline.zoom
          ),

        /*
         * Estos valores son temporales.
         * Cada proyecto se abre detenido
         * y desde el comienzo.
         */
        currentTime: 0,
        status: "stopped",
      }),

    setCurrentTime: (
      time
    ) =>
      set({
        currentTime:
          Math.max(
            0,
            time
          ),
      }),

    setDuration: (
      duration
    ) =>
      set({
        duration:
          Math.max(
            1,
            duration
          ),
      }),

    setStatus: (
      status
    ) =>
      set({
        status,
      }),

    setZoom: (
      zoom
    ) =>
      set({
        zoom:
          clampZoom(
            zoom
          ),
      }),

    resetTimeline: () =>
      set({
        currentTime: 0,
        status: "stopped",
      }),
  }));