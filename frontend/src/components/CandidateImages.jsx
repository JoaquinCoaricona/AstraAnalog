import {useState} from 'react';
function imageUrl([lat,lon]){
 const halfLat=.025,halfLon=Math.min(.3,.04/Math.max(.1,Math.cos(lat*Math.PI/180)));
 const url=new URL('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export');
 const params={bbox:[Math.max(-180,lon-halfLon),Math.max(-85,lat-halfLat),Math.min(180,lon+halfLon),Math.min(85,lat+halfLat)].join(','),bboxSR:'4326',imageSR:'3857',size:'640,360',format:'jpg',f:'image'};
 for(const [key,value]of Object.entries(params))url.searchParams.set(key,value);return url.toString();
}
function ImageCard({point,explanation,recommended,onSelect}){
 const [failed,setFailed]=useState(false);
 const mapUrl=`https://www.openstreetmap.org/?mlat=${point.coordinates[0]}&mlon=${point.coordinates[1]}#map=13/${point.coordinates[0]}/${point.coordinates[1]}`;
 return <article className={`overflow-hidden rounded-xl border bg-white ${recommended?'border-lime-700':'border-stone-200'}`}>
  {failed?<div className="flex aspect-video items-center justify-center bg-stone-100 p-5 text-center text-xs text-stone-500">La vista satelital no está disponible. No se sustituyó por una imagen generada.</div>:<img src={imageUrl(point.coordinates)} width="640" height="360" loading="lazy" decoding="async" alt={`Vista satelital del entorno de ${point.coordinates.map(v=>v.toFixed(3)).join(', ')}`} onError={()=>setFailed(true)} className="aspect-video w-full object-cover"/>}
  <div className="p-4">{recommended&&<p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-lime-800">Destacado por Gemini</p>}<button onClick={()=>onSelect(point.id)} className="text-left text-sm font-semibold underline">{point.coordinates.map(v=>v.toFixed(3)).join(', ')} ↗</button><p className="mt-2 text-[11px] leading-6 text-stone-500">Viento {point.values.wind??'s/d'} m/s · Temperatura {point.values.temperature??'s/d'} °C · Pendiente {point.values.slope}°.</p>{explanation&&<div className="mt-3 space-y-2 text-xs leading-6"><p><strong>Por qué considerarlo:</strong> {explanation.why}</p><p><strong>Para qué lo destaca:</strong> {explanation.bestFor}</p><p className="text-stone-500"><strong>Qué limita su elección:</strong> {explanation.tradeoffs}</p></div>}<p className="mt-3 text-[9px] leading-5 text-stone-400">Imagen de contexto satelital, no fotografía de campo ni necesariamente de la fecha del clima. © Esri, Maxar, Earthstar Geographics y colaboradores.</p><div className="mt-2 flex flex-wrap gap-3 text-[10px]"><a className="underline" href={mapUrl} target="_blank" rel="noreferrer">Ver coordenadas en el mapa</a><a className="underline" href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer" target="_blank" rel="noreferrer">Fuente de imagen</a></div></div>
 </article>;
}
export default function CandidateImages({points,analysis,onSelect}){
 return <section><h2 className="mb-2 text-xl font-semibold">Una vista de cada candidato</h2><p className="mb-4 text-xs leading-6 text-stone-500">Las imágenes se consultan directamente al proveedor cartográfico. No se envían a Gemini ni se usan para inferir suelo, vegetación o aptitud.</p><div className="grid gap-4 xl:grid-cols-2">{points.map(point=><ImageCard key={point.id} point={point} explanation={analysis?.candidates.find(c=>c.id===point.id)} recommended={analysis?.recommendedId===point.id} onSelect={onSelect}/>)}</div></section>;
}
