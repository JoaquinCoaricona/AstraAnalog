import {useEffect,useRef,useState} from 'react';
import {startRealSearch,getRealSearch,cancelRealSearch} from '../services/api.js';
import {initialJourney,journeyRequest} from '../data/journey.js';
import JourneyWizard from './JourneyWizard.jsx';
import LocationResults from './LocationResults.jsx';
import '../journey.css';
export default function UnifiedJourney(){
 const [draft,setDraft]=useState(initialJourney),[editing,setEditing]=useState(true);
 const [job,setJob]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[revision,setRevision]=useState(0);
 const alive=useRef(true),jobRef=useRef(null),creation=useRef(null),heading=useRef(null),starting=useRef(false);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;creation.current?.abort();if(jobRef.current?.status==='running')cancelRealSearch(jobRef.current.id).catch(()=>{});};},[]);
 useEffect(()=>{jobRef.current=job;},[job]);
 useEffect(()=>{
  if(job?.status!=='running')return;
  const controller=new AbortController();
  const timer=setTimeout(()=>{getRealSearch(job.id,controller.signal).then(next=>{setJob(next);setError('');}).catch(e=>{if(e.name!=='AbortError')setError('Se interrumpió la conexión. Podés volver a consultar el progreso.');});},1500);
  return()=>{clearTimeout(timer);controller.abort();};
 },[job,revision]);
 useEffect(()=>{if(!editing){heading.current?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}},[editing]);
 useEffect(()=>{if(!editing&&job?.status&&job.status!=='running')window.scrollTo({top:0,behavior:'instant'});},[job?.status,editing]);
 async function search(){
  if(starting.current)return;starting.current=true;setBusy(true);setError('');
  const controller=new AbortController();creation.current=controller;
  try{const next=await startRealSearch(journeyRequest(draft),controller.signal);jobRef.current=next;if(alive.current){setJob(next);setEditing(false);}}
  catch(e){if(e.name!=='AbortError'&&alive.current)setError(e.message);}finally{starting.current=false;if(alive.current)setBusy(false);}
 }
 async function cancel(){if(!job)return;setBusy(true);try{const next=await cancelRealSearch(job.id);jobRef.current=next;setJob(next);}catch{setError('No se pudo cancelar la búsqueda. Intentá de nuevo.');}finally{setBusy(false);}}
 function edit(){setEditing(true);setError('');}
 if(editing)return <JourneyWizard draft={draft} onChange={setDraft} onSubmit={search} busy={busy} submitError={error}/>;
 const points=job?.candidates||[],running=job?.status==='running';
 const analysis={recommendedId:null,candidates:points.map(p=>({id:p.id,reasonTitle:p.discovery?.reasonTitle,why:p.discovery?.rationale,tradeoffs:p.discovery?.accessCaveat,imageCaption:p.discovery?.imageCaption,bestFor:p.discovery?.bestFor}))};
 return <div className="journey-results results-first">
 <div className="results-toolbar"><h1 ref={heading} tabIndex={-1}>{running?'Buscando tus lugares…':points.length?(points.length+' lugares para tu ensayo'):job.status==='cancelled'?'Búsqueda cancelada':'Tu búsqueda'}</h1><button className="flow-secondary" onClick={running?cancel:edit} disabled={busy}>{running?'Cancelar':'Ajustar búsqueda'}</button></div>
 {error&&<div role="alert" className="flow-error">{error}{running&&<button onClick={()=>setRevision(v=>v+1)} className="ml-3 underline">Continuar</button>}</div>}
 {running&&<section className="search-waiting"><span className="search-spinner" aria-hidden="true"/><h2>{job.phase==='discovering'?'Buscando lugares para tu ensayo':job.phase==='identifying'?'Ubicando los lugares':'Comparando clima y terreno'}</h2><progress aria-label="Progreso de búsqueda" max={job.total||1} value={job.completed}/></section>}
 {!running&&points.length>0&&<LocationResults job={job} analysis={analysis}/>}
 {!running&&points.length===0&&<section className="empty-results"><h2 className="text-xl font-semibold">{job.status==='cancelled'?'Podés retomar con otra búsqueda.':job.discovery?'No pudimos completar las mediciones.':'No pudimos completar la búsqueda.'}</h2>{job.status!=='cancelled'&&<p className="mt-3 text-sm">Intentá nuevamente en unos minutos.</p>}{job.discovery?.places?.length>0&&<ul className="mt-4 space-y-3 text-left">{job.discovery.places.map(p=><li key={p.name} className="rounded border border-stone-200 bg-white p-4"><strong>{p.name} · {[p.region,p.country].filter(Boolean).join(' · ')}</strong><p className="mt-2 text-xs leading-6">{p.rationale}</p><p className="mt-2 text-xs text-amber-900">Condiciones pendientes de confirmar.</p></li>)}</ul>}<button className="flow-primary mt-4" onClick={edit}>Ajustar búsqueda</button></section>}
 </div>;
}
