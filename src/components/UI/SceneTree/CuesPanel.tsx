import {
  useCallback,
  useEffect,
  type CSSProperties,
} from "react";

import CollapsibleSection from "../CollapsibleSection";

import {
  useCueStore,
  type Cue,
  type CueFixtureState,
} from "../../../store/cueStore";

import {
  useLightingStore,
} from "../../../store/lightingStore";

import {
  usePlaybackStore,
} from "../../../store/playbackStore";

import {
  useProgrammerStore,
} from "../../../store/programmerStore";

import {
  useTimelineStore,
} from "../../../store/timelineStore";

import {
  PlaybackEngine,
} from "../../../core/playback/PlaybackEngine";

import {
  findCueFixtureState,
  resolveFixtureOutput,
} from "../../../core/playback/outputEngine";

/*
 * Se utiliza una única instancia
 * del motor de Playback.
 */
const playbackEngine =
  new PlaybackEngine();

export default function CuesPanel() {
  const {
    cues,
    activeCueId,

    createCue,
    updateCue,
    renameCue,
    removeCue,

    setActiveCue,
    setCueFadeDuration,
    setCueDelay,

    getNextCue,
    getPreviousCue,
  } = useCueStore();

  const {
    lights,
    applyCueFixtureStates,
  } = useLightingStore();

  const {
    edits: programmerEdits,
    clearCueParameters,
  } = useProgrammerStore();

  const {
    liveCueId,
    nextCueId,
    status,
    progress,
    fadeDuration,

    setLiveCue,
    setNextCue,
    source,

    setStatus,
    setSource,
    setProgress,
    setTransitionFixtureStates,
  } = usePlaybackStore();

  const timelineStatus =
    useTimelineStore((state) => state.status);

  const nextCue =
    getNextCue();

  const previousCue =
    getPreviousCue();

  const activeCue =
    activeCueId === null
      ? null
      : cues.find(
          (cue) =>
            cue.id === activeCueId
        ) ?? null;

  const liveCue =
    liveCueId === null
      ? activeCue
      : cues.find(
          (cue) =>
            cue.id === liveCueId
        ) ?? activeCue;

  const preparedCue =
    nextCueId === null
      ? nextCue
      : cues.find(
          (cue) =>
            cue.id === nextCueId
        ) ?? nextCue;

  const hasProgrammerValues =
    Object.keys(
      programmerEdits
    ).length > 0;

  const playbackActive =
    status === "playing" ||
    status === "paused";

  const timelineActive =
    timelineStatus !== "stopped" ||
    source === "timeline";

  useEffect(() => {
    setLiveCue(activeCueId);
  }, [
    activeCueId,
    setLiveCue,
  ]);

  /*
   * Al cambiar la Cue activa,
   * prepara automáticamente la
   * siguiente Cue de la lista.
   */
  useEffect(() => {
    setNextCue(
      nextCue?.id ?? null
    );
  }, [
    nextCue?.id,
    setNextCue,
  ]);

  function createFixtureSnapshot():
    CueFixtureState[] {
    return lights.map((light) => {
      const liveCueState =
        findCueFixtureState(
          light.id,
          liveCue?.fixtureStates
        );

      const resolvedLight =
        resolveFixtureOutput({
          fixture: light,

          cueState:
            liveCueState,

          programmerValues:
            programmerEdits[
              light.id
            ],
        });

      return {
        fixtureId:
          resolvedLight.id,

        position: {
          x:
            resolvedLight
              .position.x,

          y:
            resolvedLight
              .position.y,

          z:
            resolvedLight
              .position.z,
        },

        pan:
          resolvedLight.pan,

        tilt:
          resolvedLight.tilt,

        color:
          resolvedLight.color,

        intensity:
          resolvedLight.intensity,

        beamAngle:
          resolvedLight
            .beamAngle,

        powered:
          resolvedLight.powered,

        barId:
          resolvedLight.barId,

        offsetX:
          resolvedLight.offsetX,

        selectedLightOffsetX:
          resolvedLight
            .selectedLightOffsetX,
      };
    });
  }

  function handleRecordCue() {
    if (
      lights.length === 0 ||
      playbackActive ||
      timelineActive
    ) {
      return;
    }

    if (!hasProgrammerValues) {
      const confirmed =
        window.confirm(
          "El Programmer está vacío. ¿Querés grabar igualmente el estado actual?"
        );

      if (!confirmed) {
        return;
      }
    }

    const suggestedName =
      `Escena ${cues.length + 1}`;

    const name =
      window.prompt(
        "Nombre de la escena:",
        suggestedName
      );

    if (!name?.trim()) {
      return;
    }

    const fixtureSnapshot =
      createFixtureSnapshot();

    const createdCueId =
      createCue(
        name,
        fixtureSnapshot
      );

    if (createdCueId === null) {
      return;
    }

    setNextCue(
      createdCueId
    );

    clearCueParameters();

    setProgress(0);
  }

  function handleUpdateCue() {
    if (
      !activeCue ||
      playbackActive ||
      timelineActive
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `¿Actualizar "${activeCue.name}" con el estado actual de las luces?`
      );

    if (!confirmed) {
      return;
    }

    const fixtureSnapshot =
      createFixtureSnapshot();

    updateCue(
      activeCue.id,
      fixtureSnapshot
    );

    clearCueParameters();
  }

  function handleRenameCue() {
    if (
      !activeCue ||
      playbackActive ||
      timelineActive
    ) {
      return;
    }

    const name =
      window.prompt(
        "Nuevo nombre de la escena:",
        activeCue.name
      );

    if (!name?.trim()) {
      return;
    }

    renameCue(
      activeCue.id,
      name
    );
  }

  function handleStop() {
    if (!playbackActive) {
      return;
    }

    playbackEngine.stop();

    /*
     * Eliminamos el estado temporal
     * interpolado. El escenario vuelve
     * al último estado físico aplicado.
     */
    setTransitionFixtureStates(
      null
    );

    setStatus("idle");
    setSource(null);
    setProgress(0);
  }

  function handleRemoveCue() {
    if (
      !activeCue ||
      playbackActive ||
      timelineActive
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `¿Eliminar "${activeCue.name}"?`
      );

    if (!confirmed) {
      return;
    }

    playbackEngine.cancel();

    setStatus("idle");
    setSource(null);
    setProgress(0);

    setTransitionFixtureStates(
      null
    );

    removeCue(activeCue.id);
  }

  function loadCue(
    cueId: number
  ) {
    if (playbackActive || timelineActive) {
      return;
    }

    const cue =
      cues.find(
        (currentCue) =>
          currentCue.id === cueId
      );

    if (!cue) {
      return;
    }

    playbackEngine.cancel();

    clearCueParameters();

    applyCueFixtureStates(
      cue.fixtureStates
    );

    setActiveCue(cue.id);
    setLiveCue(cue.id);

    setStatus("idle");
    setProgress(1);

    setTransitionFixtureStates(
      null
    );
  }

  const playCueTransition =
    useCallback(
      (
        targetCue: Cue
      ) => {
        if (
          status === "playing" ||
          status === "paused" ||
          timelineActive
        ) {
          return;
        }

        const startState =
          createFixtureSnapshot();

        const targetState =
          targetCue.fixtureStates;

        const cueFadeDuration =
          typeof targetCue
            .fadeDuration ===
          "number"
            ? targetCue
                .fadeDuration
            : fadeDuration;

        const cueDelay =
          typeof targetCue
            .delay === "number"
            ? targetCue.delay
            : 0;

        clearCueParameters();

        setNextCue(
          targetCue.id
        );

        setStatus("playing");
        setSource("manual");
        setProgress(0);

        playbackEngine.play({
          from: startState,

          to: targetState,

          duration:
            cueFadeDuration,

          delay:
            cueDelay,

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
              applyCueFixtureStates(
                targetState
              );

              setActiveCue(
                targetCue.id
              );

              setLiveCue(
                targetCue.id
              );

              setTransitionFixtureStates(
                null
              );

              setStatus("idle");
              setSource(null);
              setProgress(1);
            },

            onCancel: () => {
              setTransitionFixtureStates(
                null
              );

              setStatus("idle");
              setSource(null);
            },
          },
        });
      },
      [
        status,
        timelineActive,
        fadeDuration,
        clearCueParameters,
        setNextCue,
        setStatus,
        setSource,
        setProgress,
        setTransitionFixtureStates,
        applyCueFixtureStates,
        setActiveCue,
        setLiveCue,
        lights,
        liveCue,
        programmerEdits,
      ]
    );

  const handleGo =
    useCallback(() => {
      if (
        !preparedCue ||
        status !== "idle"
      ) {
        return;
      }

      playCueTransition(
        preparedCue
      );
    }, [
      preparedCue,
      status,
      playCueTransition,
    ]);

  function handleBack() {
    if (
      !previousCue ||
      status !== "idle"
    ) {
      return;
    }

    playCueTransition(
      previousCue
    );
  }

  function handlePause() {
    if (
      status !== "playing"
    ) {
      return;
    }

    const paused =
      playbackEngine.pause();

    if (paused) {
      setStatus("paused");
    }
  }

  function handleResume() {
    if (
      status !== "paused"
    ) {
      return;
    }

    const resumed =
      playbackEngine.resume();

    if (resumed) {
      setStatus("playing");
    }
  }

  /*
   * SPACE ejecuta GO, excepto cuando
   * el usuario está escribiendo o
   * manipulando un control.
   */
  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.code !== "Space" ||
        event.repeat ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      ) {
        return;
      }

      const target =
        event.target;

      if (
        target instanceof
          HTMLInputElement ||
        target instanceof
          HTMLTextAreaElement ||
        target instanceof
          HTMLSelectElement ||
        target instanceof
          HTMLButtonElement ||
        (
          target instanceof
            HTMLElement &&
          target.isContentEditable
        )
      ) {
        return;
      }

      event.preventDefault();

      if (status === "idle") {
        handleGo();

        return;
      }

      if (
        status === "playing"
      ) {
        handlePause();

        return;
      }

      if (
        status === "paused"
      ) {
        handleResume();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    status,
    handleGo,
  ]);

  const buttonStyle:
    CSSProperties = {
    padding: "7px 8px",

    border:
      "1px solid #444",

    borderRadius: 5,

    background: "#292929",
    color: "#ddd",

    cursor: "pointer",
  };

  const timeInputStyle:
    CSSProperties = {
    width: "100%",

    marginTop: 4,
    padding: "5px 6px",

    boxSizing:
      "border-box",

    border:
      "1px solid #444",

    borderRadius: 4,

    background: "#181818",
    color: "#ddd",
  };

  return (
    <CollapsibleSection title="Cues">
      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "1fr 1fr",

          gap: 6,

          marginBottom: 10,
        }}
      >
        <button
          type="button"
          disabled={
            playbackActive
          }
          onClick={
            handleRecordCue
          }
          style={{
            ...buttonStyle,

            background:
              hasProgrammerValues
                ? "#3a2612"
                : "#292929",

            borderColor:
              hasProgrammerValues
                ? "#8b5b20"
                : "#444",

            color:
              hasProgrammerValues
                ? "#ffd36a"
                : "#aaa",

            opacity:
              playbackActive
                ? 0.45
                : 1,
          }}
        >
          ● Grabar escena
        </button>

        <button
          type="button"
          disabled={
            activeCue === null ||
            playbackActive
          }
          onClick={
            handleUpdateCue
          }
          style={{
            ...buttonStyle,

            opacity:
              activeCue &&
              !playbackActive
                ? 1
                : 0.45,
          }}
        >
          Actualizar
        </button>

        <button
          type="button"
          disabled={
            activeCue === null ||
            playbackActive
          }
          onClick={
            handleRenameCue
          }
          style={{
            ...buttonStyle,

            opacity:
              activeCue &&
              !playbackActive
                ? 1
                : 0.45,
          }}
        >
          Renombrar
        </button>

        <button
          type="button"
          disabled={
            activeCue === null ||
            playbackActive
          }
          onClick={
            handleRemoveCue
          }
          style={{
            ...buttonStyle,

            color: "#ff9b9b",

            opacity:
              activeCue &&
              !playbackActive
                ? 1
                : 0.45,
          }}
        >
          Eliminar
        </button>
      </div>

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "1fr 2fr",

          gap: 8,

          marginBottom: 8,
        }}
      >
        <button
          type="button"
          disabled={
            previousCue === null ||
            playbackActive
          }
          onClick={
            handleBack
          }
          style={{
            ...buttonStyle,

            opacity:
              previousCue &&
              !playbackActive
                ? 1
                : 0.45,
          }}
        >
          ◀ BACK
        </button>

        <button
          type="button"
          disabled={
            preparedCue === null ||
            status !== "idle"
          }
          onClick={
            handleGo
          }
          style={{
            ...buttonStyle,

            fontWeight: "bold",

            background:
              preparedCue &&
              status === "idle"
                ? "#183622"
                : "#292929",

            borderColor:
              preparedCue &&
              status === "idle"
                ? "#3d8957"
                : "#444",

            color:
              preparedCue &&
              status === "idle"
                ? "#8ff0ad"
                : "#777",

            opacity:
              preparedCue &&
              status === "idle"
                ? 1
                : 0.45,
          }}
        >
          {status === "playing"
            ? `▶ FADING ${Math.round(
                progress * 100
              )}%`
            : status === "paused"
              ? `⏸ PAUSED ${Math.round(
                  progress * 100
                )}%`
              : "▶ GO · SPACE"}
        </button>
      </div>

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "1fr 1fr",

          gap: 8,

          marginBottom: 12,
        }}
      >
        <button
          type="button"
          disabled={
            status === "idle"
          }
          onClick={
            status === "paused"
              ? handleResume
              : handlePause
          }
          style={{
            ...buttonStyle,

            color:
              status === "paused"
                ? "#8ff0ad"
                : "#ffd36a",

            opacity:
              status === "idle"
                ? 0.45
                : 1,
          }}
        >
          {status === "paused"
            ? "▶ RESUME"
            : "⏸ PAUSE"}
        </button>

        <button
          type="button"
          disabled={
            status === "idle"
          }
          onClick={
            handleStop
          }
          style={{
            ...buttonStyle,

            color: "#ff9b9b",

            borderColor:
              status !== "idle"
                ? "#7f3535"
                : "#444",

            opacity:
              status === "idle"
                ? 0.45
                : 1,
          }}
        >
          ■ STOP
        </button>
      </div>

      <div
        style={{
          marginBottom: 12,
          padding: 8,

          border:
            "1px solid #333",

          borderRadius: 6,

          background: "#191919",

          fontSize: 13,
        }}
      >
        <div>
          LIVE:&nbsp;

          <strong
            style={{
              color: "#ffd36a",
            }}
          >
            {liveCue
              ? `Cue ${liveCue.number} — ${liveCue.name}`
              : "-"}
          </strong>
        </div>

        <div
          style={{
            marginTop: 4,
          }}
        >
          NEXT:&nbsp;

          <strong
            style={{
              color: "#38bdf8",
            }}
          >
            {preparedCue
              ? `Cue ${preparedCue.number} — ${preparedCue.name}`
              : "-"}
          </strong>
        </div>

        <div
          style={{
            marginTop: 4,
          }}
        >
          STATUS:&nbsp;

          <strong
            style={{
              color:
                status === "playing"
                  ? "#8ff0ad"
                  : status ===
                      "paused"
                    ? "#ffd36a"
                    : "#777",
            }}
          >
            {status === "playing"
              ? "PLAYING"
              : status ===
                  "paused"
                ? "PAUSED"
                : "IDLE"}
          </strong>
        </div>

        <div
          style={{
            marginTop: 4,
          }}
        >
          PROGRAMMER:&nbsp;

          <strong
            style={{
              color:
                hasProgrammerValues
                  ? "#ffd36a"
                  : "#777",
            }}
          >
            {hasProgrammerValues
              ? "ACTIVE"
              : "CLEAR"}
          </strong>
        </div>

        <div
          style={{
            height: 5,
            marginTop: 9,

            overflow: "hidden",

            borderRadius: 999,

            background: "#303030",
          }}
        >
          <div
            style={{
              width:
                `${progress * 100}%`,

              height: "100%",

              background:
                status === "playing"
                  ? "#22c55e"
                  : status ===
                      "paused"
                    ? "#eab308"
                    : "#555",

              transition:
                status === "playing"
                  ? "none"
                  : "width 120ms ease",
            }}
          />
        </div>
      </div>

      {cues.length === 0 && (
        <div
          style={{
            padding: 10,
            marginBottom: 8,

            border:
              "1px dashed #444",

            borderRadius: 6,

            color: "#888",

            fontSize: 13,

            textAlign: "center",
          }}
        >
          Todavía no hay escenas
          grabadas.
        </div>
      )}

      {cues.map((cue) => {
        const active =
          cue.id === liveCue?.id;

        const prepared =
          cue.id ===
          preparedCue?.id;

        return (
          <div
            key={cue.id}
            style={{
              marginBottom: 8,
              padding: 8,

              borderRadius: 6,

              border: active
                ? "1px solid #ffd36a"
                : prepared
                  ? "1px solid #38bdf8"
                  : "1px solid #444",

              background: active
                ? "#332a12"
                : prepared
                  ? "#102d38"
                  : "#202020",

              opacity:
                playbackActive
                  ? 0.75
                  : 1,
            }}
          >
            <button
              type="button"
              disabled={
                playbackActive
              }
              onClick={() =>
                loadCue(cue.id)
              }
              style={{
                width: "100%",

                padding: 0,
                margin: 0,

                textAlign:
                  "left",

                border: "none",

                background:
                  "transparent",

                color: active
                  ? "#ffd36a"
                  : prepared
                    ? "#38bdf8"
                    : "#ddd",

                cursor:
                  playbackActive
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <strong>
                Cue {cue.number}
              </strong>

              {" — "}

              {cue.name}

              {active && (
                <span
                  style={{
                    float: "right",
                  }}
                >
                  ● LIVE
                </span>
              )}

              {!active &&
                prepared && (
                  <span
                    style={{
                      float:
                        "right",
                    }}
                  >
                    ● NEXT
                  </span>
                )}
            </button>

            <div
              style={{
                display: "grid",

                gridTemplateColumns:
                  "1fr 1fr",

                gap: 8,

                marginTop: 9,
              }}
            >
              <label
                style={{
                  fontSize: 11,
                  color: "#aaa",
                }}
              >
                Fade

                <input
                  type="number"
                  min={0}
                  step={0.1}

                  disabled={
                    playbackActive
                  }

                  value={
                    cue.fadeDuration
                  }

                  onChange={(
                    event
                  ) => {
                    const value =
                      Number(
                        event
                          .target
                          .value
                      );

                    if (
                      Number.isNaN(
                        value
                      )
                    ) {
                      return;
                    }

                    setCueFadeDuration(
                      cue.id,
                      value
                    );
                  }}

                  style={
                    timeInputStyle
                  }
                />
              </label>

              <label
                style={{
                  fontSize: 11,
                  color: "#aaa",
                }}
              >
                Delay

                <input
                  type="number"
                  min={0}
                  step={0.1}

                  disabled={
                    playbackActive
                  }

                  value={
                    cue.delay
                  }

                  onChange={(
                    event
                  ) => {
                    const value =
                      Number(
                        event
                          .target
                          .value
                      );

                    if (
                      Number.isNaN(
                        value
                      )
                    ) {
                      return;
                    }

                    setCueDelay(
                      cue.id,
                      value
                    );
                  }}

                  style={
                    timeInputStyle
                  }
                />
              </label>
            </div>
          </div>
        );
      })}
    </CollapsibleSection>
  );
}