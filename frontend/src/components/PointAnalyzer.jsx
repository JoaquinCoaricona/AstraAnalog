import {useEffect,useRef,useState} from 'react';
import {analyzePoint} from '../services/api.js';
export default function PointAnalyzer({point,onSelectPoint}){
 const [lat,setLat]=useState(''),[lon,setLon]=useState(''),[result,setResult]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 const current=useRef(null),requestPoint=useRef(null);
 useEffect(()=>{
  if(point){setLat(String(point.lat));setLon(String(point.lon));}
  // Un envío propio actualiza el pin sin cancelar la consulta de ese mismo punto.
  if(point&&requestPoint.current?.lat===point.lat&&requestPoint.current?.lon===point.lon)return;
  current.current?.abort();setLoading(false);setResult(null);setError('');
 },[point]);
 useEffect(()=>()=>current.current?.abort(),[]);
 function changeCoordinate(setter,value){current.current?.abort();requestPoint.current=null;setLoading(false);setResult(null);setError('');setter(value);}
 async function submit(event){
  event.preventDefault();current.current?.abort();
  const latitude=Number(lat),longitude=Number(lon);
  if(!lat.trim()||!lon.trim()||!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180){setError('Ingresá coordenadas válidas: latitud −90 a 90 y longitud −180 a 180.');return;}
  requestPoint.current={lat:latitude,lon:longitude};
  onSelectPoint({lat:latitude,lon:longitude});
  setResult(null);setError('');setLoading(true);
  const controller=new AbortController();current.current=controller;
  try{const data=await analyzePoint({lat:latitude,lon:longitude},controller.signal);if(current.current===controller&&!controller.signal.aborted)setResult(data);}
  catch(e){if(e.name!=='AbortError'&&current.current===controller)setError(e.message);}
  finally{if(current.current===controller)setLoading(false);}
 }
 return <section className="rounded-xl border border-stone-200 bg-white p-5"><h2 className="text-lg font-semibold">Analizá otro punto</h2><p className="my-2 text-xs leading-5 text-stone-500">Elegí un punto con doble clic o ingresá coordenadas. Consultar usa el servicio externo Open-Meteo; no agrega el punto al catálogo.</p><form onSubmit={submit} className="mt-4 flex flex-wrap items-end gap-3"><label className="min-w-32 flex-1 text-xs">Latitud<input required type="number" step="any" min="-90" max="90" value={lat} onChange={e=>changeCoordinate(setLat,e.target.value)} className="mt-2 block w-full rounded border border-stone-200 p-2" placeholder="-26.62"/></label><label className="min-w-32 flex-1 text-xs">Longitud<input required type="number" step="any" min="-180" max="180" value={lon} onChange={e=>changeCoordinate(setLon,e.target.value)} className="mt-2 block w-full rounded border border-stone-200 p-2" placeholder="-67.54"/></label><button disabled={loading} className="rounded bg-[#253f30] px-4 py-2 text-sm text-white">{loading?'Consultando…':'Consultar elevación'}</button></form>{error&&<p role="alert" className="mt-4 rounded bg-amber-50 p-3 text-xs text-amber-900">{error}</p>}{result&&<div aria-live="polite" className="mt-5"><dl className="grid grid-cols-3 gap-2">{[['Elevación',`${result.elevation} m`],['Pendiente estimada',`${result.estimatedSlope}°`],['Relieve de muestras',`${result.localRelief} m`]].map(([name,value])=><div key={name} className="rounded bg-stone-50 p-3"><dt className="text-[10px] text-stone-500">{name}</dt><dd className="mt-1 text-sm font-semibold">{value}</dd></div>)}</dl><p className="mt-3 text-xs leading-6 text-stone-500">{result.limitations}</p><details className="mt-3 text-xs"><summary className="cursor-pointer">Ver las cinco muestras en crudo</summary><ul className="mt-2 space-y-1">{result.samples.map(s=><li key={s.direction}>{s.direction}: {s.elevation} m · {s.coordinates.map(v=>v.toFixed(5)).join(', ')}</li>)}</ul></details><p className="mt-3 text-[10px] text-stone-500"><a className="underline" href={result.sourceUrl} target="_blank" rel="noreferrer">{result.source}</a> · {new Date(result.retrievedAt).toLocaleString('es-AR')}</p><p className="mt-1 text-[10px] text-stone-500">{result.attribution}</p></div>}</section>;
}
