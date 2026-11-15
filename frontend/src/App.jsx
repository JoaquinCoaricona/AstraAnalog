import {t,useI18n,LanguageProvider,LanguageSwitch} from './i18n/index.jsx';
import {lazy, Suspense, useState} from 'react';
import Landing from './components/Landing.jsx';

const SearchExperience = lazy(() => import('./components/SearchExperience.jsx'));

function AppContent() {
 useI18n();
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
    {hasStarted && <div hidden={!started}><Suspense fallback={<main className="landing-loading" role="status"><span aria-hidden="true">✳</span><p>{t("Preparando tu búsqueda…")}</p></main>}><SearchExperience active={started} onHome={() => navigate(false)}/></Suspense></div>}
  </>;
}

export default function App(){return <LanguageProvider><LanguageSwitch/><AppContent/></LanguageProvider>;}
