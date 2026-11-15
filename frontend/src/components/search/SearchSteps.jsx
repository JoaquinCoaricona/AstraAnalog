import {DEFAULT_FILTERS, DESTINATIONS, MONTHS} from '../../data/searchFlow.js';
import SearchSummary from './SearchSummary.jsx';
import ScopeSelector from './ScopeSelector.jsx';
import {MISSION_TYPES, missionName} from '../../data/missionTypes.js';

export function DestinationStep({search, onChange}) {
  return <div><fieldset><legend className="mb-4 font-semibold">Tipo de misión</legend><div className="mission-type-options">{MISSION_TYPES.map(mission => <label key={mission.id} className={`destination-card ${search.missionType === mission.id ? 'is-selected' : ''}`}><div className="flex items-center justify-between"><span className="destination-symbol" aria-hidden="true">{mission.symbol}</span><input type="radio" name="mission-type" value={mission.id} checked={search.missionType === mission.id} onChange={() => onChange({missionType:mission.id,destination:mission.destination,selectedTestIds:[...mission.tests],focusTestId:mission.focus,priorities:Object.fromEntries(mission.tests.map(id=>[id,id===mission.focus?5:3]))})}/></div><span className="mt-4 block text-base font-semibold">{mission.name}</span><span className="mt-2 block text-xs leading-6 text-stone-500">{mission.description}</span></label>)}</div></fieldset><fieldset className="mt-7"><legend className="mb-4 font-semibold">Destino de referencia</legend><div className="destination-options">{DESTINATIONS.map(destination => <label key={destination.id} className={`destination-card ${search.destination === destination.id ? 'is-selected' : ''}`}>
    <div className="flex items-center justify-between"><span className="destination-symbol" aria-hidden="true">{destination.symbol}</span><input type="radio" name="destination" value={destination.id} checked={search.destination === destination.id} onChange={() => onChange({destination: destination.id})}/></div>
    <span className="mt-5 block text-lg font-semibold">{destination.name}</span><span className="mt-2 block text-sm leading-6 text-stone-500">{destination.description}</span>
  </label>)}</div><p className="flow-note mt-6">La misión propone ensayos y prioridades; podés modificarlos a continuación. El destino da contexto, no certifica similitud con una región de la Luna o Marte.</p></fieldset></div>;
}

export function TestsStep({search, tests, onChange}) {
  function toggle(id) {
    const next = search.selectedTestIds.includes(id) ? search.selectedTestIds.filter(value => value !== id) : [...search.selectedTestIds, id];
    const nextFocus = next.includes(search.focusTestId) ? search.focusTestId : (next[0] || '');
    onChange({selectedTestIds:next,focusTestId:nextFocus,...(nextFocus && nextFocus !== search.focusTestId ? {priorities:{...search.priorities,[nextFocus]:5}} : {})});
  }
  return <div><p className="flow-note mb-5">Para {missionName(search.missionType)} propusimos algunas pruebas. Podés agregar otras: buscá reproducir bien una condición, sin exigir que el lugar coincida con todo.</p><fieldset><legend className="sr-only">Pruebas y prioridades</legend><div className="space-y-3">{tests.map(test => {
    const selected = search.selectedTestIds.includes(test.id);
    return <div key={test.id} className={`test-option ${selected ? 'is-selected' : ''}`}>
      <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0" checked={selected} onChange={() => toggle(test.id)}/><span><span className="block font-semibold">{test.name}</span><span className="mt-1 block text-sm leading-6 text-stone-500">{test.description}</span></span></label>
      {selected && <div className="test-priority"><label htmlFor={`priority-${test.id}`} className="flex justify-between gap-3 text-sm"><span>¿Qué tan importante es?</span><output htmlFor={`priority-${test.id}`} className="font-semibold">{search.priorities[test.id] ?? 3}/5</output></label><input id={`priority-${test.id}`} type="range" min="1" max="5" value={search.priorities[test.id] ?? 3} onChange={event => onChange({priorities: {...search.priorities, [test.id]: Number(event.target.value)}})} className="mt-3 w-full"/><div className="flex justify-between text-xs text-stone-500"><span>Complementaria</span><span>Prioritaria</span></div></div>}
      <details className="mt-3 pl-7 text-xs leading-6 text-stone-500"><summary className="cursor-pointer">Qué se necesita evaluar</summary><p className="mt-2">{test.criteria}</p></details>
    </div>;
  })}</div></fieldset>{search.selectedTestIds.length>0&&<fieldset className="focus-fieldset"><legend>¿Qué característica querés priorizar?</legend><p className="flow-field-help mb-3">Le damos prioridad 5/5 para elegir la sede integral. El resultado también incluye un especialista para cada prueba.</p><div>{tests.filter(test=>search.selectedTestIds.includes(test.id)).map(test=><label key={test.id}><input type="radio" name="focus-test" checked={search.focusTestId===test.id} onChange={()=>onChange({focusTestId:test.id,priorities:{...search.priorities,...Object.fromEntries(search.selectedTestIds.map(id=>[id,id===test.id?5:Math.min(search.priorities[id]??3,4)]))}})}/>{test.name}</label>)}</div></fieldset>}</div>;
}

