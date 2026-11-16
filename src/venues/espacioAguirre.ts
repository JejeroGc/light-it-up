import type { LightFixture, LightGroup, FixtureType } from "../store/lightingStore";
import type { StageBar } from "../core";
import type { VenueFixtureProfile } from "./auditorioBelgrano";

export const ESPACIO_AGUIRRE_PROFILES: Record<string, VenueFixtureProfile> = {
  colorsplit: { profileId:"colorsplit", label:"Color Split", category:"Conventional / effect", functions:["Dimmer"], notes:"Tipo identificado por la leyenda del plano. Verificar modelo y óptica." },
  cuarzo: { profileId:"cuarzo", label:"Cuarzo", category:"Conventional", functions:["Dimmer"], notes:"Tipo identificado por la leyenda del plano." },
  ledvenetian: { profileId:"ledvenetian", label:"LED PAR Venetian", category:"LED PAR", functions:["Dimmer","Color"], notes:"El plano no aporta personality DMX." },
  nebula18: { profileId:"nebula18", label:"Nebula 18", category:"LED fixture", functions:["Dimmer","Color"], notes:"Verificar fabricante, modelo y canales DMX." },
  par300: { profileId:"par300", label:"PAR 300", category:"PAR", functions:["Dimmer"], notes:"Tipo identificado por la leyenda del plano." },
  par56: { profileId:"par56", label:"PAR 56 MFL", category:"Conventional PAR", functions:["Dimmer"], notes:"MFL según leyenda." },
  par64mfl: { profileId:"par64mfl", label:"PAR 64 MFL", category:"Conventional PAR", functions:["Dimmer"], notes:"MFL según leyenda." },
  par64nsp: { profileId:"par64nsp", label:"PAR 64 NSP", category:"Conventional PAR", functions:["Dimmer"], notes:"NSP según leyenda." },
  parledcob: { profileId:"parledcob", label:"PAR LED COB", category:"LED PAR", functions:["Dimmer","Color"], notes:"Verificar canales DMX." },
  pc: { profileId:"pc", label:"PC", category:"Conventional PC", functions:["Dimmer"], notes:"Tipo identificado por la leyenda del plano." },
};

// The source is a 2D lighting plan. Y heights are reconstruction defaults and are intentionally
// marked as estimates in Rider Review; the source itself does not provide hanging heights.
export const ESPACIO_AGUIRRE_BARS: StageBar[] = [
  {id:1,name:"LX1",x:0,y:5.5,z:-1.9,width:8},
  {id:2,name:"LX2",x:0,y:5.5,z:-3.73,width:8},
  {id:3,name:"LX3",x:0,y:5.5,z:-6.46,width:8},
  {id:4,name:"LFOH1",x:0,y:4.5,z:4.41,width:8},
  {id:5,name:"LFOH2",x:0,y:3.5,z:8.89,width:8},
];

const typeFor=(p:string):FixtureType => p.includes("led")||p==="nebula18" ? "wash" : "spot";
const beamFor=(p:string)=>({par64nsp:.18,par56:.38,par64mfl:.38,pc:.32,colorsplit:.45,cuarzo:.5,ledvenetian:.5,nebula18:.55,par300:.4,parledcob:.55} as Record<string,number>)[p]??.4;

type Seed={barId:number; profileId:string; channel:string; x:number};
// High-confidence fixtures/channels that are explicitly readable on the plan. The review screen
// calls this a partial extraction so ambiguous/unlabelled symbols are never silently invented.
const SEEDS: Seed[] = [
  {barId:1,profileId:"par56",channel:"11",x:-2.7},{barId:1,profileId:"par56",channel:"12",x:-1.55},
  {barId:1,profileId:"par56",channel:"95",x:-.75},{barId:1,profileId:"par56",channel:"14",x:.45},
  {barId:1,profileId:"par56",channel:"88",x:1.15},{barId:1,profileId:"par56",channel:"16",x:2.55},
  {barId:2,profileId:"par300",channel:"74",x:-2.15},{barId:2,profileId:"par300",channel:"53",x:2.15},
  {barId:3,profileId:"par64mfl",channel:"20",x:-1.2},{barId:3,profileId:"par64mfl",channel:"21",x:1.2},
  {barId:3,profileId:"colorsplit",channel:"22",x:0},
  {barId:4,profileId:"par64nsp",channel:"18",x:-3.65},{barId:4,profileId:"par300",channel:"13",x:-2.55},
  {barId:4,profileId:"par300",channel:"7",x:-.9},{barId:4,profileId:"par64nsp",channel:"9/24",x:.45},
  {barId:4,profileId:"par300",channel:"17",x:1.1},{barId:4,profileId:"par300",channel:"10",x:2.45},{barId:4,profileId:"par64nsp",channel:"18",x:3.65},
  {barId:5,profileId:"par300",channel:"1",x:-2.7},{barId:5,profileId:"par300",channel:"8",x:-1.65},
  {barId:5,profileId:"par300",channel:"2",x:0},{barId:5,profileId:"par300",channel:"3",x:3.65},
];

export const createEspacioAguirreRig=()=>{
  // Alpha 16.1: validate every imported seed before it reaches the 3D renderer.
  // The theatre circuit label (including values such as "9/24") remains in the
  // fixture name, while Light It Up receives safe numeric internal channel/address IDs.
  const lights: LightFixture[] = [];

  SEEDS.forEach((s) => {
    const bar = ESPACIO_AGUIRRE_BARS.find((candidate) => candidate.id === s.barId);
    const profile = ESPACIO_AGUIRRE_PROFILES[s.profileId];
    if (!bar || !profile || !Number.isFinite(s.x)) {
      console.warn("[Rider Import] Fixture omitido por datos inválidos", s);
      return;
    }

    const id = lights.length + 1;
    const fixtureType = typeFor(s.profileId);
    const beam = beamFor(s.profileId);
    if (!["spot", "wash", "beam", "moving"].includes(fixtureType) || !Number.isFinite(beam)) {
      console.warn("[Rider Import] Fixture omitido por tipo/beam inválido", s);
      return;
    }

    lights.push({
      id,
      name: `${profile.label} · CH ${s.channel}`,
      type: fixtureType,
      profileId: s.profileId,
      manufacturer: "No especificado",
      model: profile.label,
      position: { x: s.x, y: bar.y - 0.12, z: bar.z },
      color: "#fff2d6", intensity: 0, angle: beam, beamAngle: beam,
      pan: 0, tilt: 0, barId: s.barId, offsetX: s.x, selectedLightOffsetX: s.x,
      universe: 1, address: id, channel: id, powered: true,
    });
  });

  const used = [...new Set(lights.map((light) => light.profileId).filter(Boolean))] as string[];
  const groups: LightGroup[] = used.map((profileId, index) => ({
    id: index + 1,
    name: ESPACIO_AGUIRRE_PROFILES[profileId]?.label ?? profileId,
    lightIds: lights.filter((light) => light.profileId === profileId).map((light) => light.id),
  }));
  return { lights, groups };
};

export const ESPACIO_AGUIRRE_STAGE={width:8,depth:17.52,height:6,bars:ESPACIO_AGUIRRE_BARS};
export const ESPACIO_AGUIRRE_SOURCE_NOTE="Plano 2D: ancho 8,0 m; largo total 17,52 m. Alturas de varas no informadas: se usan valores editables de reconstrucción.";
