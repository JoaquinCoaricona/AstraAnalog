import {t,useI18n} from '../i18n/index.jsx';
import '../landing.css';
import LandingVideo from './LandingVideo.jsx';

export default function Landing({onStart}) {
 useI18n();
  return <main id="inicio" className="landing-shell">
    <section className="landing-hero" aria-labelledby="landing-title">
      <LandingVideo/>
      <div className="hero-shade" aria-hidden="true"/>
      <header className="landing-heading"><h1 id="landing-title">Astra<span>Analog</span></h1></header>
      <div className="hero-copy">
        <p className="hero-headline">{t("El viaje empieza")}<br/><em>{t("antes del despegue.")}</em></p>
        <p className="hero-description">{t("Encontrá lugares en la Tierra para ensayar condiciones de exploración lunar y marciana, a partir de datos de terreno y clima.")}</p>
        <button type="button" className="landing-cta" onClick={onStart}>{t("Empezar búsqueda")}</button>
      </div>
    </section>
  </main>;
}
