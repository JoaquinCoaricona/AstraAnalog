import 'leaflet/dist/leaflet.css';
import UnifiedJourney from './UnifiedJourney.jsx';

export default function SearchExperience({onHome, active}) {
  // Returning home releases map rendering and cancels active search requests.
  if (!active) return null;
  return <>
    <a href="#main-content" className="skip-link">Saltar al contenido</a>
    <header className="app-header"><div className="header-inner"><button onClick={onHome} className="brand" aria-label="Astra Analog, inicio"><span aria-hidden="true" className="brand-symbol">✳</span><span>Astra<span className="text-lime-200">Analog</span></span></button><span className="journey-header-label">Una misión. Un recorrido.</span><button className="prototype-badge" onClick={onHome}>Volver al inicio ↗</button></div></header>
    <main id="main-content" className="app-main"><UnifiedJourney/><footer className="app-footer"><span>AstraAnalog · Preparar la exploración desde la Tierra</span><span>Exploración lunar y marciana</span></footer></main>
  </>;
}
