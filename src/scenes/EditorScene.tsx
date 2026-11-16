import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import {
  OrbitControls,
} from "@react-three/drei";

import Stage from "../components/stage/Stage";
import TheatreSpot from "../components/lighting/TheatreSpot";
import LightTransformGizmo from "../components/viewport/LightTransformGizmo";
import ViewportGrid from "../components/viewport/ViewportGrid";
import DirectDragGuide from "../components/viewport/DirectDragGuide";
import FocusTarget from "../components/viewport/FocusTarget";
import SceneEnvironment from "../components/environment/SceneEnvironment";
import StudioLighting from "../components/environment/StudioLighting";

import {
  useLightingStore,
} from "../store/lightingStore";

import {
  useViewportStore,
} from "../store/viewportStore";

import {
  useProgrammerStore,
} from "../store/programmerStore";

import {
  useCueStore,
} from "../store/cueStore";

import {
  usePlaybackStore,
} from "../store/playbackStore";

import {
  findCueFixtureState,
  resolveFixtureOutput,
} from "../core/playback/outputEngine";
import { useEffectStore } from "../store/effectStore";
import { applyEffectsToFixture } from "../core/lighting/applyEffects";
import type { LightFixture } from "../store/lightingStore";


function TheatreSpotView({ light, selected, onSelect }: {
  light: LightFixture;
  selected: boolean;
  onSelect: (additive: boolean) => void;
}) {
  return (
    <TheatreSpot
      id={light.id}
      type={light.type}
      x={light.position.x}
      y={light.position.y}
      z={light.position.z}
      color={light.color}
      intensity={light.intensity}
      angle={light.angle}
      pan={light.pan}
      tilt={light.tilt}
      powered={light.powered}
      selected={selected}
      onSelect={onSelect}
    />
  );
}

function AnimatedEffectTheatreSpot({ light, selected, onSelect, effects }: {
  light: LightFixture;
  selected: boolean;
  onSelect: (additive: boolean) => void;
  effects: ReturnType<typeof useEffectStore.getState>["effects"];
}) {
  const [effectLight, setEffectLight] = useState(light);

  useEffect(() => setEffectLight(light), [light]);

  useFrame(({ clock }) => {
    const next = applyEffectsToFixture(light, effects, clock.getElapsedTime());
    setEffectLight((current) =>
      current.intensity === next.intensity && current.color === next.color ? current : next
    );
  });

  return <TheatreSpotView light={effectLight} selected={selected} onSelect={onSelect} />;
}

function EffectedTheatreSpot({ light, selected, onSelect }: {
  light: LightFixture;
  selected: boolean;
  onSelect: (additive: boolean) => void;
}) {
  const effects = useEffectStore((state) => state.effects);
  const activeEffects = effects.filter(
    (effect) => effect.active && effect.fixtureIds.includes(light.id)
  );

  if (activeEffects.length === 0) {
    return <TheatreSpotView light={light} selected={selected} onSelect={onSelect} />;
  }

  return (
    <AnimatedEffectTheatreSpot
      light={light}
      selected={selected}
      onSelect={onSelect}
      effects={activeEffects}
    />
  );
}

type MarqueeRect = { left: number; top: number; right: number; bottom: number; additive: boolean };

function MarqueeProjector() {
  const { camera, gl } = useThree();
  const selectLights = useLightingStore((state) => state.selectLights);

  useEffect(() => {
    const handle = (event: Event) => {
      const rect = (event as CustomEvent<MarqueeRect>).detail;
      const bounds = gl.domElement.getBoundingClientRect();
      const lights = useLightingStore.getState().lights;
      const ids = lights.filter((light) => {
        const p = new Vector3(light.position.x, light.position.y, light.position.z).project(camera);
        const x = bounds.left + (p.x + 1) * 0.5 * bounds.width;
        const y = bounds.top + (1 - p.y) * 0.5 * bounds.height;
        return p.z >= -1 && p.z <= 1 && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      }).map((light) => light.id);
      selectLights(ids, rect.additive);
    };
    window.addEventListener("liu-marquee-select", handle);
    return () => window.removeEventListener("liu-marquee-select", handle);
  }, [camera, gl, selectLights]);

  return null;
}

