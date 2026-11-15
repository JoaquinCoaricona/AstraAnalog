import Modal from './Modal.jsx';
import {MONTHS} from '../data/searchFlow.js';
export default function ComparisonModal({sites,filters,month=0,onClose}){
 const tests=sites[0]?.mission?.assessments??[];
 const rows=[
  ...(tests.length?[
   ['Índice integral de campaña',s=>s.mission?`${s.mission.score}/100 (demo)`:'Sin datos'],
   ['Promedio ponderado sin penalización',s=>s.mission?`${s.mission.weightedMean}/100`:'Sin datos'],
   ['Factor de equilibrio',s=>s.mission?`${s.mission.balanceFactor}%`:'Sin datos'],
   ['Cobertura de ensayos (umbral demo 65)',s=>s.mission?`${s.mission.coverage.covered} de ${s.mission.coverage.total}`:'Sin datos'],
   ...tests.map(test=>[`${test.testName} · prioridad ${test.weight}/5`,s=>{const a=s.mission?.assessments.find(item=>item.testId===test.testId);return a?`${a.score??'Sin datos'}${a.score===null?'':'/100'} · ${a.reason}`:'Sin datos';}]),
   ['Época por ensayo',s=>s.mission?.assessments.map(a=>`${a.shortName}: ${a.season.label}${a.season.months.length?` (${a.season.months.map(m=>MONTHS[m]).join(', ')}) · ${a.season.source}`:''}`).join(' / ')||'Sin evidencia'],
  ]:[]),
  ['Ajuste físico anterior (no es el índice de campaña)',s=>`${s.match}% (ilustrativo)`],
  ['Pendiente',s=>`${s.slope}°`],['NDVI',s=>s.ndvi.toFixed(2)],['Sustrato',s=>s.soilType],['Rugosidad cualitativa',s=>s.roughness],['Coordenadas aproximadas',s=>s.coordinates.join(', ')],['Ensayos conceptuales del catálogo',s=>s.roverTestTypes.join(' · ')],['Límites de la analogía',s=>s.limitations],['Fuentes físicas y estado',s=>s.sources]
 ];
 return <Modal title="Comparación de candidatos" onClose={onClose}><p className="mb-4 text-xs leading-6 text-stone-500">Restricciones: pendiente ≤ {filters.maxSlope}° · NDVI ≤ {filters.maxNdvi} · sustrato: {filters.soilType}. Mes: {MONTHS[month]}. Puntajes ilustrativos: no certifican idoneidad ni disponibilidad de fenómenos.</p><div className="overflow-x-auto"><table className="w-full min-w-[560px] border-collapse text-left text-xs"><caption className="sr-only">Comparación integral, por ensayo y de variables físicas</caption><thead><tr><th scope="col" className="w-1/4 bg-stone-100 p-4">Variable o ensayo</th>{sites.map(s=><th scope="col" key={s.id} className="bg-lime-50 p-4 text-sm text-lime-900">{s.name}</th>)}</tr></thead><tbody>{rows.map(([label,render])=><tr key={label} className="border-b border-stone-100"><th scope="row" className="p-4 align-top font-medium">{label}</th>{sites.map(s=><td key={s.id} className="w-[37.5%] p-4 align-top leading-6 text-stone-600">{render(s)}</td>)}</tr>)}</tbody></table></div><p className="mt-4 rounded bg-amber-50 p-3 text-xs leading-6 text-amber-900">Los puntajes por ensayo se asignaron manualmente para la demo; no se deducen de mediciones meteorológicas. Menor pendiente o NDVI no siempre favorecen la prueba que querés hacer.</p></Modal>;
}
