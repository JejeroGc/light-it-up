export default function StudioLighting() {
  return (
    <>
      <hemisphereLight
        args={["#cbd8ff", "#17130f", 0.75]}
      />

      <directionalLight
        position={[7, 12, 8]}
        intensity={2.1}
        color="#fff4df"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-bias={-0.00015}
      />

      <directionalLight
        position={[-8, 6, 4]}
        intensity={0.7}
        color="#9eb8ff"
      />

      <pointLight
        position={[0, 5, -7]}
        intensity={18}
        distance={24}
        decay={2}
        color="#dbe6ff"
      />
    </>
  );
}
