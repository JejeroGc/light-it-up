import { useMemo } from "react";
import * as THREE from "three";

type CycloramaProps = {
  width: number;
  depth: number;
  height: number;
};

export default function Cyclorama({
  width,
  depth,
  height,
}: CycloramaProps) {
  const geometry = useMemo(() => {
    const segments = 18;
    const radius = Math.min(1.5, height * 0.25);
    const backZ = -depth / 2;
    const positions: number[] = [];
    const indices: number[] = [];

    for (let side = 0; side < 2; side += 1) {
      const x = side === 0 ? -width / 2 : width / 2;

      for (let index = 0; index <= segments; index += 1) {
        const progress = index / segments;
        const angle = progress * Math.PI * 0.5;
        const y = radius - Math.cos(angle) * radius;
        const z = backZ + radius - Math.sin(angle) * radius;
        positions.push(x, y, z);
      }

      positions.push(x, height, backZ);
    }

    const rowLength = segments + 2;

    for (let index = 0; index < rowLength - 1; index += 1) {
      const leftA = index;
      const leftB = index + 1;
      const rightA = rowLength + index;
      const rightB = rowLength + index + 1;

      indices.push(leftA, rightA, leftB);
      indices.push(leftB, rightA, rightB);
    }

    const result = new THREE.BufferGeometry();
    result.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    result.setIndex(indices);
    result.computeVertexNormals();

    return result;
  }, [width, depth, height]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        color="#34373d"
        roughness={0.96}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
