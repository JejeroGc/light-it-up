export default function SceneEnvironment() {
  return (
    <>
      <color attach="background" args={["#111318"]} />
      <fog attach="fog" args={["#111318", 22, 52]} />
    </>
  );
}
