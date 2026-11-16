import { Text } from "@react-three/drei";

type HangingBarProps = {
  width: number;
  x?: number;
  y: number;
  z: number;
  label: string;
  selected?: boolean;
  snapPreview?: boolean;
  onSelect?: () => void;
};

export default function HangingBar({
  width,
  x = 0,
  y,
  z,
  label,
  selected = false,
  snapPreview = false,
  onSelect,
}: HangingBarProps) {
  const accent = snapPreview ? "#38bdf8" : selected ? "#ffd36a" : "#1b1e24";
  const clampXs = [-width * 0.34, width * 0.34];

  return (
    <group position={[x, y, z]}>
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
          onSelect?.();
        }}
      >
        <cylinderGeometry args={[0.07, 0.07, width, 28]} />
        <meshStandardMaterial
          color={accent}
          metalness={0.88}
          roughness={0.22}
          emissive={snapPreview ? "#38bdf8" : selected ? "#ffd36a" : "#000000"}
          emissiveIntensity={snapPreview ? 0.5 : selected ? 0.18 : 0}
        />
      </mesh>

      {clampXs.map((clampX) => (
        <group key={clampX} position={[clampX, 0.02, 0]}>
          <mesh castShadow>
            <torusGeometry args={[0.095, 0.024, 12, 28]} />
            <meshStandardMaterial color="#0c0e12" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.34, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.65, 12]} />
            <meshStandardMaterial color="#5a5e67" metalness={0.95} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0.68, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.2, 18]} />
            <meshStandardMaterial color="#242830" metalness={0.85} roughness={0.24} />
          </mesh>
        </group>
      ))}

      {(selected || snapPreview) && (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.11, 0.11, width + 0.14, 18, 1, true]} />
          <meshBasicMaterial wireframe transparent opacity={0.82} color={snapPreview ? "#38bdf8" : "#ffd36a"} />
        </mesh>
      )}

      <Text
        position={[-width / 2 - 0.45, 0.02, 0]}
        fontSize={0.22}
        color={snapPreview ? "#38bdf8" : selected ? "#ffd36a" : "#d7d9de"}
        anchorX="right"
        anchorY="middle"
        outlineWidth={0.018}
        outlineColor="#050608"
        outlineOpacity={1}
        renderOrder={20}
        material-depthTest={false}
      >
        {label}
      </Text>
    </group>
  );
}
