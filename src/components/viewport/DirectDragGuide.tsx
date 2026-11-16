import { Html } from "@react-three/drei";
import { useViewportStore } from "../../store/viewportStore";

export default function DirectDragGuide() {
  const guide = useViewportStore((state) => state.dragGuide);

  if (!guide) return null;

  return (
    <group position={[guide.x, guide.y + 0.35, guide.z]}>
      <mesh position={[0, -0.34, 0]}>
        <boxGeometry args={[0.035, 0.68, 0.035]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} />
      </mesh>
      <Html center distanceFactor={8} style={{ pointerEvents: "none" }}>
        <div
          style={{
            whiteSpace: "nowrap",
            padding: "6px 9px",
            border: "1px solid rgba(56,189,248,.75)",
            borderRadius: 7,
            color: "#eaf9ff",
            background: "rgba(4,12,20,.9)",
            boxShadow: "0 8px 22px rgba(0,0,0,.38)",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {guide.barName} · {guide.offsetX >= 0 ? "+" : ""}{guide.offsetX.toFixed(2)} m
          {guide.count > 1 ? ` · ${guide.count} focos` : ""}
        </div>
      </Html>
    </group>
  );
}
