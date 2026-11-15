/** Motor puro compartido por React y API. Filtra máximos inclusivos y luego
 * prioriza pendientes/NDVI menores mediante escalas fijas. No mide similitud
 * planetaria. NDVI bajo no demuestra por sí solo transitabilidad. */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const numeric = (v, fallback) => typeof v === 'number' && Number.isFinite(v) ? v : fallback;
export function matchSites(sites, filters = {}, weights = {}) {
 const maxSlope = clamp(numeric(filters.maxSlope, 30), 0, 45);
 const maxNdvi = clamp(numeric(filters.maxNdvi, 0.3), -1, 1);
 const soilType = filters.soilType || 'Todos';
 const active = {slope: Math.max(0,numeric(weights.slope,60)), ndvi: Math.max(0,numeric(weights.ndvi,40)), soilType: soilType === 'Todos' ? 0 : Math.max(0,numeric(weights.soilType,0))};
 const total = Object.values(active).reduce((a,b)=>a+b,0);
 if (!total) throw new RangeError('Asigná un peso positivo a pendiente o NDVI, o a un sustrato seleccionado.');
 return sites.filter(s=>Number.isFinite(s.slope)&&s.slope>=0&&s.slope<=maxSlope&&Number.isFinite(s.ndvi)&&s.ndvi>=-1&&s.ndvi<=maxNdvi&&(soilType==='Todos'||s.soilType===soilType)).map(site=>{
  const breakdown={slope:clamp(1-site.slope/45,0,1)*100,ndvi:clamp((1-site.ndvi)/2,0,1)*100,soilType:soilType==='Todos'?null:100};
  const match=Object.entries(active).reduce((sum,[key,weight])=>sum+(breakdown[key]??0)*weight,0)/total;
  return {...site,match:Math.round(match*10)/10,breakdown,normalizedWeights:Object.fromEntries(Object.entries(active).map(([key,value])=>[key,value/total]))};
 }).sort((a,b)=>b.match-a.match||a.id.localeCompare(b.id));
}
export default matchSites;
