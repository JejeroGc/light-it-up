type StageArchitectureProps = {
  width: number;
  depth: number;
  height: number;
};

export default function StageArchitecture({ width, depth, height }: StageArchitectureProps) {
  const sideX = width / 2 + 0.18;
  const backZ = -depth / 2 - 0.12;

  return (
    <group>
      {/* Proscenium columns */}
      {[-sideX, sideX].map((x) => (
        <group key={x} position={[x, height / 2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.28, height, 0.34]} />
            <meshStandardMaterial color="#17191d" metalness={0.22} roughness={0.72} />
          </mesh>
          <mesh position={[0, 0, 0.19]} castShadow>
            <boxGeometry args={[0.12, height * 0.92, 0.08]} />
            <meshStandardMaterial color="#0b0c0f" metalness={0.45} roughness={0.45} />
          </mesh>
        </group>
      ))}

      {/* Header beam */}
      <mesh position={[0, height - 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.65, 0.36, 0.38]} />
        <meshStandardMaterial color="#15171b" metalness={0.35} roughness={0.58} />
      </mesh>

      {/* Back wall depth */}
      <mesh position={[0, height / 2, backZ]} receiveShadow>
        <boxGeometry args={[width + 0.7, height, 0.2]} />
        <meshStandardMaterial color="#111318" metalness={0.04} roughness={0.98} />
      </mesh>

      {/* Stage lip */}
      <mesh position={[0, 0.11, depth / 2 + 0.12]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.3, 0.22, 0.28]} />
        <meshStandardMaterial color="#090a0d" metalness={0.18} roughness={0.7} />
      </mesh>
    </group>
  );
}
