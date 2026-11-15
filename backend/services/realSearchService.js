import {randomUUID} from 'node:crypto';
import {analyzePoint} from './elevationService.js';
import {selectCandidates} from './candidateSelection.js';
import {resolveLocation} from './locationService.js';
import {discoverPlaces} from './discoveryService.js';
const jobs=new Map(),cache=new Map();
const TTL=7*24*3600*1000;
const MONTH_KEYS=['ANN','JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
function fail(message,status=502){return Object.assign(new Error(message),{status});}
async function json(url,signal){const response=await fetch(url,{signal:AbortSignal.any([signal||new AbortController().signal,AbortSignal.timeout(25000)])});if(!response.ok)throw fail('El proveedor respondió HTTP '+response.status,response.status===429?503:502);return response.json();}
async function measure(point,signal){
 const key=`${point.lat},${point.lon}`;
 const cached=cache.get(key);if(cached&&Date.now()-cached.time<TTL)return cached.value;
 const powerURL=new URL('https://power.larc.nasa.gov/api/temporal/climatology/point');
 for(const [key,value]of Object.entries({parameters:'T2M,WS10M,PRECTOTCORR',community:'AG',latitude:point.lat,longitude:point.lon,format:'JSON'}))powerURL.searchParams.set(key,String(value));
 const [power,terrain]=await Promise.all([json(powerURL,signal),analyzePoint(point.lat,point.lon,{fetchImpl:(url,options)=>fetch(url,{...options,signal:AbortSignal.any([signal,options.signal])})})]);
 const parameters=power.properties?.parameter;
 if(!parameters)throw fail('NASA POWER no devolvió parámetros climáticos.');
 const unit=id=>String(power.parameters?.[id]?.units||'').toLowerCase().replace(/\s/g,'');
 if(!['c','°c','celsius'].includes(unit('T2M'))||unit('WS10M')!=='m/s'||!['mm/day','mm/dy','mm/d'].includes(unit('PRECTOTCORR')))throw fail('NASA POWER devolvió unidades diferentes o sin metadatos. No se aplicaron umbrales con unidades supuestas.');
 const fill=power.header?.fill_value??-999;
 const read=(id,key)=>{const value=parameters[id]?.[key];return typeof value==='number'&&Number.isFinite(value)&&value!==fill&&value>-900?value:null;};
 const months=MONTH_KEYS.map((name,index)=>({month:index,temperature:read('T2M',name),wind:read('WS10M',name),precipitation:read('PRECTOTCORR',name)}));
 const value={id:`real-${point.lat}-${point.lon}`,coordinates:[point.lat,point.lon],terrain,months,
  power:{url:powerURL.toString(),source:'NASA POWER climatology',header:power.header,parameters:power.parameters,geometry:power.geometry},retrievedAt:new Date().toISOString()};
 cache.set(key,{time:Date.now(),value});if(cache.size>500)cache.delete(cache.keys().next().value);return value;
}
function antarcticArea(bounds){return bounds[3]<=-60;}
function validate(body){
 const {language='es',bounds=[-180,-60,180,80],month=0,limit=6,criteria={}}=body||{};
 if(!['es','en'].includes(language))throw fail('Unsupported language.',400);
 if(!Array.isArray(bounds)||bounds.length!==4||!bounds.every(v=>typeof v==='number'&&Number.isFinite(v)))throw fail('bounds debe ser [oeste,sur,este,norte].',400);
 const [w,s,e,n]=bounds;if(w< -180||e>180||s< -85||n>85||w>=e||s>=n)throw fail('Área inválida: longitudes −180 a 180, latitudes −85 a 85. El área no puede cruzar el antimeridiano.',400);
 if(!Number.isInteger(limit)||limit<3||limit>6||!Number.isInteger(month)||month<0||month>12)throw fail('Elegí entre 3 y 6 candidatos y mes entre 0 y 12.',400);
 if(!criteria||typeof criteria!=='object'||Array.isArray(criteria))throw fail('Criterios inválidos.',400);
 const definitions={maxSlope:[0,90],minSlope:[0,90],minWind:[0,100],maxTemperature:[-100,80],maxPrecipitation:[0,1000]};
 const clean={};for(const [key,[min,max]]of Object.entries(definitions))if(criteria[key]!==undefined&&criteria[key]!==null){const v=criteria[key];if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw fail(`Valor inválido: ${key}.`,400);clean[key]=v;}
 if(clean.minSlope!==undefined&&clean.maxSlope!==undefined&&clean.minSlope>clean.maxSlope)throw fail('La pendiente mínima supera la máxima.',400);
 if(!Object.keys(clean).length)throw fail('Activá al menos un criterio medible.',400);
 const missions=['mars-rover','lunar-rover','surface-station','robotics'];
 const objectivesAllowed=['wind','cold','dry','slopes'];
 const mission=body.mission??'robotics',objectives=body.objectives??[],focus=body.focus??'';
 if(!missions.includes(mission)||!Array.isArray(objectives)||objectives.length>4||objectives.some(id=>!objectivesAllowed.includes(id))||(focus!==''&&!objectives.includes(focus)))throw fail('El contexto de misión o sus objetivos no son válidos.',400);
 const includePolar=body.includePolar??(antarcticArea(bounds));
 if(typeof includePolar!=='boolean')throw fail('includePolar debe ser booleano.',400);
 return {language,bounds,month,limit:Math.min(limit,6),criteria:clean,mission,objectives:[...new Set(objectives)],focus,includePolar};
}
function evaluate(point,criteria,month,language){
 const values={slope:point.terrain.estimatedSlope,...point.months[month]};
 const checks=[['minSlope','slope','min','Pendiente mínima'],['maxSlope','slope','max','Pendiente máxima'],['minWind','wind','min','Viento medio mínimo'],['maxTemperature','temperature','max','Temperatura media máxima'],['maxPrecipitation','precipitation','max','Precipitación media máxima']].filter(([key])=>criteria[key]!==undefined).map(([key,metric,operator,label])=>({key,label:language==='en'?({minSlope:'Minimum slope',maxSlope:'Maximum slope',minWind:'Minimum average wind speed',maxTemperature:'Maximum average temperature',maxPrecipitation:'Maximum average precipitation'})[key]:label,value:values[metric],threshold:criteria[key],pass:values[metric]!==null&&(operator==='min'?values[metric]>=criteria[key]:values[metric]<=criteria[key])}));
 const qualifyingMonths=point.months.slice(1).filter(m=>{
  const monthly={slope:point.terrain.estimatedSlope,...m};
  const definition={minSlope:['slope','min'],maxSlope:['slope','max'],minWind:['wind','min'],maxTemperature:['temperature','max'],maxPrecipitation:['precipitation','max']};
  return Object.entries(criteria).every(([key,threshold])=>{const [metric,op]=definition[key];return Number.isFinite(monthly[metric])&&(op==='min'?monthly[metric]>=threshold:monthly[metric]<=threshold);});
 }).map(m=>m.month);
 return {...point,values,checks,qualifyingMonths,matches:checks.every(c=>c.pass),passed:checks.filter(c=>c.pass).length};
}
function snapshot(job){return {...selectCandidates(job),id:job.id,status:job.status,completed:job.completed,total:job.total,failed:job.failed,results:job.results,excluded:job.excluded,errors:job.errors.map(({name,coordinates})=>({name,coordinates,message:'No se pudieron consultar las condiciones de este lugar.'})),request:job.request,error:job.error?'No pudimos completar la búsqueda. Intentá nuevamente en unos minutos.':null,startedAt:job.startedAt,phase:job.phase,discovery:job.discovery||null,
  limitations:'Lugares propuestos por el modelo sin búsqueda web ni referencias verificadas; clima y elevación contrastados después con APIs. No es una búsqueda exhaustiva ni un óptimo mundial. Las coordenadas propuestas son aproximadas. Climatología regional de NASA POWER, no pronóstico ni registro de tormentas. Pendiente aproximada de cinco elevaciones GLO-90. No mide NDVI, sustrato, tracción, obstáculos ni polvo. Los límites espaciales de los modelos no permiten validar un ensayo local.',
  sources:[{name:'Esri World Imagery · vistas satelitales',url:'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'},{name:'NASA POWER climatology',url:'https://power.larc.nasa.gov/docs/services/api/temporal/climatology/'},{name:'Open-Meteo / Copernicus DEM GLO-90',url:'https://open-meteo.com/en/docs/elevation-api'},{name:'Límites administrativos Natural Earth',url:'https://www.naturalearthdata.com/'}]};}
export function startRealSearch(body){
 for(const [id,job]of jobs)if(Date.now()-job.created>3600000&&job.status!=='running')jobs.delete(id);
 if([...jobs.values()].filter(j=>j.status==='running').length>=1)throw fail('Ya hay una búsqueda real en curso. Esperá o cancelala antes de iniciar otra.',429);
 const request=validate(body),id=randomUUID(),job={id,request,phase:'discovering',status:'running',completed:0,total:0,failed:0,results:[],excluded:[],errors:[],created:Date.now(),startedAt:new Date().toISOString(),controller:new AbortController()};
 jobs.set(id,job);void run(job);return snapshot(job);
}
async function run(job){
 try{
  job.phase='discovering';
  job.discovery=await discoverPlaces(job.id,job.request,job.controller.signal);
  const points=job.discovery.places.slice(0,job.request.limit).map(proposal=>({lat:proposal.latitude,lon:proposal.longitude,proposal}));
  job.total=points.length;job.phase='measuring';const measurementStarted=Date.now();
  if(!points.length)throw fail('Gemini no devolvió lugares para medir en el área elegida.');
  // Un solo worker: evita lanzar decenas de solicitudes simultáneas al proveedor.
  for(const point of points){
   if(job.controller.signal.aborted)return;
   if(Date.now()-measurementStarted>180000){job.error='Se alcanzó el límite de tres minutos. Se conservan los lugares ya procesados.';break;}
   try{const measured=await measure(point,job.controller.signal);if(job.controller.signal.aborted)return;const result=evaluate({...measured,discovery:point.proposal,name:point.proposal.name},job.request.criteria,job.request.month,job.request.language);(result.matches?job.results:job.excluded).push(result);}
   catch(error){if(job.controller.signal.aborted)return;job.failed++;job.errors.push({name:point.proposal.name,coordinates:[point.lat,point.lon],message:error.message});}
   job.completed++;
  }
  // La identidad administrativa se contrasta con los límites locales.
  job.phase='identifying';
  for(const candidate of selectCandidates(job).candidates){
   if(job.controller.signal.aborted)return;
   const location=await resolveLocation(candidate.coordinates,job.request.language);
   const original=[...job.results,...job.excluded].find(p=>p.id===candidate.id);
   if(original){original.location=location.label?location:{country:original.discovery.country,region:original.discovery.region,label:[original.discovery.name,original.discovery.region,original.discovery.country].filter(Boolean).join(', '),status:'discovery-proposal',note:'Nombre y región propuestos por el modelo sin verificación web; identidad administrativa no verificada por los límites locales.'};}
  }
  job.phase='ready';
  job.status=job.failed===job.total?'error':job.failed||job.completed<job.total?'partial':'complete';
  if(job.status==='error')job.error='No se pudo medir ningún punto. Revisá los errores de los proveedores; no se reemplazaron por datos demo.';
 }catch(error){if(!job.controller.signal.aborted){job.phase='failed';job.status='error';job.error=error.message;}}
}
export function getRealSearch(id){const job=jobs.get(id);if(!job)throw fail('Búsqueda inexistente o expirada.',404);return snapshot(job);}
export function cancelRealSearch(id){const job=jobs.get(id);if(!job)throw fail('Búsqueda inexistente.',404);if(job.status==='running'){job.controller.abort();job.status='cancelled';}return snapshot(job);}
