import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { AUDITORIO_BELGRANO_BARS, AUDITORIO_BELGRANO_PROFILES, createAuditorioBelgranoRig } from "../../venues/auditorioBelgrano";
import { ESPACIO_AGUIRRE_BARS, ESPACIO_AGUIRRE_PROFILES, ESPACIO_AGUIRRE_SOURCE_NOTE, createEspacioAguirreRig } from "../../venues/espacioAguirre";

export type RiderVenueId = "belgrano" | "aguirre";
type Props = { open: boolean; onClose: () => void; onVenueCreated?: (venue:RiderVenueId) => void };
type Step = "upload" | "review" | "manual";
const ACCEPT = ".pdf,.jpg,.jpeg,.png,.docx,application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const BELGRANO_COUNTS = [["madtec",8],["beam7r",12],["beye",6],["parled",30],["par64",5],["par2000z",12],["minibrut",2]] as const;

const norm=(s:string)=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function detect(file:File):RiderVenueId|undefined { const n=norm(file.name); if(n.includes("belgrano")) return "belgrano"; if(n.includes("aguirre")) return "aguirre"; return undefined; }

export default function RiderImportModal({open,onClose,onVenueCreated}:Props){
 const inputRef=useRef<HTMLInputElement>(null); const [file,setFile]=useState<File|null>(null); const [dragging,setDragging]=useState(false); const [step,setStep]=useState<Step>("upload"); const [venue,setVenue]=useState<RiderVenueId|undefined>();
 const belgrano=useMemo(()=>createAuditorioBelgranoRig(),[]); const aguirre=useMemo(()=>createEspacioAguirreRig(),[]);
 useEffect(()=>{if(!open){setFile(null);setStep("upload");setDragging(false);setVenue(undefined)}},[open]); if(!open)return null;
 const pick=(f?:File)=>{if(f){setFile(f);setStep("upload");setVenue(undefined)}}; const onChange=(e:ChangeEvent<HTMLInputElement>)=>{pick(e.target.files?.[0]);e.target.value=""}; const onDrop=(e:DragEvent<HTMLDivElement>)=>{e.preventDefault();setDragging(false);pick(e.dataTransfer.files?.[0])};
 const prepare=()=>{if(!file)return;const v=detect(file);setVenue(v);setStep(v?"review":"manual")}; const create=()=>{if(venue){onVenueCreated?.(venue);onClose()}};
 const isA=venue==="aguirre"; const rig=isA?aguirre:belgrano; const bars=isA?ESPACIO_AGUIRRE_BARS:AUDITORIO_BELGRANO_BARS;
 return <div className="rider-modal-backdrop" onMouseDown={onClose}><section className="rider-modal" onMouseDown={e=>e.stopPropagation()} aria-modal="true" role="dialog">
  <button className="rider-modal-close" onClick={onClose}>×</button><span className="rider-pro-badge">LIGHT IT UP PRO · ALPHA 16</span><h2>{step==="review"?"Revisar análisis del rider":"Importar rider técnico"}</h2>
  {step==="review"? <>
   <p className="rider-modal-lead"><strong>{file?.name}</strong><br/>{isA?"Perfil detectado: Espacio Aguirre":"Perfil detectado: Auditorio Belgrano"}. Confirmá la reconstrucción antes de crear el venue.</p>
   <div className="rider-review-summary"><div><b>{rig.lights.length}{isA?"+":""}</b><span>{isA?"Fixtures legibles":"Luminarias"}</span></div><div><b>{bars.length}</b><span>Posiciones</span></div><div><b>{rig.groups.length}</b><span>Grupos</span></div><div><b>{isA?"8×17.52 m":"18×9×10 m"}</b><span>Planta</span></div></div>
   {isA? <>
    <div className="rider-modal-note"><strong>Lectura segura del plano</strong><br/>{ESPACIO_AGUIRRE_SOURCE_NOTE}</div>
    <div className="rider-fixture-review">{Object.values(ESPACIO_AGUIRRE_PROFILES).map(p=><div key={p.profileId}><span>{p.label}</span><b>{rig.lights.filter(l=>l.profileId===p.profileId).length?`× ${rig.lights.filter(l=>l.profileId===p.profileId).length}`:"detectado en leyenda"}</b><small>{p.notes}</small></div>)}</div>
    <div className="rider-modal-note rider-warning"><strong>Importación parcial y editable.</strong><br/>El plano contiene símbolos sin etiqueta inequívoca y no informa alturas de colgado. Alpha 16 crea sólo los fixtures/canales que puede leer con confianza; el resto queda para completar dentro del editor. No se inventan datos técnicos.</div>
   </>:<div className="rider-fixture-review">{BELGRANO_COUNTS.map(([id,count])=><div key={id}><span>{AUDITORIO_BELGRANO_PROFILES[id].label}</span><b>× {count}</b><small>{AUDITORIO_BELGRANO_PROFILES[id].functions.join(" · ")}</small></div>)}</div>}
   <div className="rider-modal-actions"><button onClick={()=>setStep("upload")}>← Volver</button><button className="rider-primary" onClick={create}>Crear Venue</button></div>
  </>:<>
   <p className="rider-modal-lead">Cargá PDF, imagen o DOCX. Light It Up identifica perfiles verificados y separa datos confirmados de estimaciones de reconstrucción.</p>
   <div className={`rider-dropzone ${dragging?"is-dragging":""}`} onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={onDrop} onClick={()=>inputRef.current?.click()}><span className="rider-drop-icon">⇩</span><strong>{file?file.name:"Arrastrá tu rider acá"}</strong><small>{file?`${(file.size/1024/1024).toFixed(2)} MB · listo para análisis`:"o hacé click para seleccionar un archivo"}</small><em>PDF · JPG · PNG · DOCX</em></div>
   <input ref={inputRef} className="sr-only" type="file" accept={ACCEPT} onChange={onChange}/><div className="rider-analysis-grid"><div><b>01</b><span>Documento</span><small>Rider, plano o ficha</small></div><div><b>02</b><span>Interpretación</span><small>Confirmado vs. estimado</small></div><div><b>03</b><span>Revisión</span><small>Validás antes de crear</small></div></div>
   {step==="manual"?<div className="rider-modal-note rider-warning"><strong>No coincide con un perfil local verificado.</strong><br/>Alpha 16 ya usa una arquitectura extensible, pero todavía no ejecuta OCR/visión autónoma dentro del navegador. Podés volver y cargar un rider de Auditorio Belgrano o Espacio Aguirre; el próximo paso será conectar un analizador visual real.</div>:<div className="rider-modal-note">Perfiles de prueba integrados: <strong>Auditorio Belgrano</strong> y <strong>Espacio Aguirre</strong>. Aguirre inaugura el modo de importación parcial: sólo crea lo que el plano permite afirmar.</div>}
   <div className="rider-modal-actions"><button onClick={onClose}>Cancelar</button><button className="rider-primary" disabled={!file} onClick={prepare}>Preparar análisis</button></div>
  </>}
 </section></div>
}
