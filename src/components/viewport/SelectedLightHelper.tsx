import * as THREE from "three";
import { useLightingStore } from "../../store/lightingStore";

export default function SelectedLightHelper() {
  const { lights, selectedLightId } = useLightingStore();

  const selectedLight = lights.find((light) => light.id === selectedLightId);

  if (!selectedLight) return null;

  const { x, y, z } = selectedLight.position;

  const beamLength = 5;
  const beamRadius = Math.tan(selectedLight.beamAngle) * beamLength;

  return (
    <group position={[x, y, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.58, 64]} />
        <meshBasicMaterial
          color="#ffd36a"
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
        />
      </mesh>

      <mesh position={[0, -beamLength / 2, 0]}>
        <coneGeometry args={[beamRadius, beamLength, 64, 1, true]} />
        <meshBasicMaterial
          color={selectedLight.color}
          wireframe
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([0, 0, 0, 0, -beamLength, 0]),
              3,
            ]}
          />
        </bufferGeometry>

        <lineBasicMaterial color="#ffd36a" transparent opacity={0.8} />
      </line>
    </group>
  );
}