import type {
  CueFixtureState,
} from "../../store/cueStore";

import {
  clamp,
  lerp,
  lerpHexColor,
} from "./Interpolation";

export type PlaybackFrame = {
  progress: number;

  fixtureStates:
    CueFixtureState[];
};

type PlaybackCallbacks = {
  onStart?: () => void;

  onFrame: (
    frame: PlaybackFrame
  ) => void;

  onComplete?: () => void;

  onCancel?: () => void;
};

type PlaybackOptions = {
  from:
    CueFixtureState[];

  to:
    CueFixtureState[];

  duration: number;

  delay?: number;

  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";

  callbacks:
    PlaybackCallbacks;
};

type PlaybackPhase =
  | "idle"
  | "delay"
  | "playing"
  | "paused-delay"
  | "paused-playing";

export class PlaybackEngine {
  private animationFrameId:
    number | null = null;

  private delayTimeoutId:
    number | null = null;

  private phase:
    PlaybackPhase = "idle";

  private from:
    CueFixtureState[] = [];

  private to:
    CueFixtureState[] = [];

  private durationMs = 0;

  private remainingDelayMs = 0;

  private elapsedPlaybackMs = 0;

  private phaseStartedAt = 0;

  private callbacks:
    PlaybackCallbacks | null = null;

  private easing: "linear" | "ease-in" | "ease-out" | "ease-in-out" = "linear";

  play({
    from,
    to,
    duration,
    delay = 0,
    easing = "linear",
    callbacks,
  }: PlaybackOptions): void {
    /*
     * Cancelamos cualquier reproducción
     * anterior sin disparar onCancel.
     */
    this.reset(false);

    this.from =
      cloneFixtureStates(from);

    this.to =
      cloneFixtureStates(to);

    this.durationMs =
      Math.max(
        0,
        duration
      ) * 1000;

    this.remainingDelayMs =
      Math.max(
        0,
        delay
      ) * 1000;

    this.elapsedPlaybackMs = 0;

    this.callbacks = callbacks;
    this.easing = easing;

    if (
      this.remainingDelayMs > 0
    ) {
      this.startDelay();

      return;
    }

    this.startPlayback();
  }

  pause(): boolean {
    if (this.phase === "delay") {
      const elapsedDelay =
        performance.now() -
        this.phaseStartedAt;

      this.remainingDelayMs =
        Math.max(
          0,
          this.remainingDelayMs -
            elapsedDelay
        );

      if (
        this.delayTimeoutId !==
        null
      ) {
        window.clearTimeout(
          this.delayTimeoutId
        );

        this.delayTimeoutId =
          null;
      }

      this.phase =
        "paused-delay";

      return true;
    }

    if (
      this.phase === "playing"
    ) {
      this.elapsedPlaybackMs +=
        performance.now() -
        this.phaseStartedAt;

      if (
        this.animationFrameId !==
        null
      ) {
        cancelAnimationFrame(
          this.animationFrameId
        );

        this.animationFrameId =
          null;
      }

      this.phase =
        "paused-playing";

      return true;
    }

    return false;
  }

  resume(): boolean {
    if (
      this.phase ===
      "paused-delay"
    ) {
      if (
        this.remainingDelayMs <=
        0
      ) {
        this.startPlayback();
      } else {
        this.startDelay();
      }

      return true;
    }

    if (
      this.phase ===
      "paused-playing"
    ) {
      this.phase = "playing";

      this.phaseStartedAt =
        performance.now();

      this.animationFrameId =
        requestAnimationFrame(
          this.animate
        );

      return true;
    }

    return false;
  }

  stop(): void {
    this.cancel();
  }

  cancel(): void {
    this.reset(true);
  }

  isRunning(): boolean {
    return (
      this.phase === "delay" ||
      this.phase === "playing"
    );
  }

  isPaused(): boolean {
    return (
      this.phase ===
        "paused-delay" ||
      this.phase ===
        "paused-playing"
    );
  }

  private startDelay(): void {
    if (!this.callbacks) {
      return;
    }

    if (
      this.remainingDelayMs <= 0
    ) {
      this.startPlayback();

      return;
    }

    this.phase = "delay";

    this.phaseStartedAt =
      performance.now();

    this.delayTimeoutId =
      window.setTimeout(
        () => {
          this.delayTimeoutId =
            null;

          this.remainingDelayMs =
            0;

          this.startPlayback();
        },
        this.remainingDelayMs
      );
  }

  private startPlayback(): void {
    if (!this.callbacks) {
      return;
    }

    this.phase = "playing";

    this.phaseStartedAt =
      performance.now();

    this.callbacks.onStart?.();

    if (this.durationMs === 0) {
      this.callbacks.onFrame({
        progress: 1,

        fixtureStates:
          cloneFixtureStates(
            this.to
          ),
      });

      const onComplete =
        this.callbacks
          .onComplete;

      this.reset(false);

      onComplete?.();

      return;
    }

    this.animationFrameId =
      requestAnimationFrame(
        this.animate
      );
  }

