import * as THREE from "three";

type FixtureFloorHitProps = {
  color: string;
  intensity: number;
  selected: boolean;

  targetPosition: THREE.Vector3;
  beamRadius: number;
};

export default function FixtureFloorHit({
  color,
  intensity,
  selected,
  targetPosition,
  beamRadius,
}: FixtureFloorHitProps) {
  return (
    <>
      {/* Mancha de luz sobre el piso */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[
          targetPosition.x,
          0.015,
          targetPosition.z,
        ]}
      >
        <circleGeometry args={[beamRadius, 28]} />

        <meshBasicMaterial
          color={color}
          transparent
          opacity={Math.min(
            intensity / 620,
            0.32
          )}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Indicador del punto de impacto */}
      {selected && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[
            targetPosition.x,
            0.025,
            targetPosition.z,
          ]}
        >
          <ringGeometry
            args={[
              Math.max(
                beamRadius - 0.04,
                0.01
              ),
              beamRadius,
              28,
            ]}
          />

          <meshBasicMaterial
            color="#ffcc00"
            transparent
            opacity={0.75}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  );
}