export default function EditorScene() {
  const [
    isDraggingGizmo,
    setIsDraggingGizmo,
  ] = useState(false);

  const {
    lights,
    selectedLightId,
    selectedLightIds,
    selectLight,
    clearLightSelection,
    selectAllLights,
    createGroupFromSelection,
    duplicateSelectedLights,
    copySelectedLights,
    pasteLights,
    removeSelectedLights,
    moveLight,
  } = useLightingStore();

  /*
   * Cambios temporales del Programmer.
   *
   * Esta capa tiene prioridad sobre
   * la Cue LIVE.
   */
  const programmerEdits =
    useProgrammerStore(
      (state) => state.edits
    );

  /*
   * Lista completa de Cues.
   */
  const cues = useCueStore(
    (state) => state.cues
  );

  /*
   * ID de la Cue que actualmente
   * está siendo mostrada en escena.
   */
  const liveCueId =
    usePlaybackStore(
      (state) =>
        state.liveCueId
    );

  const transitionFixtureStates =
    usePlaybackStore(
      (state) => state.transitionFixtureStates
    );

  /*
   * Buscamos la Cue LIVE completa.
   */
  const liveCue =
    liveCueId === null
      ? undefined
      : cues.find(
          (cue) =>
            cue.id === liveCueId
        );

  const setTransformMode =
    useViewportStore(
      (state) =>
        state.setTransformMode
    );

  const isDirectDraggingFixture =
    useViewportStore(
      (state) => state.isDirectDraggingFixture
    );

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      const target =
        event.target as HTMLElement;

      const isWriting =
        target.tagName === "INPUT" ||
        target.tagName ===
          "TEXTAREA" ||
        target.isContentEditable;

      if (isWriting) {
        return;
      }

      const key =
        event.key.toLowerCase();

      /*
       * Cmd/Ctrl + A selecciona todas las luminarias y evita que el
       * navegador seleccione el texto de toda la interfaz.
       */
      const isSelectAllShortcut =
        (event.metaKey || event.ctrlKey) && key === "a";

      if (isSelectAllShortcut) {
        event.preventDefault();
        selectAllLights();
        return;
      }

      /*
       * Herramientas del gizmo.
       */
      if (key === "q") {
        setTransformMode(
          "select"
        );
      }

      if (key === "w") {
        setTransformMode(
          "translate"
        );
      }

      if (key === "e") {
        setTransformMode(
          "rotate"
        );
      }

      if (key === "f") {
        const currentMode = useViewportStore.getState().transformMode;
        const hasSelection = useLightingStore.getState().selectedLightIds.length > 0;

        if (currentMode === "focus") {
          setTransformMode("select");
        } else if (hasSelection) {
          setTransformMode("focus");
        }
      }

      /* Flechas: mueve toda la selección en el plano X/Z.
       * Paso normal 0.10 m; Shift acelera a 0.50 m. */
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        const state = useLightingStore.getState();
        if (state.selectedLightIds.length > 0) {
          event.preventDefault();
          const step = event.shiftKey ? 0.5 : 0.1;
          const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
          const dz = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
          for (const id of state.selectedLightIds) {
            const light = state.lights.find((item) => item.id === id);
            if (light) moveLight(id, { x: light.position.x + dx, y: light.position.y, z: light.position.z + dz });
          }
          return;
        }
      }

      /*
       * Escape limpia toda
       * la selección.
       */
      if (
        event.key === "Escape"
      ) {
        clearLightSelection();
        setTransformMode("select");
      }

      /*
       * Cmd + G en macOS.
       * Ctrl + G en Windows.
       */
      const isGroupShortcut =
        (
          event.metaKey ||
          event.ctrlKey
        ) &&
        key === "g";

      if (isGroupShortcut) {
        event.preventDefault();
        createGroupFromSelection();
      }

      const isCopyShortcut =
        (event.metaKey || event.ctrlKey) && key === "c";

      if (isCopyShortcut) {
        event.preventDefault();
        copySelectedLights();
        return;
      }

      const isPasteShortcut =
        (event.metaKey || event.ctrlKey) && key === "v";

      if (isPasteShortcut) {
        event.preventDefault();
        pasteLights();
        return;
      }

      const isDuplicateShortcut =
        (event.metaKey || event.ctrlKey) &&
        key === "d";

      if (isDuplicateShortcut) {
        event.preventDefault();
        duplicateSelectedLights();
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        removeSelectedLights();
      }
    };

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
    setTransformMode,
    clearLightSelection,
    selectLight,
    selectAllLights,
    createGroupFromSelection,
    duplicateSelectedLights,
    copySelectedLights,
    pasteLights,
    removeSelectedLights,
    moveLight,
  ]);

  const marqueeStart = useRef<{ x: number; y: number; additive: boolean } | null>(null);
  const fixturePointerDown = useRef(false);
  const [marquee, setMarquee] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  useEffect(() => {
    const markFixture = () => { fixturePointerDown.current = true; };
    window.addEventListener("liu-fixture-pointerdown", markFixture);
    return () => window.removeEventListener("liu-fixture-pointerdown", markFixture);
  }, []);

  const beginMarquee = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    fixturePointerDown.current = false;
    requestAnimationFrame(() => {
      if (fixturePointerDown.current) return;
      marqueeStart.current = { x: event.clientX, y: event.clientY, additive: event.shiftKey };
    });
  };

  const updateMarquee = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = marqueeStart.current;
    if (!start) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) < 5 && !marquee) return;
    setMarquee({ x1: start.x, y1: start.y, x2: event.clientX, y2: event.clientY });
  };

  const finishMarquee = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = marqueeStart.current;
    if (start && marquee) {
      window.dispatchEvent(new CustomEvent("liu-marquee-select", { detail: {
        left: Math.min(start.x, event.clientX), right: Math.max(start.x, event.clientX),
        top: Math.min(start.y, event.clientY), bottom: Math.max(start.y, event.clientY), additive: start.additive
      }}));
    }
    marqueeStart.current = null;
    setMarquee(null);
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}
      onPointerDown={beginMarquee} onPointerMove={updateMarquee} onPointerUp={finishMarquee}>
    {marquee && <div style={{ position: "fixed", pointerEvents: "none", zIndex: 20,
      left: Math.min(marquee.x1, marquee.x2), top: Math.min(marquee.y1, marquee.y2),
      width: Math.abs(marquee.x2 - marquee.x1), height: Math.abs(marquee.y2 - marquee.y1),
      border: "1px solid rgba(110,170,255,.95)", background: "rgba(110,170,255,.12)" }} />}
    <Canvas
      camera={{
        position: [
          0,
          8,
          18,
        ],
        fov: 45,
      }}
      style={{
        width: "100%",
        height: "100%",
      }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
      }}
      shadows
      onPointerMissed={() => {
        clearLightSelection();
      }}
    >
      <MarqueeProjector />
      <SceneEnvironment />
      <StudioLighting />
      <ViewportGrid />
      <Stage />
      <DirectDragGuide />
      <FocusTarget />

      {lights.map((light) => {
        /*
         * Estado de la luminaria
         * dentro de la Cue LIVE.
         */
        const cueState =
          findCueFixtureState(
            light.id,
            transitionFixtureStates ?? liveCue?.fixtureStates
          );

        /*
         * Resultado visible final:
         *
         * Fixture físico
         *      ↓
         * Cue LIVE
         *      ↓
         * Programmer
         */
        const resolvedLight =
          resolveFixtureOutput({
            fixture: light,

            cueState,

            programmerValues:
              programmerEdits[
                light.id
              ],
          });

        return (
          <EffectedTheatreSpot
            key={resolvedLight.id}
            light={resolvedLight}
            selected={selectedLightIds.includes(resolvedLight.id)}
            onSelect={(additive) => selectLight(resolvedLight.id, additive)}
          />
        );
      })}

      {selectedLightId !==
        null && (
        <LightTransformGizmo
          lightId={
            selectedLightId
          }
          onDraggingChange={
            setIsDraggingGizmo
          }
        />
      )}

      <OrbitControls
        makeDefault
        enabled={!isDraggingGizmo && !isDirectDraggingFixture}
        enableDamping
        dampingFactor={0.075}
        minDistance={4}
        maxDistance={42}
        maxPolarAngle={Math.PI / 2 - 0.025}
        target={[0, 2.3, 0]}
      />
    </Canvas>
    </div>
  );
}