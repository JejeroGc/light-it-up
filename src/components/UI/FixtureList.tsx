import { useLightingStore } from "../../store/lightingStore";
import CollapsibleSection from "./CollapsibleSection";
import BarsPanel from "./SceneTree/BarsPanel";
import FixturesPanel from "./SceneTree/FixturesPanel";
import GroupsPanel from "./SceneTree/GroupsPanel";
import PresetsPanel from "./SceneTree/PresetsPanel";
import CuesPanel from "./SceneTree/CuesPanel";
import EffectsPanel from "./SceneTree/EffectsPanel";

export default function FixtureList() {
  const { selectedLightIds, groups, addLight, createGroupFromSelection } = useLightingStore();
  const createGroup = () => {
    if (selectedLightIds.length < 2) return;
    const name = window.prompt("Nombre del nuevo grupo:", `Grupo ${groups.length + 1}`);
    if (name !== null) createGroupFromSelection(name);
  };
  const canCreateGroup = selectedLightIds.length >= 2;
  return <div>
    <h3 style={{marginTop:0}}>Scene Tree</h3>
    <button data-tour="add-fixture" type="button" onClick={addLight} style={{width:"100%",padding:10,marginBottom:10,cursor:"pointer",borderRadius:8,border:"1px solid #444",background:"#222",color:"#ddd"}}>+ Agregar luminaria</button>
    <button type="button" onClick={createGroup} disabled={!canCreateGroup} style={{width:"100%",padding:10,marginBottom:16,cursor:canCreateGroup?"pointer":"not-allowed",borderRadius:8,border:canCreateGroup?"1px solid #ffd36a":"1px solid #3a3a3a",background:canCreateGroup?"#332a12":"#202020",color:canCreateGroup?"#ffd36a":"#666",opacity:canCreateGroup?1:.75}}>+ Crear grupo desde selección</button>
    <CollapsibleSection title="Stage"><div style={{marginLeft:12}}><BarsPanel/><GroupsPanel/><PresetsPanel/><EffectsPanel/><CuesPanel/><FixturesPanel/></div></CollapsibleSection>
  </div>;
}
