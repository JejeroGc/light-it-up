import { useMemo } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";

import { useLightingStore } from "../../store/lightingStore";
import { useProgrammerStore } from "../../store/programmerStore";
import { useStageStore } from "../../store/stageStore";
import { useViewportStore, type FocusPoint } from "../../store/viewportStore";
import { calculatePanTiltToTarget } from "../../core/lighting/beamMath";

const TARGET_Y = 0.035;

function FocusMarker({ point, preview = false }: { point: FocusPoint; preview?: boolean }) {
  const materialProps = useMemo(
    () => ({ color: preview ? "#8be9fd" : "#ffd36a", transparent: true, opacity: preview ? 0.75 : 1 }),
    [preview]
  );

  return (
    <group position={[point.x, point.y + 0.015, point.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.23, 48]} />
        <meshBasicMaterial {...materialProps} depthTest={false} />
      </mesh>
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.045, 0.075, 32]} />
        <meshBasicMaterial {...materialProps} depthTest={false} />
      </mesh>
      <mesh position={[0.34, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.012, 0.34, 0.012]} />
        <meshBasicMaterial {...materialProps} depthTest={false} />
      </mesh>
      <mesh position={[-0.34, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.012, 0.34, 0.012]} />
        <meshBasicMaterial {...materialProps} depthTest={false} />
      </mesh>
      <mesh position={[0, 0.01, 0.34]}>
        <boxGeometry args={[0.012, 0.012, 0.34]} />
        <meshBasicMaterial {...materialProps} depthTest={false} />
      </mesh>
      <mesh position={[0, 0.01, -0.34]}>
        <boxGeometry args={[0.012, 0.012, 0.34]} />
        <meshBasicMaterial {...materialProps} depthTest={false} />
      </mesh>
    </group>
  );
}

export default function FocusTarget() {
  const transformMode = useViewportStore((state) => state.transformMode);
  const focusTarget = useViewportStore((state) => state.focusTarget);
  const focusPreview = useViewportStore((state) => state.focusPreview);
  const setFocusTarget = useViewportStore((state) => state.setFocusTarget);
  const setFocusPreview = useViewportStore((state) => state.setFocusPreview);

  const width = useStageStore((state) => state.width);
  const depth = useStageStore((state) => state.depth);

  const lights = useLightingStore((state) => state.lights);
  const selectedLightIds = useLightingStore((state) => state.selectedLightIds);

  const applyFocus = (point: FocusPoint) => {
    const programmer = useProgrammerStore.getState();

    for (const id of selectedLightIds) {
      const light = lights.find((item) => item.id === id);
      if (!light) continue;

      const { pan, tilt } = calculatePanTiltToTarget(light.position, point);
      programmer.setPan(id, pan);
      programmer.setTilt(id, tilt);
    }
  };

  if (transformMode !== "focus") {
    return focusTarget ? <FocusMarker point={focusTarget} /> : null;
  }

  const pointFromEvent = (event: ThreeEvent<PointerEvent>): FocusPoint => ({
    x: THREE.MathUtils.clamp(event.point.x, -width / 2, width / 2),
    y: TARGET_Y,
    z: THREE.MathUtils.clamp(event.point.z, -depth / 2, depth / 2),
  });

  return (
    <>
      <mesh
        position={[0, TARGET_Y, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={(event) => {
          event.stopPropagation();
          setFocusPreview(pointFromEvent(event));
          document.body.style.cursor = "crosshair";
        }}
        onPointerOut={() => {
          setFocusPreview(null);
          document.body.style.cursor = "default";
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.stopPropagation();
          const point = pointFromEvent(event);
          setFocusTarget(point);
          setFocusPreview(point);
          applyFocus(point);
        }}
      >
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>

      {focusTarget && <FocusMarker point={focusTarget} />}
      {focusPreview && <FocusMarker point={focusPreview} preview />}
    </>
  );
}
