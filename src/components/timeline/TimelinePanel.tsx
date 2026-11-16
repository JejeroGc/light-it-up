import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  useCueStore,
  type Cue,
  type CueFixtureState,
  type CueTransitionType,
  type CueEffectType,
} from "../../store/cueStore";

import { useEffectStore } from "../../store/effectStore";

import {
  useLightingStore,
} from "../../store/lightingStore";

import {
  usePlaybackStore,
} from "../../store/playbackStore";

import {
  useTimelineStore,
} from "../../store/timelineStore";

import {
  PlaybackEngine,
} from "../../core/playback/PlaybackEngine";

const timelinePlaybackEngine =
  new PlaybackEngine();

function formatTime(
  totalSeconds: number
) {
  const safeSeconds =
    Math.max(
      0,
      totalSeconds
    );

  const minutes =
    Math.floor(
      safeSeconds / 60
    );

  const seconds =
    Math.floor(
      safeSeconds % 60
    );

  const tenths =
    Math.floor(
      (safeSeconds % 1) * 10
    );

  return `${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    seconds
  ).padStart(
    2,
    "0"
  )}.${tenths}`;
}


const timelineSelectStyle: CSSProperties = { background: "#242424", color: "#eee", border: "1px solid #444", borderRadius: 5, padding: "5px 7px", fontSize: 11 };
const timelineNumberStyle: CSSProperties = { width: 46, background: "#242424", color: "#eee", border: "1px solid #444", borderRadius: 5, padding: "5px", fontSize: 11 };
const miniLabelStyle: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 3, color: "#999", fontSize: 10 };

