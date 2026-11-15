import {lazy, Suspense, useState} from 'react';
import Landing from './components/Landing.jsx';

const SearchExperience = lazy(() => import('./components/SearchExperience.jsx'));

export default function App() {
  const [started, setStarted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  function navigate(next) {
    setStarted(next);
    if (next) setHasStarted(true);
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    window.scrollTo({top: 0, behavior: 'instant'});
  }
  return <>
    {!started && <Landing onStart={() => navigate(true)}/>}
    {hasStarted && <div hidden={!started}><Suspense fallback={<main className="landing-loading" role="status"><span aria-hidden="true">✳</span><p>Preparando tu búsqueda…</p></main>}><SearchExperience active={started} onHome={() => navigate(false)}/></Suspense></div>}
  </>;
}
