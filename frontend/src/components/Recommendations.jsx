import {MONTHS} from '../data/searchFlow.js';

function Season({assessment, month}) {
  const {season} = assessment;
  return <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs leading-6"><strong className={season.status === 'supported' ? 'text-lime-800' : 'text-amber-900'}>{season.label}{month ? ` · ${MONTHS[month]}` : ''}</strong>{season.months.length > 0 && <p>Ventana: {season.months.map(value => MONTHS[value]).join(', ')}. Fuente: {season.source}</p>}{season.status === 'unknown' && <p className="mt-1 text-stone-500">Para recomendar cuándo: {assessment.evidenceNeeded}</p>}</div>;
}

export function OverallRecommendation({plan, onSelect}) {
  const best = plan.overall[0];
  if (!best) return null;
  return <section className="overall-recommendation" aria-label="Candidato integral">
    <div><p className="text-xs font-semibold uppercase tracking-[.15em] text-lime-200">Mejor equilibrio para tus pruebas · Demo</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">{best.site.name}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">Es el primer candidato del catálogo para el conjunto de pruebas que elegiste. Su punto más débil es <strong className="text-white">{best.weakestTest.testName.toLowerCase()}</strong>.</p><div className="mt-4 flex flex-wrap gap-2">{best.assessments.map(assessment => <span key={assessment.testId} className="rounded-full border border-white/20 px-3 py-1 text-xs text-lime-100">{assessment.shortName}: {assessment.score ?? 'sin datos'}{assessment.score === null ? '' : '/100'}</span>)}</div><button onClick={() => onSelect(best.site.id)} className="mt-5 text-sm font-semibold text-lime-200 underline underline-offset-4">Seleccionar este lugar en el mapa ↗</button></div>
    <div className="overall-score"><strong>{best.score}<span>/100</span></strong><p className="mt-2 text-xs leading-6 text-stone-300">Índice ilustrativo de campaña</p><p className="mt-3 text-xs leading-6 text-stone-300">{best.coverage.covered} de {best.coverage.total} pruebas alcanzan el umbral demo de {plan.coverageThreshold}.</p></div>
  </section>;
}

export function SpecialistRecommendations({plan, onSelect}) {
  return <section aria-labelledby="specialists-title"><h2 id="specialists-title" className="text-2xl font-semibold">Un candidato para cada prueba</h2><p className="mb-5 mt-2 text-sm leading-7 text-stone-500">Si priorizás un solo ensayo, el lugar recomendado puede cambiar. Todos respetan los límites de terreno que elegiste.</p><div className="grid gap-5 lg:grid-cols-2">{plan.specialists.map(({test, best, candidates}) => <article key={test.id} className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
    <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-lime-900">{test.name}</h3>{best && <strong className="whitespace-nowrap text-xl">{best.assessment.score}/100</strong>}</div>
    {best ? <><button onClick={() => onSelect(best.site.id)} className="mt-4 text-left text-xl font-semibold underline decoration-stone-300 underline-offset-4">{best.site.name} ↗</button><p className="mt-3 text-sm leading-7 text-stone-500">{best.assessment.reason}</p><details className="mt-3 text-xs leading-6 text-stone-500"><summary className="cursor-pointer">Límites y evidencia pendiente</summary><p className="mt-2">{test.limitation}</p></details>{best.assessment.score < plan.coverageThreshold && <p className="mt-3 text-xs leading-6 text-amber-900">Ningún candidato alcanza el umbral demo de cobertura para esta prueba.</p>}<Season assessment={best.assessment} month={plan.month}/><details className="mt-4 text-sm"><summary className="cursor-pointer text-stone-500">Otras alternativas ({Math.max(0, candidates.length - 1)})</summary><ol className="mt-3 space-y-2">{candidates.slice(1).map(candidate => <li key={candidate.site.id}><button onClick={() => onSelect(candidate.site.id)} className="flex w-full justify-between gap-3 rounded-lg bg-stone-50 p-3 text-left text-xs"><span>{candidate.site.name}</span><strong className="whitespace-nowrap">{candidate.assessment.score}/100</strong></button></li>)}{candidates.length === 1 && <li className="text-xs text-stone-500">No hay otros lugares dentro de los límites elegidos.</li>}</ol></details></> : <p className="mt-4 text-sm text-stone-500">No hay perfiles disponibles para esta prueba.</p>}
  </article>)}</div></section>;
}

export function CampaignOptions({plan, onSelect}) {
  const best = plan.overall[0];
  if (!best) return null;
  return <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-semibold">¿Una sede o varios lugares?</h2><p className="mt-2 text-sm leading-7 text-stone-500">Podés considerar {best.site.name} para el conjunto de pruebas o explorar los primeros clasificados de cada ensayo. Esta agrupación no calcula viajes, costos ni fechas comunes.</p><ul className="mt-4 space-y-2">{plan.campaign.map(item => <li key={item.site.id} className="rounded-lg bg-stone-50 p-3 text-sm"><button className="font-semibold underline" onClick={() => onSelect(item.site.id)}>{item.site.name}</button><span className="text-stone-500"> · {item.assignments.map(assignment => assignment.testName).join(' / ')}</span></li>)}</ul></section>;
}

export default function Recommendations({plan, onSelect, selectedTestIds, loading}) {
  if (loading) return <p role="status">Preparando recomendaciones…</p>;
  if (!selectedTestIds.length) return <p>Elegí al menos una prueba para obtener recomendaciones.</p>;
  if (!plan.overall.length) return <p>No hay candidatos dentro de los límites elegidos.</p>;
  return <div className="space-y-6"><OverallRecommendation plan={plan} onSelect={onSelect}/><SpecialistRecommendations plan={plan} onSelect={onSelect}/><CampaignOptions plan={plan} onSelect={onSelect}/></div>;
}
