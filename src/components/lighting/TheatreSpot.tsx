import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";
import { useStageStore } from "../../store/stageStore";
import { useViewportStore } from "../../store/viewportStore";

import {
  useLightingStore,
  type FixtureType,
} from "../../store/lightingStore";

import {
  useProgrammerStore,
} from "../../store/programmerStore";

import {
  calculateFixtureBeam,
} from "../../core/lighting/beamMath";

import FixtureBody from "./FixtureBody";
import FixtureBeam from "./FixtureBeam";
import FixtureFloorHit from "./FixtureFloorHit";

type TheatreSpotProps = {
  id: number;
  type: FixtureType;

  x: number;
  y: number;
  z: number;

  color: string;
  intensity: number;
  angle: number;

  pan: number;
  tilt: number;
  powered: boolean;

  selected: boolean;

  onSelect: (
    additive: boolean
  ) => void;
};

export default function TheatreSpot({
  id,
  type,
  x,
  y,
  z,
  color,
  intensity,
  angle,
  pan,
  tilt,
  powered,
  selected,
  onSelect,
}: TheatreSpotProps) {
  const lightRef =
    useRef<THREE.SpotLight>(null);

  const targetRef =
    useRef<THREE.Object3D>(null);

  const {
    lights,
    hoveredLightId,
    setHoveredLight,
    duplicateLight,
  } = useLightingStore();

  const bars = useStageStore((state) => state.bars);
  const setSnapPreviewBarId = useViewportStore((state) => state.setSnapPreviewBarId);
  const setDirectDraggingFixture = useViewportStore((state) => state.setDirectDraggingFixture);
  const setDragGuide = useViewportStore((state) => state.setDragGuide);

  const dragStateRef = useRef<{
    active: boolean;
    pointerId: number | null;
    targetIds: number[];
    initialPositions: Map<number, { x: number; y: number; z: number }>;
    anchorX: number;
  }>({
    active: false,
    pointerId: null,
    targetIds: [],
    initialPositions: new Map(),
    anchorX: 0,
  });

  const suppressNextClickRef = useRef(false);

  /*
   * Indica si esta luminaria tiene
   * cambios pendientes dentro
   * del Programmer.
   */
  const programmed =
    useProgrammerStore(
      (state) =>
        state.edits[id] !== undefined
    );

  const setProgrammerPosition = useProgrammerStore(
    (state) => state.setPosition
  );

  const setProgrammerAttachment = useProgrammerStore(
    (state) => state.setAttachment
  );

  const setProgrammerPower = useProgrammerStore(
    (state) => state.setPower
  );

  /*
   * Mantenemos currentLight únicamente
   * para consultar información física
   * del fixture, como su barId.
   *
   * Los valores de playback:
   *
   * powered
   * pan
   * tilt
   *
   * llegan resueltos desde EditorScene.
   */
  const currentLight = lights.find(
    (light) => light.id === id
  );

  const hovered =
    hoveredLightId === id;

  /*
   * El fixture está unido a una vara
   * cuando tiene un barId asignado.
   */
  const attachedToBar =
    currentLight?.barId !== null &&
    currentLight?.barId !== undefined;

  /*
   * Bajamos el origen visual del
   * fixture para que la abrazadera
   * quede alineada con el centro
   * de la vara.
   */
  const hangingOffset =
    attachedToBar ? 0.42 : 0;

  const visualY =
    y - hangingOffset;

  const isOn =
    powered && intensity > 0;

  const beamCalculation =
    useMemo(
      () =>
        calculateFixtureBeam({
          position: {
            x,
            y: visualY,
            z,
          },

          pan,
          tilt,

          beamAngle: angle,
        }),
      [
        x,
        visualY,
        z,
        pan,
        tilt,
        angle,
      ]
    );

  const {
    targetPosition,
    beamLength,
    beamRadius,
    beamMidpoint,
    beamQuaternion,
    direction,
  } = beamCalculation;

  /*
   * Convertimos la dirección calculada
   * por beamMath en la rotación visual
   * del cuerpo del fixture.
   */
  const horizontalDirection =
    Math.sqrt(
      direction.x *
        direction.x +
        direction.z *
          direction.z
    );

  const visualPan =
    horizontalDirection < 0.0001
      ? 0
      : Math.atan2(
          -direction.x,
          -direction.z
        );

  const visualTilt =
    Math.acos(
      THREE.MathUtils.clamp(
        -direction.y,
        -1,
        1
      )
    );

  useEffect(() => {
    if (
      !lightRef.current ||
      !targetRef.current
    ) {
      return;
    }

    lightRef.current.target =
      targetRef.current;

    targetRef.current.updateMatrixWorld();
  }, [targetPosition]);

  const handleSelect = (
    event: THREE.Event & {
      stopPropagation: () => void;

      nativeEvent?: {
        shiftKey?: boolean;
        metaKey?: boolean;
        ctrlKey?: boolean;
      };
    }
  ) => {
    event.stopPropagation();

    // La selección ya se procesa en pointerdown para que el drag comience
    // inmediatamente. Consumimos el click posterior para no seleccionar dos
    // veces y, en selección múltiple, evitar que el segundo evento quite el foco.
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }

    const nativeEvent = event.nativeEvent;
    const additive =
      nativeEvent?.shiftKey === true ||
      nativeEvent?.metaKey === true ||
      nativeEvent?.ctrlKey === true;

    onSelect(additive);
  };



  const finishDirectDrag = (event?: any) => {
    if (!dragStateRef.current.active) return;

    dragStateRef.current = {
      active: false,
      pointerId: null,
      targetIds: [],
      initialPositions: new Map(),
      anchorX: 0,
    };

    setSnapPreviewBarId(null);
    setDirectDraggingFixture(false);
    setDragGuide(null);
    document.body.style.cursor = "pointer";

    try {
      event?.target?.releasePointerCapture?.(event.pointerId);
    } catch {
      // Pointer capture may already be released.
    }
  };

  const handlePointerDown = (event: any) => {
    if (event.button !== 0) return;

    window.dispatchEvent(new CustomEvent("liu-fixture-pointerdown"));
    event.stopPropagation();

    const nativeEvent = event.nativeEvent;
    const additive =
      nativeEvent?.shiftKey === true ||
      nativeEvent?.metaKey === true ||
      nativeEvent?.ctrlKey === true;

    const altDuplicate = nativeEvent?.altKey === true;

    const selectionBefore = useLightingStore.getState().selectedLightIds;
    const preserveGroupSelection =
      !additive &&
      selectionBefore.length > 1 &&
      selectionBefore.includes(id);

    if (!preserveGroupSelection) {
      onSelect(additive);
    }

    suppressNextClickRef.current = true;

    let dragTargetId = id;

    if (altDuplicate) {
      duplicateLight(id);
      dragTargetId =
        useLightingStore.getState().selectedLightId ?? id;
    }

    const currentState = useLightingStore.getState();
    const targetIds =
      !altDuplicate &&
      currentState.selectedLightIds.includes(id) &&
      currentState.selectedLightIds.length > 1
        ? [
            id,
            ...currentState.selectedLightIds.filter(
              (fixtureId) => fixtureId !== id
            ),
          ]
        : [dragTargetId];

    const programmerState = useProgrammerStore.getState();

    const initialPositions = new Map(
      currentState.lights
        .filter((light) => targetIds.includes(light.id))
        .map((light) => [
          light.id,
          {
            ...(programmerState.edits[light.id]?.position ??
              light.position),
          },
        ])
    );

    const anchor =
      currentState.lights.find((light) => light.id === dragTargetId) ??
      currentState.lights.find((light) => light.id === id);

    const anchorPosition = anchor
      ? programmerState.edits[anchor.id]?.position ?? anchor.position
      : undefined;

    dragStateRef.current = {
      active: true,
      pointerId: event.pointerId ?? null,
      targetIds,
      initialPositions,
      anchorX: anchorPosition?.x ?? x,
    };

    setDirectDraggingFixture(true);
    document.body.style.cursor = "grabbing";

    try {
      event.target?.setPointerCapture?.(event.pointerId);
    } catch {
      // Not all renderers expose pointer capture.
    }
  };

  const handlePointerMove = (event: any) => {
    const dragState = dragStateRef.current;

    if (!dragState.active || bars.length === 0) return;

    event.stopPropagation();

    const state = useLightingStore.getState();
    const anchorLight =
      state.lights.find((light) => light.id === dragState.targetIds[0]) ??
      currentLight;

    const currentBar =
      anchorLight?.barId == null
        ? undefined
        : bars.find((bar) => bar.id === anchorLight.barId);

    const referenceY = currentBar?.y ?? bars[0].y;
    const dragPlane = new THREE.Plane(
      new THREE.Vector3(0, 1, 0),
      -referenceY
    );

    const intersection = new THREE.Vector3();

    if (!event.ray?.intersectPlane(dragPlane, intersection)) return;

    const nearestBar = bars.reduce((nearest, bar) =>
      Math.abs(bar.z - intersection.z) <
      Math.abs(nearest.z - intersection.z)
        ? bar
        : nearest
    );

    const rawDeltaX = intersection.x - dragState.anchorX;
    const snappedDeltaX = Math.round(rawDeltaX * 20) / 20;

    const initialXs = dragState.targetIds
      .map((fixtureId) => dragState.initialPositions.get(fixtureId)?.x)
      .filter((value): value is number => value !== undefined);

    const minInitialX = Math.min(...initialXs);
    const maxInitialX = Math.max(...initialXs);
    const leftLimit = nearestBar.x - nearestBar.width / 2;
    const rightLimit = nearestBar.x + nearestBar.width / 2;

    const clampedDeltaX = THREE.MathUtils.clamp(
      snappedDeltaX,
      leftLimit - minInitialX,
      rightLimit - maxInitialX
    );

    dragState.targetIds.forEach((fixtureId) => {
      const initial = dragState.initialPositions.get(fixtureId);
      if (!initial) return;

      const nextX = initial.x + clampedDeltaX;
      const offsetX = nextX - nearestBar.x;

      setProgrammerAttachment(
        fixtureId,
        nearestBar.id,
        offsetX
      );
      setProgrammerPosition(fixtureId, {
        x: nextX,
        y: nearestBar.y,
        z: nearestBar.z,
      });
    });

    const anchorInitial =
      dragState.initialPositions.get(dragState.targetIds[0]);

    const anchorX =
      (anchorInitial?.x ?? intersection.x) + clampedDeltaX;

    setSnapPreviewBarId(nearestBar.id);
    setDragGuide({
      x: anchorX,
      y: nearestBar.y,
      z: nearestBar.z,
      offsetX: anchorX - nearestBar.x,
      barName: nearestBar.name,
      count: dragState.targetIds.length,
    });
  };

  const handlePointerUp = (event: any) => {
    event.stopPropagation();
    finishDirectDrag(event);
  };

  useEffect(() => () => finishDirectDrag(), []);

  const handleDoubleClick = (
    event: THREE.Event & {
      stopPropagation: () => void;
    }
  ) => {
    event.stopPropagation();

    setProgrammerPower(id, !powered);
  };

  const handlePointerOver = (
    event: THREE.Event & {
      stopPropagation: () => void;
    }
  ) => {
    event.stopPropagation();

    setHoveredLight(id);

    document.body.style.cursor =
      "pointer";
  };

  const handlePointerOut = (
    event: THREE.Event & {
      stopPropagation: () => void;
    }
  ) => {
    event.stopPropagation();

    setHoveredLight(null);

    document.body.style.cursor =
      "default";
  };

  return (
    <>
      <FixtureBody
        type={type}
        x={x}
        y={visualY}
        z={z}
        color={color}
        powered={powered}
        selected={selected}
        hovered={hovered}
        programmed={programmed}
        attachedToBar={
          attachedToBar
        }
        visualPan={visualPan}
        visualTilt={visualTilt}
        onSelect={handleSelect}
        onDoubleClick={
          handleDoubleClick
        }
        onPointerOver={
          handlePointerOver
        }
        onPointerOut={
          handlePointerOut
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {/* Target invisible del spotlight */}
      <object3D
        ref={targetRef}
        position={[
          targetPosition.x,
          targetPosition.y,
          targetPosition.z,
        ]}
      />

      {/* Luz real de Three.js */}
      {isOn && (
        <spotLight
          ref={lightRef}
          position={[
            x,
            visualY,
            z,
          ]}
          color={color}
          intensity={
            intensity / 25
          }
          angle={angle}
          penumbra={0.5}
          distance={40}
          decay={1.5}
          castShadow
        />
      )}

      {/* Haz visible */}
      {isOn && (
        <FixtureBeam
          color={color}
          selected={selected}
          hovered={hovered}
          beamLength={
            beamLength
          }
          beamRadius={
            beamRadius
          }
          beamMidpoint={
            beamMidpoint
          }
          beamQuaternion={
            beamQuaternion
          }
        />
      )}

      {/* Mancha sobre el piso */}
      {isOn && (
        <FixtureFloorHit
          color={color}
          intensity={intensity}
          selected={selected}
          targetPosition={
            targetPosition
          }
          beamRadius={
            beamRadius
          }
        />
      )}
    </>
  );
}