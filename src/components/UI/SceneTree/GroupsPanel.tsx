import type { MouseEvent } from "react";
import { useLightingStore } from "../../../store/lightingStore";
import CollapsibleSection from "../CollapsibleSection";
import { itemStyle, secondaryButtonStyle } from "./styles";

export default function GroupsPanel() {
  const { lights, groups, selectedLightIds, selectLight, selectGroup, renameGroup, removeGroup } = useLightingStore();
  const selected = (ids:number[]) => ids.length > 0 && ids.length === selectedLightIds.length && ids.every((id) => selectedLightIds.includes(id));
  const click = (e:MouseEvent<HTMLButtonElement>, id:number) => selectLight(id, e.shiftKey || e.metaKey || e.ctrlKey);
  return <CollapsibleSection title="Groups"><div style={{ marginLeft: 12 }}>
    {groups.length === 0 && <p style={{ marginTop:0, opacity:.55, fontSize:13 }}>No hay grupos creados.</p>}
    {groups.map((group) => <div key={group.id} style={{ marginBottom:8 }}>
      <button type="button" onClick={() => selectGroup(group.id)} style={{...itemStyle(selected(group.lightIds)), marginBottom:4}}><strong>{group.name}</strong><br/><small>{group.lightIds.length} {group.lightIds.length === 1 ? "luminaria" : "luminarias"}</small></button>
      <div style={{display:"flex", gap:6, marginBottom:6}}>
        <button type="button" onClick={(e) => {e.stopPropagation(); const name=window.prompt("Nuevo nombre del grupo:",group.name); if(name!==null) renameGroup(group.id,name);}} style={{...secondaryButtonStyle,flex:1}}>Renombrar</button>
        <button type="button" onClick={(e) => {e.stopPropagation(); if(window.confirm(`¿Eliminar el grupo "${group.name}"?\n\nLas luminarias no se eliminarán.`)) removeGroup(group.id);}} style={{...secondaryButtonStyle,flex:1,color:"#ff9a9a"}}>Eliminar</button>
      </div>
      <div style={{marginLeft:10,paddingLeft:8,borderLeft:"1px solid #3a3a3a"}}>{group.lightIds.map((id) => lights.find((l)=>l.id===id)).filter(Boolean).map((light) => light && <button type="button" key={light.id} onClick={(e)=>click(e,light.id)} style={{width:"100%",padding:"5px 7px",marginBottom:4,textAlign:"left",border:"1px solid #333",borderRadius:5,background:selectedLightIds.includes(light.id)?"#2d2818":"#1b1b1b",color:selectedLightIds.includes(light.id)?"#ffd36a":"#bbb",cursor:"pointer",fontSize:12}}>{light.name}</button>)}</div>
    </div>)}
  </div></CollapsibleSection>;
}
