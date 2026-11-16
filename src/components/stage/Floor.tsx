type FloorProps = {
  width: number;
  depth: number;
};

export default function Floor({ width, depth }: FloorProps) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial
        color="#24262a"
        roughness={0.88}
        metalness={0.08}
      />
    </mesh>
  );
}
