import type { LightFixture, LightGroup, FixtureType } from "../store/lightingStore";
import type { StageBar } from "../core";
export type VenueFixtureProfile = { profileId: string; label: string; category: string; functions: string[]; notes?: string; };
export const AUDITORIO_BELGRANO_PROFILES: Record<string, VenueFixtureProfile> = {
  madtec: { profileId:"madtec", label:"Móvil tipo MAD TEC", category:"Moving Head", functions:["Dimmer","Pan","Tilt","Color","Beam/Zoom","Strobe"], notes:"Modelo/DMX exacto no especificado en rider." },
  beam7r: { profileId:"beam7r", label:"Beam 7R", category:"Beam Moving Head", functions:["Dimmer","Pan","Tilt","Color","Gobo","Prism","Focus","Strobe"], notes:"Personality genérico hasta disponer del modelo/tabla DMX exactos." },
  beye: { profileId:"beye", label:"B-EYE 4 en 1 7x40", category:"LED Wash/FX", functions:["Dimmer","Pan","Tilt","RGB Color","Zoom/Beam","Strobe","Pixel/FX (simulado)"], notes:"Rider no identifica fabricante/modelo exacto." },
  parled: { profileId:"parled", label:"PAR LED RGB", category:"LED PAR", functions:["Dimmer","RGB Color","Strobe"], notes:"Canales DMX no informados." },
  par64: { profileId:"par64", label:"PAR 64 NSP", category:"Conventional PAR", functions:["Dimmer"], notes:"NSP: haz angosto; color físico por gel si aplica." },
  par2000z: { profileId:"par2000z", label:"PAR 2000Z", category:"PAR", functions:["Dimmer","Beam/Zoom (si el equipo instalado lo permite)"], notes:"Rider no aporta personality DMX." },
  minibrut: { profileId:"minibrut", label:"Mini Brut LED", category:"Audience Blinder", functions:["Dimmer","Strobe/Pulse"], notes:"Verificar canales del equipo real." },
};
export const AUDITORIO_BELGRANO_BARS: StageBar[] = [
  {id:1,name:"LX 1",x:0,y:8.2,z:3.1,width:16.5},{id:2,name:"LX 2",x:0,y:8.4,z:0.7,width:16},{id:3,name:"LX 3",x:0,y:8.6,z:-1.8,width:16},{id:4,name:"LX 4",x:0,y:8.8,z:-4.1,width:15.5},{id:5,name:"PUENTE / PROSCENIO",x:0,y:7.4,z:5,width:14}
];
const typeFor=(p:string):FixtureType=>["madtec","beam7r","beye"].includes(p)?"moving":p==="minibrut"?"wash":p==="par64"?"spot":"wash";
const beamFor=(p:string)=>({beam7r:.12,par64:.22,par2000z:.35,beye:.55,parled:.48,minibrut:.9,madtec:.32} as Record<string,number>)[p]??.35;
const makeRow=(start:number,count:number,profileId:string,barId:number,prefix:string):LightFixture[]=>{const bar=AUDITORIO_BELGRANO_BARS.find(b=>b.id===barId)!;return Array.from({length:count},(_,i)=>{const span=Math.min(bar.width-1.2,Math.max(2,count*.72));const x=count===1?0:-span/2+(span*i)/(count-1);const id=start+i;return {id,name:`${prefix} ${String(i+1).padStart(2,"0")}`,type:typeFor(profileId),profileId,manufacturer:"No especificado",model:AUDITORIO_BELGRANO_PROFILES[profileId].label,position:{x,y:bar.y-.12,z:bar.z},color:"#fff2d6",intensity:0,angle:beamFor(profileId),beamAngle:beamFor(profileId),pan:0,tilt:0,barId,offsetX:x-bar.x,selectedLightOffsetX:x-bar.x,universe:1,address:id,channel:id,powered:true};});};
export const createAuditorioBelgranoRig=()=>{let id=1;const chunks:LightFixture[][]=[];const add=(n:number,p:string,b:number,label:string)=>{chunks.push(makeRow(id,n,p,b,label));id+=n;};add(5,"par64",1,"PAR64 NSP");add(12,"par2000z",2,"PAR 2000Z");add(12,"beam7r",3,"BEAM 7R");add(6,"beye",3,"B-EYE 7x40");add(8,"madtec",4,"MAD TEC MOV");add(30,"parled",4,"PAR LED RGB");add(2,"minibrut",5,"MINI BRUT LED");const lights=chunks.flat();const groups:LightGroup[]=Object.keys(AUDITORIO_BELGRANO_PROFILES).map((p,i)=>({id:i+1,name:AUDITORIO_BELGRANO_PROFILES[p].label,lightIds:lights.filter(l=>l.profileId===p).map(l=>l.id)}));return {lights,groups};};
export const AUDITORIO_BELGRANO_STAGE={width:18,depth:9,height:10,bars:AUDITORIO_BELGRANO_BARS};
