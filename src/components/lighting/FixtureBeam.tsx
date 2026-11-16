import * as THREE from "three";

type FixtureBeamProps = {
  color: string;
  selected: boolean;
  hovered: boolean;
  beamLength: number;
  beamRadius: number;
  beamMidpoint: THREE.Vector3;
  beamQuaternion: THREE.Quaternion;
};

export default function FixtureBeam({ color, selected, hovered, beamLength, beamRadius, beamMidpoint, beamQuaternion }: FixtureBeamProps) {
  const boost = selected ? 1.45 : hovered ? 1.2 : 1;
  const position: [number, number, number] = [beamMidpoint.x, beamMidpoint.y, beamMidpoint.z];

  return (
    <group position={position} quaternion={beamQuaternion}>
      <mesh renderOrder={1}>
        <coneGeometry args={[beamRadius * 1.04, beamLength, 24, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.032 * boost} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh renderOrder={2} scale={[0.76, 1, 0.76]}>
        <coneGeometry args={[beamRadius, beamLength * 0.998, 24, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.055 * boost} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh renderOrder={3} scale={[0.38, 0.995, 0.38]}>
        <coneGeometry args={[beamRadius, beamLength, 18, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.075 * boost} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}