export default function TimelinePanel() {
  const {
    cues,
    activeCueId,

    setActiveCue,
    setCueTimelineTime,
    setCueFadeDuration,
    setCueDelay,
    setCueTransitionType,
    setCueTransitionEffect,
    setCueTransitionEffectSpeed,
    setCueTransitionEffectAmount,
    setCueTransitionEffects,
  } = useCueStore();

  const {
    lights,
    applyCueFixtureStates,
  } = useLightingStore();

  const { addEffect, removeEffect } = useEffectStore();

  const selectedCue = cues.find((cue) => cue.id === activeCueId) ?? null;

  const {
    liveCueId,

    setLiveCue,
    setNextCue,

    setStatus:
      setCuePlaybackStatus,

    setSource:
      setPlaybackSource,

    setProgress,
    setTransitionFixtureStates,
  } = usePlaybackStore();

  const {
    currentTime,
    duration,
    status,
    zoom,

    setCurrentTime,
    setDuration,
    setStatus,
    setZoom,
  } = useTimelineStore();

  const trackRef =
    useRef<HTMLDivElement>(
      null
    );

  const animationFrameRef =
    useRef<number | null>(
      null
    );

  const startedAtRef =
    useRef(0);

  const audioRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const audioUrlRef =
    useRef<string | null>(
      null
    );

  const [
    audioName,
    setAudioName,
  ] =
    useState<string | null>(
      null
    );

  const [
    audioDuration,
    setAudioDuration,
  ] =
    useState<number | null>(
      null
    );

  const [transitionEditorCueId, setTransitionEditorCueId] = useState<number | null>(null);
  const [transitionEditorPos, setTransitionEditorPos] = useState({ x: 0, y: 0 });

  /*
   * IDs de las Cues que ya fueron
   * alcanzadas por el cursor.
   */
  const playedCueIdsRef =
    useRef<Set<number>>(
      new Set()
    );

  /*
   * Si dos Cues están muy próximas,
   * quedan en una cola para evitar
   * cancelar la transición anterior.
   */
  const pendingCuesRef =
    useRef<Cue[]>([]);

  const cueTransitionRunningRef =
    useRef(false);

  const sortedCues =
    useMemo(
      () =>
        [...cues].sort(
          (
            firstCue,
            secondCue
          ) =>
            firstCue.timelineTime -
              secondCue.timelineTime ||
            firstCue.number -
              secondCue.number
        ),
      [cues]
    );

  const calculatedDuration =
    useMemo(() => {
      const lastCueTime =
        sortedCues.at(-1)
          ?.timelineTime ?? 0;

      const cueDuration =
        Math.max(
          30,
          Math.ceil(
            lastCueTime + 10
          )
        );

      if (
        audioDuration === null
      ) {
        return cueDuration;
      }

      return Math.max(
        1,
        Math.ceil(
          audioDuration
        )
      );
    }, [
      audioDuration,
      sortedCues,
    ]);

  const timelineWidth =
    duration * zoom;

  useEffect(() => {
    setDuration(
      calculatedDuration
    );
  }, [
    calculatedDuration,
    setDuration,
  ]);

  useEffect(() => {
    return () => {
      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }

      timelinePlaybackEngine.cancel();

      setTransitionFixtureStates(
        null
      );

      audioRef.current?.pause();

      if (audioUrlRef.current) {
        URL.revokeObjectURL(
          audioUrlRef.current
        );
      }
    };
  }, [
    setTransitionFixtureStates,
  ]);

  function resetCueQueue() {
    playedCueIdsRef.current =
      new Set();

    pendingCuesRef.current = [];

    cueTransitionRunningRef.current =
      false;
  }

  function stopTimelineFrame() {
    if (
      animationFrameRef.current ===
      null
    ) {
      return;
    }

    cancelAnimationFrame(
      animationFrameRef.current
    );

    animationFrameRef.current =
      null;
  }

  function handleAudioUpload(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    audioRef.current?.pause();

    if (audioUrlRef.current) {
      URL.revokeObjectURL(
        audioUrlRef.current
      );
    }

    timelinePlaybackEngine.cancel();

    setTransitionFixtureStates(
      null
    );

    const objectUrl =
      URL.createObjectURL(file);

    const audio =
      new Audio();

    audio.preload =
      "metadata";

    audio.src =
      objectUrl;

    audio.addEventListener(
      "loadedmetadata",
      () => {
        const nextDuration =
          Number.isFinite(
            audio.duration
          )
            ? audio.duration
            : 0;

        audioRef.current =
          audio;

        audioUrlRef.current =
          objectUrl;

        setAudioName(
          file.name
        );

        setAudioDuration(
          nextDuration
        );

        resetCueQueue();

        setCurrentTime(0);

        setStatus(
          "stopped"
        );

        setCuePlaybackStatus(
          "idle"
        );

        setProgress(0);

        setTransitionFixtureStates(
          null
        );
      },
      {
        once: true,
      }
    );

    audio.addEventListener(
      "error",
      () => {
        URL.revokeObjectURL(
          objectUrl
        );

        window.alert(
          "No se pudo cargar el archivo de audio."
        );
      },
      {
        once: true,
      }
    );

    event.target.value = "";
  }

  function removeAudio() {
    stopTimelineFrame();

    timelinePlaybackEngine.cancel();

    audioRef.current?.pause();

    if (audioUrlRef.current) {
      URL.revokeObjectURL(
        audioUrlRef.current
      );
    }

    audioRef.current =
      null;

    audioUrlRef.current =
      null;

    setAudioName(null);

    setAudioDuration(null);

    resetCueQueue();

    setCurrentTime(0);

    setStatus(
      "stopped"
    );

    setCuePlaybackStatus(
      "idle"
    );

    setProgress(0);

    setTransitionFixtureStates(
      null
    );
  }

  function createFixtureSnapshot():
    CueFixtureState[] {
    return lights.map(
      (light) => ({
        fixtureId:
          light.id,

        position: {
          x:
            light.position.x,

          y:
            light.position.y,

          z:
            light.position.z,
        },

        pan:
          light.pan,

        tilt:
          light.tilt,

        color:
          light.color,

        intensity:
          light.intensity,

        beamAngle:
          light.beamAngle,

        powered:
          light.powered,

        barId:
          light.barId,

        offsetX:
          light.offsetX,

        selectedLightOffsetX:
          light
            .selectedLightOffsetX,
      })
    );
  }

  /*
   * Si hay un fade activo, toma como
   * inicio el estado visible actual.
   * De lo contrario usa las luces
   * físicas guardadas en el Store.
   */
  function createVisibleFixtureSnapshot():
    CueFixtureState[] {
    const playbackState =
      usePlaybackStore.getState();

    const transitionState =
      playbackState
        .transitionFixtureStates;

    if (transitionState) {
      return transitionState.map(
        (fixtureState) => ({
          ...fixtureState,

          position: {
            ...fixtureState
              .position,
          },
        })
      );
    }

    return createFixtureSnapshot();
  }

  function playNextQueuedCue() {
    if (
      cueTransitionRunningRef.current
    ) {
      return;
    }

    /*
     * No iniciamos una nueva Cue
     * mientras el Timeline esté
     * pausado o detenido.
     */
    if (
      useTimelineStore.getState()
        .status !== "playing"
    ) {
      return;
    }

    const cue =
      pendingCuesRef.current.shift();

    if (!cue) {
      setCuePlaybackStatus(
        "idle"
      );

      return;
    }

    cueTransitionRunningRef.current =
      true;

    const startState =
      createVisibleFixtureSnapshot();

    const targetState =
      cue.fixtureStates;

    setNextCue(
      cue.id
    );

    setCuePlaybackStatus(
      "playing"
    );

    setPlaybackSource(
      "timeline"
    );

    setProgress(0);

    const transitionEffectIds: number[] = [];
    const effectLayers = cue.transitionEffects?.length
      ? cue.transitionEffects
      : (cue.transitionEffect && cue.transitionEffect !== "none"
          ? [{ type: cue.transitionEffect, speed: cue.transitionEffectSpeed ?? 8, amount: cue.transitionEffectAmount ?? 0.85 }]
          : []);
    for (const layer of effectLayers) {
      transitionEffectIds.push(addEffect({
        type: layer.type,
        fixtureIds: targetState.map((fixture) => fixture.fixtureId),
        speed: layer.speed,
        amount: layer.amount,
      }));
    }

    const transitionType = cue.transitionType ?? "linear";

    timelinePlaybackEngine.play({
      from:
        startState,

      to:
        targetState,

      duration:
        transitionType === "cut" ? 0 : cue.fadeDuration,

      delay:
        cue.delay,

      easing: transitionType === "cut" ? "linear" : transitionType,

      callbacks: {
        onStart: () => {
          setProgress(0);
        },

        onFrame: ({
          progress:
            currentProgress,

          fixtureStates,
        }) => {
          setTransitionFixtureStates(
            fixtureStates
          );

          setProgress(
            currentProgress
          );
        },

        onComplete: () => {
          transitionEffectIds.forEach((effectId) => removeEffect(effectId));
          applyCueFixtureStates(
            targetState
          );

          setActiveCue(
            cue.id
          );

          setLiveCue(
            cue.id
          );

          setTransitionFixtureStates(
            null
          );

          setProgress(1);

          cueTransitionRunningRef.current =
            false;

          const timelineStatus =
            useTimelineStore
              .getState()
              .status;

          if (
            timelineStatus ===
            "playing"
          ) {
            if (pendingCuesRef.current.length > 0) {
              requestAnimationFrame(() => playNextQueuedCue());
            } else {
              setCuePlaybackStatus("idle");
              setPlaybackSource(null);
            }

            return;
          }

          if (
            timelineStatus ===
            "paused"
          ) {
            setCuePlaybackStatus(
              "paused"
            );

            return;
          }

          setCuePlaybackStatus(
            "idle"
          );
          setPlaybackSource(null);
        },

        onCancel: () => {
          cueTransitionRunningRef.current =
            false;

          setTransitionFixtureStates(
            null
          );

          if (
            useTimelineStore
              .getState()
              .status ===
            "stopped"
          ) {
            setCuePlaybackStatus(
              "idle"
            );
          }
        },
      },
    });
  }

  function triggerPendingCues(
    time: number
  ) {
    let queuedNewCue =
      false;

    for (
      const cue
      of sortedCues
    ) {
      if (
        cue.timelineTime <=
          time &&
        !playedCueIdsRef.current.has(
          cue.id
        )
      ) {
        playedCueIdsRef.current.add(
          cue.id
        );

        pendingCuesRef.current.push(
          cue
        );

        queuedNewCue =
          true;
      }
    }

    if (queuedNewCue) {
      playNextQueuedCue();
    }
  }

  function runTimeline(
    timestamp: number
  ) {
    const timelineState =
      useTimelineStore
        .getState();

    if (
      timelineState.status !==
      "playing"
    ) {
      animationFrameRef.current =
        null;

      return;
    }

    const audio =
      audioRef.current;

    const nextTime =
      Math.min(
        duration,

        audio
          ? audio.currentTime
          : (
              timestamp -
              startedAtRef.current
            ) / 1000
      );

    setCurrentTime(
      nextTime
    );

    triggerPendingCues(
      nextTime
    );

    if (
      nextTime >= duration
    ) {
      audioRef.current?.pause();

      setStatus(
        "stopped"
      );

      animationFrameRef.current =
        null;

      /*
       * Una transición puede terminar
       * después del final del audio.
       * No la cancelamos automáticamente.
       */
      if (
        !cueTransitionRunningRef.current
      ) {
        setCuePlaybackStatus(
          "idle"
        );
        setPlaybackSource(null);
      }

      return;
    }

    animationFrameRef.current =
      requestAnimationFrame(
        runTimeline
      );
  }

  async function handlePlay() {
    if (
      sortedCues.length === 0 ||
      status === "playing"
    ) {
      return;
    }

    const resuming =
      status === "paused";

    let playbackTime =
      currentTime;

    if (
      playbackTime >= duration
    ) {
      resetCueQueue();

      playbackTime = 0;

      setCurrentTime(0);

      if (audioRef.current) {
        audioRef.current.currentTime =
          0;
      }
    } else if (!resuming) {
      playedCueIdsRef.current =
        new Set(
          sortedCues
            .filter(
              (cue) =>
                cue.timelineTime <
                playbackTime
            )
            .map(
              (cue) =>
                cue.id
            )
        );

      pendingCuesRef.current =
        [];
    }

    startedAtRef.current =
      performance.now() -
      playbackTime * 1000;

    const audio =
      audioRef.current;

    if (audio) {
      audio.currentTime =
        Math.min(
          playbackTime,

          audio.duration ||
            playbackTime
        );

      try {
        await audio.play();
      } catch {
        setStatus(
          "paused"
        );

        setCuePlaybackStatus(
          "paused"
        );

        window.alert(
          "El navegador bloqueó la reproducción del audio. Presioná PLAY nuevamente."
        );

        return;
      }
    }

    setStatus(
      "playing"
    );

    setPlaybackSource(
      "timeline"
    );

    /*
     * Si había un fade pausado,
     * continúa desde el mismo punto.
     */
    if (
      resuming &&
      timelinePlaybackEngine
        .isPaused()
    ) {
      timelinePlaybackEngine.resume();

      setCuePlaybackStatus(
        "playing"
      );
    } else if (
      cueTransitionRunningRef.current
    ) {
      setCuePlaybackStatus(
        "playing"
      );
    }

    triggerPendingCues(
      playbackTime
    );

    /*
     * Puede haber Cues pendientes que
     * no llegaron a iniciarse antes
     * de presionar PAUSE.
     */
    if (
      !cueTransitionRunningRef.current &&
      pendingCuesRef.current
        .length > 0
    ) {
      playNextQueuedCue();
    }

    stopTimelineFrame();

    animationFrameRef.current =
      requestAnimationFrame(
        runTimeline
      );
  }

  function handlePause() {
    if (
      status !== "playing"
    ) {
      return;
    }

    stopTimelineFrame();

    audioRef.current?.pause();

    /*
     * Pausamos el fade sin descartarlo.
     */
    if (
      cueTransitionRunningRef.current
    ) {
      timelinePlaybackEngine.pause();
    }

    setStatus(
      "paused"
    );

    setCuePlaybackStatus(
      "paused"
    );
  }

  function handleStop() {
    stopTimelineFrame();

    timelinePlaybackEngine.cancel();

    cueTransitionRunningRef.current =
      false;

    pendingCuesRef.current =
      [];

    setTransitionFixtureStates(
      null
    );

    if (audioRef.current) {
      audioRef.current.pause();

      audioRef.current.currentTime =
        0;
    }

    resetCueQueue();

    setCurrentTime(0);

    setStatus(
      "stopped"
    );

    setCuePlaybackStatus(
      "idle"
    );

    setPlaybackSource(null);
    setProgress(0);
  }

  function seekTimeline(
    event:
      ReactPointerEvent<HTMLDivElement>
  ) {
    if (!trackRef.current) {
      return;
    }

    const target =
      event.target;

    /*
     * Evita que arrastrar una Cue
     * también mueva el cursor.
     */
    if (
      target instanceof
        HTMLElement &&
      target.closest(
        "[data-timeline-cue]"
      )
    ) {
      return;
    }

    const bounds =
      trackRef.current
        .getBoundingClientRect();

    const scrollLeft =
      trackRef.current
        .parentElement
        ?.scrollLeft ?? 0;

    const x =
      event.clientX -
      bounds.left +
      scrollLeft;

    const nextTime =
      Math.max(
        0,
        Math.min(
          duration,
          x / zoom
        )
      );

    /*
     * Al buscar otro momento,
     * cancelamos la transición actual
     * para no continuar hacia una Cue
     * perteneciente al tiempo anterior.
     */
    timelinePlaybackEngine.cancel();

    cueTransitionRunningRef.current =
      false;

    pendingCuesRef.current =
      [];

    setTransitionFixtureStates(
      null
    );

    setProgress(0);

    /*
     * Scrubbing también es preview: mostramos inmediatamente la última
     * Cue alcanzada por el playhead. Antes sólo movíamos currentTime, por
     * eso la línea roja cambiaba pero el escenario no.
     */
    const previewCue = [...sortedCues]
      .reverse()
      .find((cue) => cue.timelineTime <= nextTime);

    if (previewCue) {
      applyCueFixtureStates(previewCue.fixtureStates);
      setActiveCue(previewCue.id);
      setLiveCue(previewCue.id);
      setNextCue(
        sortedCues.find((cue) => cue.timelineTime > nextTime)?.id ?? null
      );
      setProgress(1);
    } else {
      setActiveCue(null);
      setLiveCue(null);
      setNextCue(sortedCues[0]?.id ?? null);
      setProgress(0);
    }

    /* Las Cues hasta el punto buscado ya se consideran recorridas. */
    playedCueIdsRef.current =
      new Set(
        sortedCues
          .filter(
            (cue) =>
              cue.timelineTime <=
              nextTime
          )
          .map(
            (cue) =>
              cue.id
          )
      );

    setCurrentTime(
      nextTime
    );

    if (audioRef.current) {
      audioRef.current.currentTime =
        Math.min(
          nextTime,

          audioRef.current
            .duration ||
            nextTime
        );
    }

    if (
      status === "playing"
    ) {
      startedAtRef.current =
        performance.now() -
        nextTime * 1000;

      setCuePlaybackStatus(
        "playing"
      );

      triggerPendingCues(
        nextTime
      );
    } else if (
      status === "paused"
    ) {
      setCuePlaybackStatus(
        "paused"
      );
    } else {
      setCuePlaybackStatus(
        "idle"
      );
    }
  }

  function handleCueDrag(
    event:
      ReactPointerEvent<HTMLButtonElement>,

    cueId: number
  ) {
    event.stopPropagation();

    if (
      status === "playing"
    ) {
      return;
    }

    const startX =
      event.clientX;

    const cue =
      cues.find(
        (currentCue) =>
          currentCue.id ===
          cueId
      );

    if (!cue) {
      return;
    }

    const startTime =
      cue.timelineTime;

    const handlePointerMove =
      (
        pointerEvent:
          PointerEvent
      ) => {
        const deltaSeconds =
          (
            pointerEvent.clientX -
            startX
          ) / zoom;

        const snappedTime =
          Math.round(
            Math.max(
              0,
              startTime +
                deltaSeconds
            ) * 10
          ) / 10;

        setCueTimelineTime(
          cueId,
          snappedTime
        );
      };

    const handlePointerUp =
      () => {
        window.removeEventListener(
          "pointermove",
          handlePointerMove
        );

        window.removeEventListener(
          "pointerup",
          handlePointerUp
        );
      };

    window.addEventListener(
      "pointermove",
      handlePointerMove
    );

    window.addEventListener(
      "pointerup",
      handlePointerUp
    );
  }

  const controlButtonStyle:
    CSSProperties = {
    height: 30,

    minWidth: 34,

    padding:
      "0 10px",

    border:
      "1px solid #444",

    borderRadius: 5,

    background:
      "#272727",

    color:
      "#ddd",

    cursor:
      "pointer",
  };

  const secondMarks =
    Array.from(
      {
        length:
          Math.floor(
            duration
          ) + 1,
      },

      (
        _,
        index
      ) => index
    );

  return (
    <section
      style={{
        height: "100%",

        display: "grid",

        gridTemplateRows:
          "38px 1fr",

        minHeight: 0,
      }}
    >
      <div
        data-tour="playback"
        style={{
          display: "flex",

          alignItems:
            "center",

          gap: 7,

          padding:
            "4px 10px",

          borderBottom:
            "1px solid #303030",

          background:
            "#161616",
        }}
      >
        <button
          data-tour="timeline-play"
          type="button"
          onClick={
            handlePlay
          }
          disabled={
            status ===
              "playing" ||
            cues.length === 0
          }
          title={
            status === "paused"
              ? "Reanudar Timeline"
              : "Reproducir Timeline"
          }
          style={{
            ...controlButtonStyle,

            color:
              "#8ff0ad",

            opacity:
              status ===
                "playing" ||
              cues.length === 0
                ? 0.45
                : 1,
          }}
        >
          {status === "paused"
            ? "▶ RESUME"
            : "▶"}
        </button>

        <button
          type="button"
          onClick={
            handlePause
          }
          disabled={
            status !==
            "playing"
          }
          title="Pausar Timeline"
          style={{
            ...controlButtonStyle,

            opacity:
              status ===
              "playing"
                ? 1
                : 0.45,
          }}
        >
          ⏸
        </button>

        <button
          type="button"
          onClick={
            handleStop
          }
          title="Detener Timeline"
          style={{
            ...controlButtonStyle,

            color:
              "#ff9b9b",
          }}
        >
          ■
        </button>

        <strong
          style={{
            minWidth: 76,

            fontVariantNumeric:
              "tabular-nums",

            color:
              "#ffd36a",
          }}
        >
          {formatTime(
            currentTime
          )}
        </strong>

        <span
          style={{
            color: "#777",
          }}
        >
          /
        </span>

        <span
          style={{
            minWidth: 64,

            color:
              "#999",

            fontVariantNumeric:
              "tabular-nums",
          }}
        >
          {formatTime(
            duration
          )}
        </span>

        <label
          style={{
            ...controlButtonStyle,

            display:
              "inline-flex",

            alignItems:
              "center",

            maxWidth: 210,

            overflow:
              "hidden",

            whiteSpace:
              "nowrap",

            textOverflow:
              "ellipsis",

            color:
              audioName
                ? "#7dd3fc"
                : "#ddd",
          }}
          title={
            audioName ??
            "Cargar música"
          }
        >
          ♫{" "}
          {audioName ??
            "Audio"}

          <input
            type="file"
            accept="audio/*"
            onChange={
              handleAudioUpload
            }
            style={{
              display:
                "none",
            }}
          />
        </label>

        {audioName && (
          <button
            type="button"
            onClick={
              removeAudio
            }
            title="Quitar audio"
            style={{
              ...controlButtonStyle,

              minWidth: 30,

              padding:
                "0 8px",

              color:
                "#ff9b9b",
            }}
          >
            ×
          </button>
        )}

        {selectedCue && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 8, borderLeft: "1px solid #333" }} title={`Transición hacia ${selectedCue.name}`}>
            <span style={{ color: "#8b8b8b", fontSize: 10, fontWeight: 700, letterSpacing: ".08em" }}>TO CUE {selectedCue.number}</span>
            <select value={selectedCue.transitionType ?? "linear"} onChange={(e) => setCueTransitionType(selectedCue.id, e.target.value as CueTransitionType)} style={timelineSelectStyle}>
              <option value="cut">Cut</option><option value="linear">Fade</option><option value="ease-in">Ease In</option><option value="ease-out">Ease Out</option><option value="ease-in-out">Ease In-Out</option>
            </select>
            {(selectedCue.transitionType ?? "linear") !== "cut" && (
              <label style={miniLabelStyle}>
                <input aria-label="Duración de transición" type="number" min="0" step="0.1" value={selectedCue.fadeDuration} onChange={(e) => setCueFadeDuration(selectedCue.id, Number(e.target.value))} style={timelineNumberStyle} />s
              </label>
            )}
            <select value={selectedCue.transitionEffect ?? "none"} onChange={(e) => setCueTransitionEffect(selectedCue.id, e.target.value as CueEffectType)} style={timelineSelectStyle}>
              <option value="none">FX: None</option><option value="strobe">FX: Strobe</option><option value="pulse">FX: Pulse</option><option value="chase">FX: Chase</option><option value="flicker">FX: Flicker</option><option value="color-chase">FX: Color Chase</option>
            </select>
            {(selectedCue.transitionEffect ?? "none") !== "none" && (
              <>
                <label style={miniLabelStyle}>Speed <input aria-label="Velocidad de efecto" type="number" min="0.1" max="20" step="0.5" value={selectedCue.transitionEffectSpeed ?? 8} onChange={(e) => setCueTransitionEffectSpeed(selectedCue.id, Number(e.target.value))} style={timelineNumberStyle} /></label>
                <label style={miniLabelStyle}>Amt <input aria-label="Profundidad de efecto" type="number" min="0" max="100" step="5" value={Math.round((selectedCue.transitionEffectAmount ?? .85) * 100)} onChange={(e) => setCueTransitionEffectAmount(selectedCue.id, Number(e.target.value) / 100)} style={timelineNumberStyle} />%</label>
              </>
            )}
          </div>
        )}

        <div
          style={{
            flex: 1,
          }}
        />

        <label
          style={{
            display:
              "flex",

            alignItems:
              "center",

            gap: 7,

            color:
              "#aaa",

            fontSize: 12,
          }}
        >
          Zoom

          <input
            type="range"
            min={8}
            max={80}
            step={2}
            value={zoom}
            onChange={(
              event
            ) =>
              setZoom(
                Number(
                  event
                    .target
                    .value
                )
              )
            }
          />
        </label>
      </div>

      <div
        style={{
          minHeight: 0,

          overflowX:
            "auto",

          overflowY:
            "hidden",

          background:
            "#202020",
        }}
      >
        <div
          ref={trackRef}
          onPointerDown={
            seekTimeline
          }
          style={{
            position:
              "relative",

            width:
              timelineWidth,

            minWidth:
              "100%",

            height:
              "100%",

            cursor:
              "crosshair",

            userSelect:
              "none",
          }}
        >
          {secondMarks.map(
            (second) => {
              const major =
                second % 5 === 0;

              return (
                <div
                  key={
                    second
                  }
                  style={{
                    position:
                      "absolute",

                    left:
                      second *
                      zoom,

                    top: 0,
                    bottom: 0,

                    borderLeft:
                      major
                        ? "1px solid #484848"
                        : "1px solid #2d2d2d",
                  }}
                >
                  {major && (
                    <span
                      style={{
                        position:
                          "absolute",

                        top: 3,
                        left: 4,

                        color:
                          "#777",

                        fontSize:
                          10,

                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {formatTime(
                        second
                      ).slice(
                        0,
                        5
                      )}
                    </span>
                  )}
                </div>
              );
            }
          )}

          <div
            style={{
              position:
                "absolute",

              left: 0,
              right: 0,

              top: 28,

              height: 52,

              borderTop:
                "1px solid #333",

              borderBottom:
                "1px solid #333",

              background:
                "rgba(255, 255, 255, 0.015)",
            }}
          />

          {sortedCues.map(
            (cue) => {
              const isLive =
                liveCueId ===
                cue.id;

              return (
                <button
                  key={
                    cue.id
                  }
                  type="button"
                  data-timeline-cue
                  disabled={
                    status ===
                    "playing"
                  }
                  onPointerDown={(
                    event
                  ) =>
                    handleCueDrag(
                      event,
                      cue.id
                    )
                  }
                  onDoubleClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setActiveCue(cue.id);
                    setTransitionEditorCueId(cue.id);
                    setTransitionEditorPos({ x: Math.min(event.clientX, window.innerWidth - 360), y: Math.min(event.clientY, window.innerHeight - 430) });
                  }}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setActiveCue(cue.id);
                    setTransitionEditorCueId(cue.id);
                    setTransitionEditorPos({ x: Math.min(event.clientX, window.innerWidth - 360), y: Math.min(event.clientY, window.innerHeight - 430) });
                  }}
                  title={`Cue ${cue.number} — ${cue.name}\n${formatTime(
                    cue.timelineTime
                  )}`}
                  style={{
                    position:
                      "absolute",

                    left:
                      cue.timelineTime *
                      zoom,

                    top: 35,

                    transform:
                      "translateX(-2px)",

                    minWidth:
                      78,

                    maxWidth:
                      150,

                    height:
                      38,

                    padding:
                      "4px 7px",

                    overflow:
                      "hidden",

                    whiteSpace:
                      "nowrap",

                    textOverflow:
                      "ellipsis",

                    border:
                      isLive
                        ? "1px solid #ffd36a"
                        : "1px solid #3d89a8",

                    borderRadius:
                      5,

                    background:
                      isLive
                        ? "#3a3016"
                        : "#15313b",

                    color:
                      isLive
                        ? "#ffd36a"
                        : "#7dd3fc",

                    textAlign:
                      "left",

                    cursor:
                      status ===
                      "playing"
                        ? "not-allowed"
                        : "grab",

                    opacity:
                      status ===
                      "playing"
                        ? 0.65
                        : 1,

                    zIndex: 3,
                  }}
                >
                  <strong>
                    Cue{" "}
                    {cue.number}
                  </strong>

                  <br />

                  <span
                    style={{
                      fontSize:
                        10,

                      opacity:
                        0.8,
                    }}
                  >
                    {formatTime(
                      cue.timelineTime
                    )}
                  </span>
                </button>
              );
            }
          )}

          {transitionEditorCueId !== null && (() => {
            const editCue = cues.find((item) => item.id === transitionEditorCueId);
            if (!editCue) return null;
            const layers = editCue.transitionEffects ?? [];
            const effectTypes = ["strobe", "pulse", "chase", "flicker", "color-chase"] as const;
            return (
              <div onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()} style={{ position: "fixed", left: transitionEditorPos.x, top: transitionEditorPos.y, width: 330, zIndex: 10000, background: "#17171c", border: "1px solid #555", borderRadius: 10, padding: 12, boxShadow: "0 18px 50px rgba(0,0,0,.55)", color: "#eee" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><strong>Transition → Cue {editCue.number}</strong><button onClick={() => setTransitionEditorCueId(null)}>×</button></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <label style={miniLabelStyle}>Fade In <input style={timelineNumberStyle} type="number" min="0" step="0.1" value={editCue.fadeDuration} onChange={(e) => setCueFadeDuration(editCue.id, Number(e.target.value))} />s</label>
                  <label style={miniLabelStyle}>Delay <input style={timelineNumberStyle} type="number" min="0" step="0.1" value={editCue.delay} onChange={(e) => setCueDelay(editCue.id, Number(e.target.value))} />s</label>
                </div>
                <label style={{ ...miniLabelStyle, marginTop: 10 }}>Curva <select style={timelineSelectStyle} value={editCue.transitionType ?? "linear"} onChange={(e) => setCueTransitionType(editCue.id, e.target.value as CueTransitionType)}><option value="cut">Cut</option><option value="linear">Linear</option><option value="ease-in">Ease In</option><option value="ease-out">Ease Out</option><option value="ease-in-out">Ease In/Out</option></select></label>
                <div style={{ marginTop: 12, borderTop: "1px solid #333", paddingTop: 10 }}><strong style={{ fontSize: 12 }}>Effects mix</strong></div>
                {effectTypes.map((type) => { const layer = layers.find((item) => item.type === type); return <div key={type} style={{ marginTop: 8, padding: 8, background: "#222228", borderRadius: 7 }}>
                  <label style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 11 }}><input type="checkbox" checked={!!layer} onChange={(e) => { const next = e.target.checked ? [...layers, { type, speed: 8, amount: .5 }] : layers.filter((item) => item.type !== type); setCueTransitionEffects(editCue.id, next); }} />{type}</label>
                  {layer && <><label style={miniLabelStyle}>Mix {Math.round(layer.amount * 100)}% <input type="range" min="0" max="1" step="0.05" value={layer.amount} onChange={(e) => setCueTransitionEffects(editCue.id, layers.map((item) => item.type === type ? { ...item, amount: Number(e.target.value) } : item))} /></label><label style={miniLabelStyle}>Speed <input type="range" min="0.1" max="20" step="0.1" value={layer.speed} onChange={(e) => setCueTransitionEffects(editCue.id, layers.map((item) => item.type === type ? { ...item, speed: Number(e.target.value) } : item))} /></label></>}
                </div>; })}
                <div style={{ marginTop: 10, fontSize: 10, color: "#999" }}>Doble click o click derecho sobre un Cue para volver a editar esta transición.</div>
              </div>
            );
          })()}

          <div
            style={{
              position:
                "absolute",

              left:
                currentTime *
                zoom,

              top: 0,
              bottom: 0,

              width: 2,

              background:
                "#ef4444",

              pointerEvents:
                "none",

              zIndex: 5,
            }}
          >
            <div
              style={{
                position:
                  "absolute",

                top: 0,
                left: -5,

                width: 0,
                height: 0,

                borderLeft:
                  "6px solid transparent",

                borderRight:
                  "6px solid transparent",

                borderTop:
                  "8px solid #ef4444",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}