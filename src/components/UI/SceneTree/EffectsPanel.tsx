import CollapsibleSection from "../CollapsibleSection";
import { useLightingStore } from "../../../store/lightingStore";
import { useEffectStore, type EffectType } from "../../../store/effectStore";
import { createButtonStyle, secondaryButtonStyle } from "./styles";

const effectOptions: Array<{ type: EffectType; label: string; hint: string }> = [
  { type: "strobe", label: "Strobe", hint: "Destello rítmico" },
  { type: "pulse", label: "Pulse", hint: "Sube y baja intensidad" },
  { type: "chase", label: "Chase", hint: "Recorre la selección" },
  { type: "flicker", label: "Flicker", hint: "Parpadeo orgánico" },
  { type: "color-chase", label: "Color Chase", hint: "Secuencia de color" },
];

export default function EffectsPanel() {
  const selectedLightIds = useLightingStore((state) => state.selectedLightIds);
  const { effects, addEffect, toggleEffect, updateEffect, removeEffect, stopAllEffects } = useEffectStore();
  const enabled = selectedLightIds.length > 0;

  const createEffect = (type: EffectType) => {
    addEffect({
      type,
      fixtureIds: selectedLightIds,
      speed: type === "strobe" ? 8 : type === "flicker" ? 5 : 1.5,
      amount: 0.85,
    });
  };

  return (
    <CollapsibleSection title="Effects">
      <div style={{ marginLeft: 12 }}>
        <p style={{ margin: "0 0 8px", fontSize: 12, opacity: 0.6 }}>
          Aplicá efectos en tiempo real a la selección o a un grupo seleccionado.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
          {effectOptions.map((option) => (
            <button
              key={option.type}
              type="button"
              disabled={!enabled}
              title={option.hint}
              onClick={() => createEffect(option.type)}
              style={{ ...createButtonStyle(enabled), marginBottom: 0, padding: "8px 6px", fontSize: 12 }}
            >
              + {option.label}
            </button>
          ))}
        </div>

        {effects.length === 0 && (
          <p style={{ marginTop: 0, opacity: 0.55, fontSize: 13 }}>No hay efectos activos.</p>
        )}

        {effects.map((effect) => (
          <div key={effect.id} style={{ border: "1px solid #3a3a3a", borderRadius: 8, padding: 8, marginBottom: 8, background: "#202020" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <strong style={{ fontSize: 13 }}>{effect.name}</strong>
                <div style={{ fontSize: 11, opacity: 0.55 }}>{effect.fixtureIds.length} luminaria{effect.fixtureIds.length === 1 ? "" : "s"}</div>
              </div>
              <button type="button" onClick={() => toggleEffect(effect.id)} style={{ ...secondaryButtonStyle, color: effect.active ? "#ffd36a" : "#aaa" }}>
                {effect.active ? "ON" : "OFF"}
              </button>
            </div>

            <label style={{ display: "block", fontSize: 11, marginTop: 8, opacity: 0.75 }}>Velocidad · {effect.speed.toFixed(1)}x</label>
            <input
              type="range"
              min="0.2"
              max="12"
              step="0.1"
              value={effect.speed}
              onChange={(event) => updateEffect(effect.id, { speed: Number(event.target.value) })}
              style={{ width: "100%" }}
            />

            {effect.type !== "color-chase" && (
              <>
                <label style={{ display: "block", fontSize: 11, marginTop: 4, opacity: 0.75 }}>Profundidad · {Math.round(effect.amount * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={effect.amount}
                  onChange={(event) => updateEffect(effect.id, { amount: Number(event.target.value) })}
                  style={{ width: "100%" }}
                />
              </>
            )}

            <button type="button" onClick={() => removeEffect(effect.id)} style={{ ...secondaryButtonStyle, width: "100%", marginTop: 6, color: "#ff9a9a" }}>
              Eliminar
            </button>
          </div>
        ))}

        {effects.some((effect) => effect.active) && (
          <button type="button" onClick={stopAllEffects} style={{ ...secondaryButtonStyle, width: "100%" }}>Detener todos</button>
        )}
      </div>
    </CollapsibleSection>
  );
}
