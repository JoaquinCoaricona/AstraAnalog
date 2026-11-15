import {geographicLocation} from './geographicLocation.js';
const finite=Number.isFinite;
const definitions={minWind:['wind','min',1],maxTemperature:['temperature','max',10],maxPrecipitation:['precipitation','max',1],minSlope:['slope','min',5],maxSlope:['slope','max',5]};
const focusKeys={wind:['minWind'],cold:['maxTemperature'],dry:['maxPrecipitation'],slopes:['minSlope','maxSlope']};
export function deviation(values,criteria,focus){
 let total=0;
 for(const [key,threshold]of Object.entries(criteria)){
  const [metric,op,scale]=definitions[key],value=values[metric];
  if(!finite(value))return Infinity;
  const difference=op==='min'?Math.max(0,threshold-value):Math.max(0,value-threshold);
  total+=difference/Math.max(scale,Math.abs(threshold))*(focusKeys[focus]?.includes(key)?2:1);
 }
 return total;
}
function focusValue(values,request){
 if(request.focus==='wind')return -values.wind;
 if(request.focus==='cold')return values.temperature;
 if(request.focus==='dry')return values.precipitation;
 const c=request.criteria;if(request.focus==='slopes')return Math.abs(values.slope-((c.minSlope??0)+(c.maxSlope??45))/2);
 return 0;
}
export function seasonFor(point,request){
 const months=point.months.filter(m=>m.month>0).map(month=>{
  const values={...month,slope:point.terrain.estimatedSlope};
  return {month:month.month,values,deviation:deviation(values,request.criteria,request.focus),focus:focusValue(values,request)};
 }).filter(m=>finite(m.deviation)&&finite(m.focus)).sort((a,b)=>a.deviation-b.deviation||a.focus-b.focus||a.month-b.month);
 if(!months.length)return {status:'unavailable',bestMonth:null,months:[],reason:'No hay datos mensuales suficientes.'};
 const exact=months.filter(m=>m.deviation===0);
 return {status:exact.length?'matches':'closest',bestMonth:months[0].month,months:months.slice(0,3).map(({focus,...m})=>m),matchingMonths:exact.map(m=>m.month),reason:exact.length?'Meses que cumplen los umbrales; el orden favorece tu condición principal.':'Ningún mes cumple todo. Se muestran los más cercanos con su desviación, sin cambiar tus requisitos.'};
}
export function selectCandidates(job){
 const exact=job.results||[];
 const closest=[...(job.excluded||[])].map(point=>{
  // También admite mediciones de trabajos anteriores que no incluyan values.
  const values={...point.values};
  let distance=0,missing=0;
  for(const check of point.checks||[]){
   const definition=definitions[check.key];if(!definition)continue;
   const [metric,op,scale]=definition;
   const value=finite(values[metric])?values[metric]:check.value;
   if(finite(value))values[metric]=value;
   if(!finite(value)){missing++;continue;}
   const delta=op==='min'?Math.max(0,check.threshold-value):Math.max(0,value-check.threshold);
   distance+=delta/Math.max(scale,Math.abs(check.threshold))*(focusKeys[job.request.focus]?.includes(check.key)?2:1);
  }
  const passed=(point.checks||[]).filter(c=>c.pass).length;
  return {...point,values,passed,missingRequirements:missing,requirementDeviation:distance};
 }).filter(p=>(p.checks||[]).some(c=>finite(c.value))||Object.values(p.values).some(finite)).sort((a,b)=>a.missingRequirements-b.missingRequirements||a.requirementDeviation-b.requirementDeviation||b.passed-a.passed||a.id.localeCompare(b.id)).slice(0,3);
 const candidates=(exact.length?exact:closest).map(p=>({...p,location:p.location?.label?p.location:geographicLocation(p.coordinates),requirementDeviation:p.requirementDeviation??0,season:p.months&&p.terrain?seasonFor(p,job.request):{status:'unavailable',bestMonth:null,months:[],reason:'Sin serie mensual para este punto.'}}));
 return {candidates,recommendationMode:exact.length?'exact':candidates.length?'closest':'unavailable'};
}
