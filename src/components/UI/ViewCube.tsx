import { useViewportStore } from "../../store/viewportStore";

export default function ViewCube() {
  const { viewMode, setViewMode } = useViewportStore();

  const button = (
    label: string,
    value: "perspective" | "top" | "front" | "side"
  ) => (
    <button
      onClick={() => setViewMode(value)}
      style={{
        width: 64,
        height: 30,
        borderRadius: 6,
        cursor: "pointer",

        border:
          viewMode === value
            ? "1px solid #ffd36a"
            : "1px solid #444",

        background:
          viewMode === value
            ? "#3a2a10"
            : "#222",

        color:
          viewMode === value
            ? "#ffd36a"
            : "#ddd",

        fontSize: 11,
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 14,
        right: 14,

        display: "grid",
        gridTemplateColumns: "repeat(3,64px)",
        gap: 6,

        zIndex: 40,
      }}
    >
      <div />

      {button("TOP", "top")}

      <div />

      {button("LEFT", "side")}

      {button("FRONT", "front")}

      {button("PERSP", "perspective")}
    </div>
  );
}