export function TerrainStep({search, soilTypes, onChange}) {
  const {filters} = search;
  const changeFilter = (key, value) => onChange({filters: {...filters, [key]: value}});
  return <div className="space-y-7">
    <ScopeSelector search={search} onChange={onChange}/>
    <div><label htmlFor="max-slope" className="flow-field-label"><span>Pendiente máxima</span><output htmlFor="max-slope">{filters.maxSlope}°</output></label><p id="slope-help" className="flow-field-help">Inclinación máxima admitida. Para pruebas de ascenso, permití pendientes mayores.</p><input id="max-slope" type="range" min="0" max="45" value={filters.maxSlope} onChange={event => changeFilter('maxSlope', Number(event.target.value))} aria-describedby="slope-help" className="mt-4 w-full"/><div className="flex justify-between text-xs text-stone-500"><span>0° · Plano</span><span>45° · Muy inclinado</span></div></div>
    <div className="border-t border-stone-100 pt-6"><label htmlFor="max-ndvi" className="flow-field-label"><span>Vegetación máxima · NDVI</span><output htmlFor="max-ndvi">{filters.maxNdvi.toFixed(2)}</output></label><p id="ndvi-help" className="flow-field-help">El NDVI es un indicador de vegetación. Un límite bajo suele excluir zonas vegetadas; no demuestra que el suelo sea transitable.</p><input id="max-ndvi" type="range" min="-1" max="1" step="0.01" value={filters.maxNdvi} onChange={event => changeFilter('maxNdvi', Number(event.target.value))} aria-describedby="ndvi-help" className="mt-4 w-full"/><div className="flex justify-between text-xs text-stone-500"><span>−1</span><span>1 · Mayor vegetación</span></div></div>
    <div className="border-t border-stone-100 pt-6"><label htmlFor="soil-type" className="block font-semibold">Tipo de sustrato</label><p id="soil-help" className="flow-field-help">Elegí un material si tu prueba lo necesita o mantené todas las opciones.</p><select id="soil-type" className="flow-select mt-3" value={filters.soilType} onChange={event => changeFilter('soilType', event.target.value)} aria-describedby="soil-help"><option value="Todos">Cualquier sustrato</option>{soilTypes.map(type => <option key={type}>{type}</option>)}</select></div>
    <button type="button" className="text-sm font-medium underline underline-offset-4" onClick={() => onChange({filters: {...DEFAULT_FILTERS}})}>Usar los límites sugeridos</button>
  </div>;
}

export function TimingStep({search, onChange}) {
  return <div><label htmlFor="campaign-month" className="block font-semibold">Mes de las pruebas</label><select id="campaign-month" className="flow-select mt-3" value={search.month} onChange={event => onChange({month: Number(event.target.value)})} aria-describedby="month-help">{MONTHS.map((month, index) => <option key={month} value={index}>{month}</option>)}</select><p id="month-help" className="flow-field-help">Si todavía no tenés una fecha, dejá “Sin fecha definida”.</p><div className="flow-note mt-7"><strong className="block">La época del año también importa</strong><p className="mt-2">Nieve, viento y temperatura pueden cambiar las condiciones del lugar. Todavía no contamos con ventanas estacionales verificadas: el mes queda registrado, pero no modifica el orden de los resultados.</p></div></div>;
}

export function ReviewStep({search, tests, onEdit}) {
  return <div><SearchSummary search={search} tests={tests} onEdit={onEdit}/><div className="flow-note mt-6"><strong className="block">Qué vas a recibir</strong><p className="mt-2">Una comparación del catálogo internacional de referencia, un candidato que equilibre tus pruebas y alternativas para cada ensayo.</p><p className="mt-2">Los lugares son reales; los valores del catálogo y los puntajes son ilustrativos. El destino elegido no cambia el ranking ni representa una comparación planetaria validada.</p></div></div>;
}