  private animate = (
    timestamp: number
  ): void => {
    if (
      this.phase !== "playing" ||
      !this.callbacks
    ) {
      return;
    }

    const currentElapsed =
      timestamp -
      this.phaseStartedAt;

    const totalElapsed =
      this.elapsedPlaybackMs +
      currentElapsed;

    const progress =
      clamp(
        totalElapsed /
          this.durationMs,
        0,
        1
      );

    const easedProgress = applyEasing(progress, this.easing);

    this.callbacks.onFrame({
      progress,

      fixtureStates:
        interpolateFixtureStates(
          this.from,
          this.to,
          easedProgress
        ),
    });

    if (progress >= 1) {
      const onComplete =
        this.callbacks
          .onComplete;

      this.reset(false);

      onComplete?.();

      return;
    }

    this.animationFrameId =
      requestAnimationFrame(
        this.animate
      );
  };

  private reset(
    notifyCancel: boolean
  ): void {
    const hadActivePlayback =
      this.phase !== "idle";

    const onCancel =
      this.callbacks?.onCancel;

    if (
      this.animationFrameId !==
      null
    ) {
      cancelAnimationFrame(
        this.animationFrameId
      );

      this.animationFrameId =
        null;
    }

    if (
      this.delayTimeoutId !== null
    ) {
      window.clearTimeout(
        this.delayTimeoutId
      );

      this.delayTimeoutId =
        null;
    }

    this.phase = "idle";

    this.from = [];
    this.to = [];

    this.durationMs = 0;
    this.remainingDelayMs = 0;
    this.elapsedPlaybackMs = 0;
    this.phaseStartedAt = 0;

    this.callbacks = null;

    if (
      notifyCancel &&
      hadActivePlayback
    ) {
      onCancel?.();
    }
  }
}

function interpolateFixtureStates(
  from:
    CueFixtureState[],

  to:
    CueFixtureState[],

  progress: number
): CueFixtureState[] {
  const fromByFixtureId =
    new Map(
      from.map(
        (fixtureState) => [
          fixtureState.fixtureId,
          fixtureState,
        ]
      )
    );

  return to.map(
    (targetState) => {
      const startState =
        fromByFixtureId.get(
          targetState.fixtureId
        );

      if (!startState) {
        return cloneFixtureState(
          targetState
        );
      }

      return {
        fixtureId:
          targetState.fixtureId,

        position: {
          x: lerp(
            startState.position.x,
            targetState.position.x,
            progress
          ),

          y: lerp(
            startState.position.y,
            targetState.position.y,
            progress
          ),

          z: lerp(
            startState.position.z,
            targetState.position.z,
            progress
          ),
        },

        pan: lerp(
          startState.pan,
          targetState.pan,
          progress
        ),

        tilt: lerp(
          startState.tilt,
          targetState.tilt,
          progress
        ),

        color: lerpHexColor(
          startState.color,
          targetState.color,
          progress
        ),

        intensity: lerp(
          startState.intensity,
          targetState.intensity,
          progress
        ),

        beamAngle: lerp(
          startState.beamAngle,
          targetState.beamAngle,
          progress
        ),

        /*
         * Powered permanece encendido
         * durante el fade cuando parte
         * de una luz encendida.
         */
        powered:
          targetState.powered ||
          (
            startState.powered &&
            progress < 1
          ),

        /*
         * La asignación de vara cambia
         * recién al finalizar el fade.
         */
        barId:
          progress < 1
            ? startState.barId
            : targetState.barId,

        offsetX: lerp(
          startState.offsetX,
          targetState.offsetX,
          progress
        ),

        selectedLightOffsetX:
          lerp(
            startState
              .selectedLightOffsetX,

            targetState
              .selectedLightOffsetX,

            progress
          ),
      };
    }
  );
}

function cloneFixtureStates(
  fixtureStates:
    CueFixtureState[]
): CueFixtureState[] {
  return fixtureStates.map(
    cloneFixtureState
  );
}

function cloneFixtureState(
  fixtureState:
    CueFixtureState
): CueFixtureState {
  return {
    ...fixtureState,

    position: {
      ...fixtureState.position,
    },
  };
}
function applyEasing(progress: number, easing: "linear" | "ease-in" | "ease-out" | "ease-in-out") {
  if (easing === "ease-in") return progress * progress;
  if (easing === "ease-out") return 1 - Math.pow(1 - progress, 2);
  if (easing === "ease-in-out") return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  return progress;
}
