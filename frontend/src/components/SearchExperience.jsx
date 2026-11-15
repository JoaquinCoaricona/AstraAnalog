import {t,useI18n} from '../i18n/index.jsx';
import 'leaflet/dist/leaflet.css';
import UnifiedJourney from './UnifiedJourney.jsx';

export default function SearchExperience({onHome, active}) {
 useI18n();
  // Returning home releases map rendering and cancels active search requests.
  if (!active) return null;
  return <>
    <a href="#main-content" className="skip-link">{t("Saltar al contenido")}</a>
    <header className="app-header"><div className="header-inner"><button onClick={onHome} className="brand" aria-label={t("Astra Analog, inicio")}><span aria-hidden="true" className="brand-symbol">✳</span><span>Astra<span className="text-lime-200">Analog</span></span></button><span className="journey-header-label">{t("Una misión. Un recorrido.")}</span><button className="prototype-badge" onClick={onHome}>{t("Volver al inicio ↗")}</button></div></header>
    <main id="main-content" className="app-main"><UnifiedJourney/><footer className="app-footer"><span>{t("AstraAnalog · Preparar la exploración desde la Tierra")}</span><span>{t("Exploración lunar y marciana")}</span></footer></main>
  </>;
}
