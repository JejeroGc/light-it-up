import { TransformControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { useLightingStore } from "../../store/lightingStore";
import { useStageStore } from "../../store/stageStore";
import { useViewportStore } from "../../store/viewportStore";
import { useProgrammerStore } from "../../store/programmerStore";
import { useCueStore } from "../../store/cueStore";
import { usePlaybackStore } from "../../store/playbackStore";
import { findCueFixtureState, resolveFixtureOutput } from "../../core/playback/outputEngine";

type LightTransformGizmoProps = {
  lightId: number;
  onDraggingChange: (dragging: boolean) => void;
};

/*
 * Distancia máxima en metros para considerar
 * que el foco está cerca de una vara.
 */
const SNAP_DISTANCE = 0.65;

/*
 * El centro visual del foco queda un poco
 * por debajo del centro de la vara.
 */
const FIXTURE_BAR_OFFSET_Y = 0.1;
/*
 * Precisión del gizmo.
 *
 * Movimiento: pasos de 10 centímetros.
 * Rotación: pasos de 5 grados.
 */
const TRANSLATION_SNAP = 0.1;

const ROTATION_SNAP =
  THREE.MathUtils.degToRad(5);
export default function LightTransformGizmo({
  lightId,
  onDraggingChange,
}: LightTransformGizmoProps) {
  const isDraggingRef = useRef(false);

  /*
   * Objeto estable controlado por TransformControls.
   */
  const pivot = useMemo(
    () => new THREE.Group(),
    []
  );

  const light = useLightingStore((state) =>
    state.lights.find(
      (item) => item.id === lightId
    )
  );

  const setProgrammerPosition = useProgrammerStore(
    (state) => state.setPosition
  );

  const setProgrammerAttachment = useProgrammerStore(
    (state) => state.setAttachment
  );

  const setProgrammerPan = useProgrammerStore(
    (state) => state.setPan
  );

  const setProgrammerTilt = useProgrammerStore(
    (state) => state.setTilt
  );

  const programmerValues = useProgrammerStore(
    (state) => state.edits[lightId]
  );

  const cues = useCueStore((state) => state.cues);
  const liveCueId = usePlaybackStore((state) => state.liveCueId);
  const transitionFixtureStates = usePlaybackStore(
    (state) => state.transitionFixtureStates
  );

  const liveCue = liveCueId === null
    ? undefined
    : cues.find((cue) => cue.id === liveCueId);

  const visibleLight = light
    ? resolveFixtureOutput({
        fixture: light,
        cueState: findCueFixtureState(
          lightId,
          transitionFixtureStates ?? liveCue?.fixtureStates
        ),
        programmerValues,
      })
    : undefined;

  const bars = useStageStore(
    (state) => state.bars
  );

  const transformMode = useViewportStore(
    (state) => state.transformMode
  );

  const setSnapPreviewBarId =
    useViewportStore(
      (state) => state.setSnapPreviewBarId
    );

  /*
   * Busca la vara más cercana usando los ejes Y y Z.
   *
   * No usamos X para medir la cercanía porque el foco
   * puede desplazarse a lo largo de toda la vara.
   */
  const findNearestBar = (): (typeof bars)[number] | null => {
  let nearestBar: (typeof bars)[number] | null = null;
  let nearestDistance = SNAP_DISTANCE;

  for (const bar of bars) {
    const fixtureTargetY =
      bar.y - FIXTURE_BAR_OFFSET_Y;

    const distance = Math.hypot(
      pivot.position.y - fixtureTargetY,
      pivot.position.z - bar.z
    );

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestBar = bar;
    }
  }

  return nearestBar;
};

  /*
   * Sincroniza el pivot con el store siempre que
   * el usuario no esté arrastrando el gizmo.
   */
  useEffect(() => {
    if (!visibleLight || isDraggingRef.current) {
      return;
    }

    pivot.position.set(
      visibleLight.position.x,
      visibleLight.position.y,
      visibleLight.position.z
    );

    pivot.rotation.set(
      visibleLight.tilt ?? 0,
      visibleLight.pan ?? 0,
      0
    );

    pivot.updateMatrixWorld();
  }, [
    pivot,
    visibleLight,
    lightId,
    transformMode,
    visibleLight?.position.x,
    visibleLight?.position.y,
    visibleLight?.position.z,
    visibleLight?.pan,
    visibleLight?.tilt,
  ]);

  /*
   * Limpieza al cambiar de foco o desmontar
   * el componente.
   */
  useEffect(() => {
    return () => {
      isDraggingRef.current = false;
      onDraggingChange(false);
      setSnapPreviewBarId(null);
    };
  }, [
    lightId,
    onDraggingChange,
    setSnapPreviewBarId,
  ]);

  if (
    !light ||
    (transformMode !== "translate" && transformMode !== "rotate")
  ) {
    return null;
  }

  const handleMouseDown = () => {
    isDraggingRef.current = true;
    onDraggingChange(true);

    if (transformMode !== "translate") {
      setSnapPreviewBarId(null);
    }
  };

  const handleObjectChange = () => {
    if (!isDraggingRef.current) {
      return;
    }

    if (transformMode === "translate") {
      setProgrammerPosition(lightId, {
        x: pivot.position.x,
        y: pivot.position.y,
        z: pivot.position.z,
      });

      const nearestBar = findNearestBar();

      setSnapPreviewBarId(
        nearestBar?.id ?? null
      );

      return;
    }

    if (transformMode === "rotate") {
      setProgrammerTilt(
        lightId,
        pivot.rotation.x
      );

      setProgrammerPan(
        lightId,
        pivot.rotation.y
      );
    }
  };

  const handleMouseUp = () => {
    if (transformMode === "translate") {
      const nearestBar = findNearestBar();

      if (nearestBar) {
        /*
         * Evita colocar el foco por fuera
         * de los extremos de la vara.
         */
        const minimumX =
          nearestBar.x -
          nearestBar.width / 2;

        const maximumX =
          nearestBar.x +
          nearestBar.width / 2;

        const snappedX =
          THREE.MathUtils.clamp(
            pivot.position.x,
            minimumX,
            maximumX
          );

        const snappedY =
          nearestBar.y -
          FIXTURE_BAR_OFFSET_Y;

        const snappedZ = nearestBar.z;

        pivot.position.set(
          snappedX,
          snappedY,
          snappedZ
        );

        /*
         * La posición y la relación con la vara se escriben
         * en el Programmer para que una Cue LIVE no las pise.
         */
        setProgrammerPosition(lightId, {
          x: snappedX,
          y: snappedY,
          z: snappedZ,
        });

        setProgrammerAttachment(
          lightId,
          nearestBar.id,
          snappedX - nearestBar.x
        );
      } else {
        /*
         * Si se soltó lejos de todas las varas,
         * el override queda independiente dentro del Programmer.
         */
        setProgrammerAttachment(lightId, null, 0);

        setProgrammerPosition(lightId, {
          x: pivot.position.x,
          y: pivot.position.y,
          z: pivot.position.z,
        });
      }
    }

    if (transformMode === "rotate") {
      setProgrammerTilt(
        lightId,
        pivot.rotation.x
      );

      setProgrammerPan(
        lightId,
        pivot.rotation.y
      );
    }

    isDraggingRef.current = false;
    onDraggingChange(false);
    setSnapPreviewBarId(null);
  };

  return (
    <>
      <primitive object={pivot} />

<TransformControls
  object={pivot}
  mode={transformMode}
  space={
    transformMode === "rotate"
      ? "local"
      : "world"
  }
  size={1}
  showZ={transformMode !== "rotate"}
  translationSnap={TRANSLATION_SNAP}
  rotationSnap={ROTATION_SNAP}
  onMouseDown={handleMouseDown}
  onMouseUp={handleMouseUp}
  onObjectChange={handleObjectChange}
/>
    </>
  );
}