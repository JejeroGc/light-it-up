import { useStageStore } from "../../../store/stageStore";
import CollapsibleSection from "../CollapsibleSection";
import { itemStyle } from "./styles";

export default function BarsPanel() {
  const { bars, selectedBarId, selectBar } = useStageStore();
  return <CollapsibleSection title="Bars"><div style={{ marginLeft: 12 }}>
    {bars.length === 0 && <p style={{ marginTop: 0, opacity: .55, fontSize: 13 }}>No hay varas en el escenario.</p>}
    {bars.map((bar) => <button type="button" key={bar.id} onClick={() => selectBar(bar.id)} style={itemStyle(selectedBarId === bar.id)}>
      <strong style={{ color: selectedBarId === bar.id ? "#ffe08a" : "#ffffff", fontWeight: 700 }}>{bar.name}</strong><br/><small style={{ color: selectedBarId === bar.id ? "#e7c96b" : "#b9bec8", opacity: 1 }}>Y {bar.y.toFixed(1)} · Z {bar.z.toFixed(1)}</small>
    </button>)}
  </div></CollapsibleSection>;
}
