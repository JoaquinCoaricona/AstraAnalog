import {useEffect, useMemo, useRef, useState} from 'react';
import {matchSites} from '../../../../backend/matchingEngine.js';
import {recommendSites} from '../../../../backend/recommendationEngine.js';
import {destinationName, MONTHS} from '../../data/searchFlow.js';
import {OverallRecommendation, SpecialistRecommendations, CampaignOptions} from '../Recommendations.jsx';
import TerrainMap from '../TerrainMap.jsx';
import Sidebar from '../Sidebar.jsx';
import SiteDetails from '../SiteDetails.jsx';
import PointAnalyzer from '../PointAnalyzer.jsx';
import ComparisonModal from '../ComparisonModal.jsx';
import SearchSummary from './SearchSummary.jsx';
import {missionName} from '../../data/missionTypes.js';
import GlobalPlaceSearch from '../GlobalPlaceSearch.jsx';
import FilterDiagnostics from './FilterDiagnostics.jsx';

export default function SearchResults({search, sites, tests, profiles, onEdit, onReset}) {
  const [section, setSection] = useState('overview');
  const [selectedId, setSelectedId] = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [point, setPoint] = useState(null);
  const heading = useRef(null);
  const scopedSites = useMemo(()=>search.scope==='argentina'?sites.filter(s=>s.country==='Argentina'):sites,[sites,search.scope]);
  useEffect(() => {heading.current?.focus({preventScroll: true}); window.scrollTo({top: 0, behavior: 'instant'});}, []);

  const result = useMemo(() => {
    try {
      const eligible = matchSites(scopedSites, search.filters, {slope: 60, ndvi: 40, soilType: 0});
      const plan = recommendSites(eligible, tests, profiles, search);
      return {plan, candidates: plan.overall.map(recommendation => ({...recommendation.site, mission: recommendation})), error: ''};
    } catch (error) {return {plan: null, candidates: [], error: error.message};}
  }, [scopedSites, tests, profiles, search]);
  const {plan, candidates, error} = result;
  const selected = candidates.find(site => site.id === selectedId) || candidates[0] || null;
  const validCompareIds = compareIds.filter(id => candidates.some(site => site.id === id));
  const compared = validCompareIds.map(id => candidates.find(site => site.id === id));

  function toggleCompare(id) {
    setCompareIds(previous => previous.includes(id) ? previous.filter(value => value !== id) : previous.length < 2 ? [...previous, id] : previous);
  }
  function selectSite(id) {setSelectedId(id); setSection('overview');}
  function selectPoint(next) {setPoint(next); setSection('point');}
  const sections = [['overview', 'Vista general'], ['specialists', 'Por prueba'], ['point', 'Consultar otro punto']];

  return <div>
    <div className="results-heading"><div><p className="flow-eyebrow">Búsqueda completada · {search.scope==='argentina'?'Argentina':'Catálogo global'}</p><h1 ref={heading} tabIndex={-1} className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Estos son tus candidatos.</h1><p className="mt-3 text-sm leading-7 text-stone-500">Contexto: {destinationName(search.destination)} · {search.selectedTestIds.length} {search.selectedTestIds.length === 1 ? 'prueba elegida' : 'pruebas elegidas'} · {MONTHS[search.month]}</p></div><div className="flex flex-wrap gap-3"><button className="flow-secondary" onClick={() => onEdit(4)}>Editar búsqueda</button><button className="flow-primary" onClick={onReset}>Nueva búsqueda <span aria-hidden="true">↗</span></button></div></div>
    <div className="guided-result-help"><strong>{missionName(search.missionType)} · ¿Cómo seguir?</strong><p>En “Vista general” encontrás el mejor equilibrio de campaña. En “Por prueba” ves el especialista para cada condición. Seleccioná un candidato para ubicarlo en el mapa y revisar sus límites.</p><button className="mt-2 font-semibold underline" onClick={()=>setSection('specialists')}>Ver el mejor lugar para cada característica →</button></div>
    <details className="mb-5 rounded-xl border border-stone-200 bg-white p-4 sm:p-5"><summary className="cursor-pointer text-sm font-semibold">Ver las condiciones de esta búsqueda</summary><SearchSummary search={search} tests={tests} onEdit={onEdit}/></details>
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900"><strong>Resultados de demostración.</strong> Lugares reales, valores físicos y puntajes ilustrativos. El destino es contexto: no se calculó similitud con una región lunar o marciana. El mes no modifica el ranking. Las recomendaciones requieren validación.</div>
    <GlobalPlaceSearch onSelectPoint={selectPoint}/>
    {error ? <div role="alert" className="flow-error"><p>{error}</p><button onClick={() => onEdit(4)} className="mt-3 underline">Revisar mi búsqueda</button></div> : <>
      <div role="tablist" aria-label="Explorar los resultados" className="results-tabs">{sections.map(([id, label]) => <button key={id} id={`tab-${id}`} role="tab" aria-selected={section === id} aria-controls={section === id ? `panel-${id}` : undefined} tabIndex={section === id ? 0 : -1} onClick={() => setSection(id)} onKeyDown={event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const index = sections.findIndex(([value]) => value === id);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? sections.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + sections.length) % sections.length;
        setSection(sections[next][0]);
        document.getElementById(`tab-${sections[next][0]}`)?.focus();
      }}>{label}</button>)}</div>
      <section role="tabpanel" id={`panel-${section}`} aria-labelledby={`tab-${section}`} tabIndex={0} className="space-y-6">
        {!candidates.length && section !== 'point' ? <div className="empty-results"><span aria-hidden="true" className="text-4xl">↗</span><h2 className="mt-4 text-2xl font-semibold">Ningún sitio del catálogo cumple esta combinación.</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-500">Se compararon {scopedSites.length} referencias. No significa que no exista un lugar adecuado en el mundo. Usá el buscador global de arriba o revisá qué límites excluyen los candidatos.</p><FilterDiagnostics sites={scopedSites} filters={search.filters} onEdit={onEdit}/></div> : <>
          {section === 'overview' && <><OverallRecommendation plan={plan} onSelect={selectSite}/><div className="results-grid"><Sidebar sites={candidates} selectedId={selected?.id} onSelect={setSelectedId} compareIds={validCompareIds} onToggleCompare={toggleCompare} onCompare={() => setShowCompare(true)} loading={false} error=""/><div className="min-w-0 space-y-5"><TerrainMap sites={candidates} selected={selected} onSelect={setSelectedId} point={point} onSelectPoint={selectPoint}/><details key={selected?.id} className="rounded-xl border border-stone-200 bg-white"><summary className="cursor-pointer p-5 text-sm font-semibold">Ver ficha y evidencia de {selected?.name}</summary><SiteDetails site={selected} onToggleCompare={toggleCompare} isCompared={validCompareIds.includes(selected?.id)} compareFull={validCompareIds.length === 2}/></details></div></div></>}
          {section === 'specialists' && <><SpecialistRecommendations plan={plan} onSelect={selectSite}/><CampaignOptions plan={plan} onSelect={selectSite}/></>}
          {section === 'point' && <div className="results-grid point-grid"><PointAnalyzer point={point} onSelectPoint={setPoint}/><TerrainMap sites={candidates} selected={selected} onSelect={setSelectedId} point={point} onSelectPoint={setPoint}/></div>}
        </>}
      </section>
    </>}
    {showCompare && compared.length === 2 && <ComparisonModal sites={compared} filters={search.filters} month={search.month} onClose={() => setShowCompare(false)}/>}
  </div>;
}
