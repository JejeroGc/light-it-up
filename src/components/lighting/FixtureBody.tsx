import * as THREE from "three";

import type {
  FixtureType,
} from "../../store/lightingStore";

import FixtureModel from "./FixtureModel";

type FixtureBodyProps = {
  type: FixtureType;

  x: number;
  y: number;
  z: number;

  color: string;

  powered: boolean;
  selected: boolean;
  hovered: boolean;
  programmed: boolean;
  attachedToBar: boolean;

  visualPan: number;
  visualTilt: number;

  onSelect: (
    event: THREE.Event & {
      stopPropagation: () => void;
    }
  ) => void;

  onDoubleClick: (
    event: THREE.Event & {
      stopPropagation: () => void;
    }
  ) => void;

  onPointerOver: (
    event: THREE.Event & {
      stopPropagation: () => void;
    }
  ) => void;

  onPointerOut: (
    event: THREE.Event & {
      stopPropagation: () => void;
    }
  ) => void;

  onPointerDown: (event: any) => void;
  onPointerMove: (event: any) => void;
  onPointerUp: (event: any) => void;
};

export default function FixtureBody({
  type,
  x,
  y,
  z,
  color,
  powered,
  selected,
  hovered,
  programmed,
  attachedToBar,
  visualPan,
  visualTilt,
  onSelect,
  onDoubleClick,
  onPointerOver,
  onPointerOut,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: FixtureBodyProps) {
  const fixtureScale =
    type === "wash"
      ? 1.08
      : type === "beam"
      ? 0.88
      : type === "moving"
      ? 1.15
      : 1;

  /*
   * Prioridad visual:
   *
   * Selección
   * Hover
   * Programmer
   * Estado normal
   */
  const fixtureColor = selected
    ? "#ffcc00"
    : hovered
    ? "#38bdf8"
    : programmed
    ? "#7a6424"
    : powered
    ? "#222222"
    : "#111111";

  const supportColor = selected
    ? "#ffcc00"
    : hovered
    ? "#38bdf8"
    : programmed
    ? "#ffd36a"
    : "#151515";

  const lensColor = powered
    ? color
    : "#080808";

  const lensEmissive = powered
    ? color
    : "#000000";

  const lensEmissiveIntensity =
    selected
      ? 0.9
      : hovered
      ? 0.8
      : programmed
      ? 0.85
      : powered
      ? 0.7
      : 0;

  return (
    <group
      position={[x, y, z]}
      scale={fixtureScale}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/*
       * Aro dorado que indica que
       * el fixture tiene valores
       * pendientes en Programmer.
       */}
      {programmed && (
        <mesh
          position={[
            0,
            attachedToBar
              ? 0.58
              : 0.42,
            0,
          ]}
          rotation={[
            Math.PI / 2,
            0,
            0,
          ]}
        >
          <torusGeometry
            args={[
              0.44,
              0.035,
              12,
              40,
            ]}
          />

          <meshBasicMaterial
            color="#ffd36a"
            transparent
            opacity={0.9}
          />
        </mesh>
      )}

      {/* Abrazadera y unión */}
      {attachedToBar && (
        <>
          <mesh
            position={[
              0,
              0.42,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.58,
                0.12,
                0.28,
              ]}
            />

            <meshStandardMaterial
              color={supportColor}
            />
          </mesh>

          <mesh
            position={[
              0,
              0.31,
              0,
            ]}
          >
            <cylinderGeometry
              args={[
                0.07,
                0.07,
                0.18,
                24,
              ]}
            />

            <meshStandardMaterial
              color={supportColor}
            />
          </mesh>
        </>
      )}

      {/* Yugo */}
      <group
        rotation={[
          0,
          visualPan,
          0,
        ]}
      >
        {/* Parte superior */}
        <mesh
          position={[
            0,
            0.2,
            0,
          ]}
        >
          <boxGeometry
            args={[
              0.72,
              0.08,
              0.1,
            ]}
          />

          <meshStandardMaterial
            color={supportColor}
          />
        </mesh>

        {/* Brazo izquierdo */}
        <mesh
          position={[
            -0.34,
            -0.03,
            0,
          ]}
        >
          <boxGeometry
            args={[
              0.08,
              0.48,
              0.1,
            ]}
          />

          <meshStandardMaterial
            color={supportColor}
          />
        </mesh>

        {/* Brazo derecho */}
        <mesh
          position={[
            0.34,
            -0.03,
            0,
          ]}
        >
          <boxGeometry
            args={[
              0.08,
              0.48,
              0.1,
            ]}
          />

          <meshStandardMaterial
            color={supportColor}
          />
        </mesh>

        {/* Eje izquierdo */}
        <mesh
          position={[
            -0.3,
            -0.1,
            0,
          ]}
          rotation={[
            0,
            0,
            Math.PI / 2,
          ]}
        >
          <cylinderGeometry
            args={[
              0.07,
              0.07,
              0.12,
              24,
            ]}
          />

          <meshStandardMaterial
            color={supportColor}
          />
        </mesh>

        {/* Eje derecho */}
        <mesh
          position={[
            0.3,
            -0.1,
            0,
          ]}
          rotation={[
            0,
            0,
            Math.PI / 2,
          ]}
        >
          <cylinderGeometry
            args={[
              0.07,
              0.07,
              0.12,
              24,
            ]}
          />

          <meshStandardMaterial
            color={supportColor}
          />
        </mesh>

        {/* Cuerpo inclinable */}
        <group
          position={[
            0,
            -0.1,
            0,
          ]}
          rotation={[
            visualTilt,
            0,
            0,
          ]}
          onClick={onSelect}
          onDoubleClick={
            onDoubleClick
          }
          onPointerOver={
            onPointerOver
          }
          onPointerOut={
            onPointerOut
          }
        >
          <FixtureModel
            type={type}
            fixtureColor={
              fixtureColor
            }
            supportColor={
              supportColor
            }
            lensColor={
              lensColor
            }
            lensEmissive={
              lensEmissive
            }
            lensEmissiveIntensity={
              lensEmissiveIntensity
            }
          />
        </group>
      </group>
    </group>
  );
}