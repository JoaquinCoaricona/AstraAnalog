import {useEffect, useRef} from 'react';
import {ArrowRight} from '../../icons.jsx';
import {SEARCH_STEPS} from '../../data/searchFlow.js';
import SearchSummary from './SearchSummary.jsx';
import {DestinationStep, TestsStep, TerrainStep, TimingStep, ReviewStep} from './SearchSteps.jsx';

export default function SearchWizard({wizard, tests, soilTypes, loading, loadError, onRetry}) {
  const {draft, step, furthestStep, error, update, next, submit, goToStep} = wizard;
  const heading = useRef(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current !== step) {
      heading.current?.focus({preventScroll: true});
      heading.current?.scrollIntoView({block: 'start', behavior: 'instant'});
      previousStep.current = step;
    }
  }, [step]);
  const lastStep = step === SEARCH_STEPS.length - 1;
  const needsCatalog = step === 1 || lastStep;
  const blocked = needsCatalog && (loading || Boolean(loadError));
  const guidance = [
    'La misión sugiere pruebas; el destino solo da contexto. Podés cambiar ambas cosas sin buscar una copia completa de otro planeta.',
    'Elegí qué necesitás reproducir con más fidelidad. La prueba prioritaria pesa más en el lugar integral; cada prueba tendrá además su propio especialista.',
    'Estos máximos descartan lugares. Si buscás probar ascenso, no excluyas todos los terrenos inclinados. Podés conservar los valores sugeridos.',
    'No hace falta fijar la fecha ahora. Una tormenta o un extremo térmico necesita evidencia estacional; el paisaje por sí solo no alcanza.',
    'Primero vas a ver la sede integral. Después abrí “Por prueba” para encontrar el lugar más conveniente para cada característica.',
  ];

  return <div className="search-layout">
    <div className="min-w-0">
      <nav aria-label="Pasos de la búsqueda" className="flow-progress"><ol>{SEARCH_STEPS.map((item, index) => <li key={item.label} className={`${index === step ? 'current' : ''} ${index < step ? 'complete' : ''}`}><button type="button" disabled={index > furthestStep} onClick={() => goToStep(index)} aria-current={step === index ? 'step' : undefined}><span className="step-number" aria-hidden="true">{index < step ? '✓' : index + 1}</span><span>{item.label}</span><span className="sr-only">, paso {index + 1} de {SEARCH_STEPS.length}</span></button></li>)}</ol></nav>
      <form noValidate className="wizard-card" onSubmit={event => {event.preventDefault(); if (!blocked) {if (lastStep) submit(); else next();}}}>
        <div className="wizard-heading"><p className="flow-eyebrow">Paso {step + 1} de {SEARCH_STEPS.length}{step === 3 ? ' · Opcional' : ''}</p><h2 ref={heading} tabIndex={-1} className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{SEARCH_STEPS[step].title}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-stone-500">{SEARCH_STEPS[step].description}</p></div>
        <div className="wizard-content">
          {needsCatalog && loading && <p role="status" className="flow-note mb-5">Cargando las pruebas y los candidatos…</p>}
          {needsCatalog && loadError && <div role="alert" className="flow-error mb-5"><p>{loadError}</p><button type="button" onClick={onRetry} className="mt-2 font-semibold underline">Volver a cargar</button></div>}
          {step === 0 && <DestinationStep search={draft} onChange={update}/>}
          {step === 1 && !loading && !loadError && <TestsStep search={draft} tests={tests} onChange={update}/>}
          {step === 2 && <TerrainStep search={draft} soilTypes={soilTypes} onChange={update}/>}
          {step === 3 && <TimingStep search={draft} onChange={update}/>}
          {lastStep && <ReviewStep search={draft} tests={tests} onEdit={goToStep}/>}
          <aside className="wizard-coach" aria-label="Orientación para este paso"><strong>Te acompañamos en este paso</strong>{guidance[step]}</aside>
          {error && <p role="alert" className="flow-error mt-5">{error}</p>}
        </div>
        <div className="wizard-actions"><button type="button" className="flow-secondary" onClick={() => goToStep(step - 1)} disabled={step === 0}>← Anterior</button><button type="submit" disabled={blocked} className="flow-primary">{lastStep ? 'Buscar candidatos' : 'Continuar'}<ArrowRight size={17}/></button></div>
      </form>
    </div>
    <aside className="search-companion"><span className="companion-mark" aria-hidden="true">✳</span><p className="flow-eyebrow mt-6">Tu búsqueda, paso a paso</p><h2 className="mt-3 text-2xl font-semibold leading-tight">De las condiciones<br/>al lugar de ensayo.</h2><p className="mt-4 text-sm leading-7 text-stone-500">Primero definimos qué necesitás. Al final, comparamos los lugares del catálogo.</p><div className="mt-7 border-t border-stone-200 pt-2"><SearchSummary search={draft} tests={tests} compact/></div><p className="mt-6 text-xs leading-6 text-stone-500">Podés volver a los pasos anteriores. Tus elecciones se conservan mientras seguís en la página.</p></aside>
  </div>;
}
