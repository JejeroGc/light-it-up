type StageDraperyProps = {
  width: number;
  depth: number;
  height: number;
};

const clothMaterial = (
  <meshStandardMaterial color="#090a0d" roughness={0.98} metalness={0} />
);

export default function StageDrapery({ width, depth, height }: StageDraperyProps) {
  const legHeight = height * 0.82;
  const legWidth = Math.max(0.52, width * 0.065);
  const zPositions = [-depth * 0.18, -depth * 0.38];

  return (
    <group>
      {/* Side legs create depth without blocking the working area. */}
      {zPositions.flatMap((z) =>
        [-1, 1].map((side) => (
          <group key={`${z}-${side}`} position={[side * (width / 2 - legWidth / 2), legHeight / 2, z]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[legWidth, legHeight, 0.075]} />
              {clothMaterial}
            </mesh>
            {Array.from({ length: 5 }, (_, index) => (
              <mesh key={index} position={[(index - 2) * (legWidth / 5.5), 0, 0.043]} castShadow>
                <boxGeometry args={[0.025, legHeight * 0.98, 0.025]} />
                <meshStandardMaterial color="#050608" roughness={1} />
              </mesh>
            ))}
          </group>
        ))
      )}

      {/* Overhead borders / bambalinas. */}
      {[-depth * 0.12, -depth * 0.34].map((z, index) => (
        <mesh key={z} position={[0, height - 0.7 - index * 0.18, z]} castShadow receiveShadow>
          <boxGeometry args={[width * 0.92, 0.72, 0.065]} />
          {clothMaterial}
        </mesh>
      ))}

      {/* Parted house curtain, kept open so fixtures and stage remain readable. */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (width * 0.42), height * 0.52, depth / 2 - 0.14]}>
          <mesh rotation={[0, side * -0.07, side * -0.025]} castShadow receiveShadow>
            <boxGeometry args={[width * 0.14, height * 0.88, 0.08]} />
            <meshStandardMaterial color="#270711" roughness={0.92} metalness={0} />
          </mesh>
          {Array.from({ length: 5 }, (_, index) => (
            <mesh key={index} position={[(index - 2) * width * 0.024, 0, 0.047]} castShadow>
              <boxGeometry args={[0.035, height * 0.85, 0.025]} />
              <meshStandardMaterial color="#150309" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
