import { Grid } from "@react-three/drei";

export default function ViewportGrid() {
  return (
    <group position={[0, 0.006, 0]}>
      <Grid
        args={[40, 40]}
        cellSize={1}
        cellThickness={0.35}
        cellColor="#343840"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#515761"
        fadeDistance={34}
        fadeStrength={1.7}
        infiniteGrid
      />
    </group>
  );
}
