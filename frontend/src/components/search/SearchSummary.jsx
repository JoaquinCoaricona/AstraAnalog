import {destinationName, MONTHS} from '../../data/searchFlow.js';
import {missionName} from '../../data/missionTypes.js';

export default function SearchSummary({search, tests, onEdit, compact = false}) {
  const selectedTests = search.selectedTestIds.map(id => tests.find(test => test.id === id)).filter(Boolean);
  const items = [
    {title: 'Misión y destino', value: `${missionName(search.missionType)} · ${destinationName(search.destination)}`, step: 0},
    {title: 'Pruebas y prioridades', value: selectedTests.length ? selectedTests.map(test => `${test.name} · ${search.priorities[test.id] ?? 3}/5`).join(' / ') : 'Todavía no elegiste pruebas', step: 1},
    {title: 'Alcance y límites del terreno', value: `${search.scope==='argentina'?'Solo Argentina':'Global'} · Pendiente hasta ${search.filters.maxSlope}° · NDVI hasta ${search.filters.maxNdvi} · ${search.filters.soilType === 'Todos' ? 'Cualquier sustrato' : search.filters.soilType}`, step: 2},
    {title: 'Fecha de las pruebas', value: MONTHS[search.month], step: 3},
  ];
  return <dl className={compact ? 'search-summary compact' : 'search-summary'}>{items.map(item => <div key={item.step} className="summary-item">
    <dt><span>{item.title}</span>{onEdit && <button type="button" onClick={() => onEdit(item.step)} aria-label={`Editar ${item.title.toLowerCase()}`}>Editar <span aria-hidden="true">↗</span></button>}</dt>
    <dd>{item.value}</dd>
  </div>)}</dl>;
}
