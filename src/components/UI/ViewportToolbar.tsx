import type {
  TransformMode,
  ViewMode,
} from "../../store/viewportStore";

import { useViewportStore } from "../../store/viewportStore";
import { useLightingStore } from "../../store/lightingStore";

const views: { label: string; value: ViewMode }[] = [
  { label: "Persp", value: "perspective" },
  { label: "Top", value: "top" },
  { label: "Front", value: "front" },
  { label: "Side", value: "side" },
];

const tools: { label: string; value: TransformMode }[] = [
  { label: "Select", value: "select" },
  { label: "Move", value: "translate" },
  { label: "Rotate", value: "rotate" },
  { label: "Focus", value: "focus" },
];

export default function ViewportToolbar() {
  const { viewMode, transformMode, setViewMode, setTransformMode } =
    useViewportStore();
  const selectedCount = useLightingStore((state) => state.selectedLightIds.length);

  const buttonStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 10px",
    borderRadius: 8,
    border: active ? "1px solid #ffd36a" : "1px solid #3a3a3a",
    background: active ? "#3a2a10" : "#222",
    color: active ? "#ffd36a" : "#ddd",
    cursor: "pointer",
    fontSize: 12,
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        zIndex: 20,
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: 6 }}>
        {tools.map((tool) => (
          <button
            key={tool.value}
            style={{
              ...buttonStyle(transformMode === tool.value),
              ...(tool.value === "focus" && selectedCount === 0
                ? { opacity: 0.45, cursor: "not-allowed" }
                : {}),
            }}
            disabled={tool.value === "focus" && selectedCount === 0}
            title={tool.value === "focus" ? "Focus (F): apuntar la selección a un punto del escenario" : undefined}
            onClick={() => setTransformMode(tool.value)}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {transformMode === "focus" && (
        <div style={{ fontSize: 11, color: "#ffd36a", whiteSpace: "nowrap" }}>
          Click en el escenario · {selectedCount} foco{selectedCount === 1 ? "" : "s"}
        </div>
      )}

      <div
        style={{
          width: 1,
          height: 24,
          background: "#444",
        }}
      />

      <div style={{ display: "flex", gap: 6 }}>
        {views.map((view) => (
          <button
            key={view.value}
            style={buttonStyle(viewMode === view.value)}
            onClick={() => setViewMode(view.value)}
          >
            {view.label}
          </button>
        ))}
      </div>
    </div>
  );
}