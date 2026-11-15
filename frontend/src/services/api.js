import {selectCandidates} from '../../../backend/services/candidateSelection.js';
import {AI_CONTRACT} from '../../../backend/contracts.js';
function normalizeSearch(data){
 if(!data?.request||!Array.isArray(data.results)||!Array.isArray(data.excluded))return data;
 // No permitir que un array candidates vacío o una respuesta anterior escondan
 // puntos efectivamente medidos: la selección usa el mismo motor que el backend.
 if(!data.candidates?.length&&(data.results.length||data.excluded.length))return {...data,...selectCandidates(data)};
 return data;
}
async function request(path,options={}){
 let response;
 const {timeoutMs=15000,...fetchOptions}=options;
 const deadline=AbortSignal.timeout(timeoutMs);
 const signal=fetchOptions.signal?AbortSignal.any([fetchOptions.signal,deadline]):deadline;
 try{response=await fetch(path,{...fetchOptions,signal});}catch(error){
  if(error.name==='AbortError')throw error;
  throw new Error(deadline.aborted?'La consulta está tardando más de lo esperado. Intentá nuevamente.':'No pudimos conectar con el servicio. Intentá de nuevo.');
 }
 let data;
 try{data=await response.json();}catch{throw new Error('No pudimos completar la consulta. Intentá nuevamente.');}
 if(!response.ok)throw new Error(data.error||'No se pudo completar la solicitud.');
 return normalizeSearch(data);
}
export const getSites=signal=>request('/api/sites',{signal});
export const getExplanationStatus=async(id,signal)=>{const data=await request(`/api/real-search/${encodeURIComponent(id)}/explanation`,{signal,timeoutMs:10000});if(data.contract!==AI_CONTRACT)throw new Error('Hay una actualización disponible. Recargá la página.');if(!['not_requested','pending','complete','error'].includes(data.status)||typeof data.configured!=='boolean')throw new Error('No pudimos recuperar el análisis.');return data;};
export const explainRealSearch=(id,signal)=>request(`/api/real-search/${encodeURIComponent(id)}/explanation`,{method:'POST',signal,timeoutMs:75000});
export const resolveLocations=(points,signal)=>request('/api/locations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({points:points.map(p=>({id:p.id,coordinates:p.coordinates}))}),signal,timeoutMs:30000});
export const startRealSearch=async(body,signal)=>{const health=await request('/api/health',{signal,timeoutMs:10000});if(health.contract!==AI_CONTRACT)throw new Error('Hay una actualización disponible. Recargá la página.');if(!health.geography?.countries||!health.geography?.regions)throw new Error('La búsqueda no está disponible en este momento. Intentá más tarde.');return request('/api/real-search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal});};
export const getRealSearch=(id,signal)=>request(`/api/real-search/${encodeURIComponent(id)}`,{signal});
export const cancelRealSearch=id=>request(`/api/real-search/${encodeURIComponent(id)}`,{method:'DELETE'});
export const searchGlobalPlaces=(query,signal)=>request(`/api/places?${new URLSearchParams({q:query})}`,{signal});
export const getTestingCatalog=signal=>request('/api/testing-catalog',{signal});
export const analyzePoint=(coordinates,signal)=>request('/api/analyze-point',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(coordinates),signal});
