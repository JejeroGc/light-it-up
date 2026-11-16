import type { MouseEvent } from "react";
import { useLightingStore } from "../../../store/lightingStore";
import { useProgrammerStore } from "../../../store/programmerStore";
import { resolveFixture } from "../../../core/lighting/resolveFixture";
import { usePresetStore } from "../../../store/presetStore";
import CollapsibleSection from "../CollapsibleSection";
import { createButtonStyle, itemStyle, secondaryButtonStyle } from "./styles";

const toDegrees = (value: number) => Math.round(value * 180 / Math.PI);

export default function PresetsPanel() {
  const { lights, selectedLightIds } = useLightingStore();
  const {
    edits: programmerEdits,
    setColor,
    setBeamAngle,
    setPan,
    setTilt,
  } = useProgrammerStore();
  const { presets, createColorPreset, createBeamPreset, createPositionPreset, renamePreset, removePreset } = usePresetStore();
  const enabled = selectedLightIds.length > 0;
  const selectedLight = lights.find((light) => light.id === selectedLightIds[0]);
  const resolvedSelectedLight = selectedLight
    ? resolveFixture(selectedLight, programmerEdits[selectedLight.id])
    : undefined;

  const createColor = () => {
    if (!resolvedSelectedLight) return;
    const count = presets.filter((preset) => preset.type === "color").length;
    const name = window.prompt("Nombre del preset de color:", `Color ${count + 1}`);
    if (name !== null) createColorPreset(name, resolvedSelectedLight.color);
  };
  const createBeam = () => {
    if (!resolvedSelectedLight) return;
    const count = presets.filter((preset) => preset.type === "beam").length;
    const name = window.prompt("Nombre del preset de beam:", `Beam ${count + 1}`);
    if (name !== null) createBeamPreset(name, resolvedSelectedLight.beamAngle);
  };
  const createPosition = () => {
    if (!resolvedSelectedLight) return;
    const count = presets.filter((preset) => preset.type === "position").length;
    const name = window.prompt("Nombre del preset de posición:", `Posición ${count + 1}`);
    if (name !== null) {
      const fixtureValues = Object.fromEntries(
        selectedLightIds
          .map((fixtureId) => {
            const fixture = lights.find((light) => light.id === fixtureId);
            if (!fixture) return null;
            const resolved = resolveFixture(fixture, programmerEdits[fixture.id]);
            return [fixtureId, { pan: resolved.pan, tilt: resolved.tilt }] as const;
          })
          .filter((entry): entry is readonly [number, { pan: number; tilt: number }] => entry !== null)
      );
      createPositionPreset(
        name,
        resolvedSelectedLight.pan,
        resolvedSelectedLight.tilt,
        fixtureValues
      );
    }
  };
  const rename = (event: MouseEvent<HTMLButtonElement>, id:number, current:string) => {
    event.stopPropagation();
    const name = window.prompt("Nuevo nombre del preset:", current);
    if (name !== null) renamePreset(id, name);
  };
  const remove = (event: MouseEvent<HTMLButtonElement>, id:number, name:string) => {
    event.stopPropagation();
    if (window.confirm(`¿Eliminar el preset "${name}"?`)) removePreset(id);
  };

  return <CollapsibleSection title="Presets"><div style={{ marginLeft: 12 }}>
    <button type="button" onClick={createColor} disabled={!enabled} style={createButtonStyle(enabled)}>+ Crear preset de color</button>
    <button type="button" onClick={createBeam} disabled={!enabled} style={createButtonStyle(enabled)}>+ Crear preset de beam</button>
    <button type="button" onClick={createPosition} disabled={!enabled} style={createButtonStyle(enabled)}>+ Crear preset de posición</button>
    {presets.length === 0 && <p style={{marginTop:0,opacity:.55,fontSize:13}}>No hay presets creados.</p>}
    {presets.map((preset) => <div key={preset.id} style={{marginBottom:8}}>
      <button type="button" disabled={!enabled} onClick={() => {
        selectedLightIds.forEach((fixtureId) => {
          if (preset.type === "color") setColor(fixtureId, preset.color);
          if (preset.type === "beam") setBeamAngle(fixtureId, preset.beamAngle);
          if (preset.type === "position") {
            const fixturePosition = preset.fixtureValues?.[fixtureId];
            setPan(fixtureId, fixturePosition?.pan ?? preset.pan);
            setTilt(fixtureId, fixturePosition?.tilt ?? preset.tilt);
          }
        });
      }} style={{...itemStyle(false),marginBottom:4,display:"flex",alignItems:"center",gap:10,cursor:enabled?"pointer":"not-allowed",opacity:enabled?1:.5}}>
        <span style={{width:22,height:22,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:5,border:"1px solid #666",background:preset.type === "color" ? preset.color : "#252525",color:"#ffd36a",fontSize:12}}>{preset.type === "beam" ? "◇" : preset.type === "position" ? "↗" : ""}</span>
        <span><strong>{preset.name}</strong><br/><small>{preset.type === "color" && `Color · ${preset.color.toUpperCase()}`}{preset.type === "beam" && `Beam · ${toDegrees(preset.beamAngle)}°`}{preset.type === "position" && `Position · ${preset.fixtureValues ? `${Object.keys(preset.fixtureValues).length} focos` : `Pan ${toDegrees(preset.pan)}° · Tilt ${toDegrees(preset.tilt)}°`}`}</small></span>
      </button>
      <div style={{display:"flex",gap:6}}><button type="button" onClick={(e)=>rename(e,preset.id,preset.name)} style={{...secondaryButtonStyle,flex:1}}>Renombrar</button><button type="button" onClick={(e)=>remove(e,preset.id,preset.name)} style={{...secondaryButtonStyle,flex:1,color:"#ff9a9a"}}>Eliminar</button></div>
    </div>)}
  </div></CollapsibleSection>;
}
