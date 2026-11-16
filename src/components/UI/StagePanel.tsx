import { useStageStore } from "../../store/stageStore";
import { useLightingStore } from "../../store/lightingStore";

export default function StagePanel() {
  const {
    width,
    depth,
    height,
    bars,
    setWidth,
    setDepth,
    setHeight,
    addBar,
    removeBar,
    updateBar,
  } = useStageStore();

  const { lights, updateLightPosition } = useLightingStore();

  const updateBarAndFixtures = (
    barId: number,
    updates: { y?: number; z?: number; width?: number; name?: string }
  ) => {
    updateBar(barId, updates);

    const bar = bars.find((bar) => bar.id === barId);
    if (!bar) return;

    const updatedBar = { ...bar, ...updates };

    lights
      .filter((light) => light.barId === barId)
      .forEach((light) => {
        updateLightPosition(light.id, {
          x: updatedBar.x + light.offsetX,
          y: updatedBar.y,
          z: updatedBar.z,
        });
      });
  };

  const sliderStyle: React.CSSProperties = {
    width: "100%",
    marginBottom: 12,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 6,
    fontSize: 13,
    color: "#ddd",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "7px 8px",
    borderRadius: 6,
    border: "1px solid #444",
    background: "#202020",
    color: "#ddd",
    marginBottom: 10,
  };

  return (
    <section>
      <h3 style={{ marginTop: 0 }}>Stage Builder</h3>

      <label style={labelStyle}>Ancho: {width} m</label>
      <input
        style={sliderStyle}
        type="range"
        min={6}
        max={24}
        step={0.5}
        value={width}
        onChange={(e) => setWidth(Number(e.target.value))}
      />

      <label style={labelStyle}>Profundidad: {depth} m</label>
      <input
        style={sliderStyle}
        type="range"
        min={4}
        max={20}
        step={0.5}
        value={depth}
        onChange={(e) => setDepth(Number(e.target.value))}
      />

      <label style={labelStyle}>Altura: {height} m</label>
      <input
        style={sliderStyle}
        type="range"
        min={3}
        max={12}
        step={0.5}
        value={height}
        onChange={(e) => {
          const newHeight = Number(e.target.value);
          setHeight(newHeight);

          bars.forEach((bar) => {
            const updatedY = newHeight - 0.4;

            lights
              .filter((light) => light.barId === bar.id)
              .forEach((light) => {
                updateLightPosition(light.id, {
                  x: bar.x + light.offsetX,
                  y: updatedY,
                  z: bar.z,
                });
              });
          });
        }}
      />

      <hr style={{ borderColor: "#333", margin: "18px 0" }} />

      <button
        onClick={addBar}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #444",
          background: "#222",
          color: "#ddd",
          cursor: "pointer",
          marginBottom: 14,
        }}
      >
        + Agregar vara
      </button>

      {bars.map((bar) => (
        <div
          key={bar.id}
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #333",
            background: "#1b1b1b",
            marginBottom: 12,
          }}
        >
          <input
            style={inputStyle}
            value={bar.name}
            onChange={(e) =>
              updateBarAndFixtures(bar.id, { name: e.target.value })
            }
          />

          <label style={labelStyle}>Altura Y: {bar.y} m</label>
          <input
            style={sliderStyle}
            type="range"
            min={2}
            max={height}
            step={0.1}
            value={bar.y}
            onChange={(e) =>
              updateBarAndFixtures(bar.id, {
                y: Number(e.target.value),
              })
            }
          />

          <label style={labelStyle}>Profundidad Z: {bar.z} m</label>
          <input
            style={sliderStyle}
            type="range"
            min={-depth}
            max={depth}
            step={0.1}
            value={bar.z}
            onChange={(e) =>
              updateBarAndFixtures(bar.id, {
                z: Number(e.target.value),
              })
            }
          />

          <label style={labelStyle}>Longitud: {bar.width} m</label>
          <input
            style={sliderStyle}
            type="range"
            min={2}
            max={width}
            step={0.5}
            value={bar.width}
            onChange={(e) =>
              updateBarAndFixtures(bar.id, {
                width: Number(e.target.value),
              })
            }
          />

          <button
            onClick={() => removeBar(bar.id)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #5a2a2a",
              background: "#2a1515",
              color: "#ffb4b4",
              cursor: "pointer",
            }}
          >
            Eliminar vara
          </button>
        </div>
      ))}
    </section>
  );
}