import {t,useI18n} from '../i18n/index.jsx';
import {useState} from 'react';
import Modal from './Modal.jsx';
import {placeIdentity} from '../data/placeIdentity.js';
import TerrainMap from './TerrainMap.jsx';
import LocationPhoto from './LocationPhoto.jsx';
import {MONTHS} from '../data/searchFlow.js';
const fmt=value=>Number.isFinite(value)?value.toFixed(2):t('Sin datos');
const METRICS=[{key:'wind',label:'Viento medio',icon:'💨',unit:'m/s',tab:'weather'},{key:'temperature',label:'Temperatura media',icon:'❄️',unit:'°C',tab:'weather'},{key:'precipitation',label:'Precipitación media',icon:'🌦️',unit:'mm/día',tab:'weather'},{key:'slope',label:'Pendiente estimada',icon:'⛰️',unit:'°',tab:'terrain'}];
function placeName(point,explanation){return placeIdentity(point,explanation).title;}
function coordinate([lat,lon]){return `${Math.abs(lat).toFixed(3)}° ${lat<0?'S':'N'} · ${Math.abs(lon).toFixed(3)}° ${lon<0?t('O'):'E'}`;}
function deterministic(point){const failed=point.checks.filter(c=>!c.pass);return failed.length?t('Este lugar se acerca a tu búsqueda; revisá las condiciones que no cumple.'):t('Cumple los umbrales solicitados. Confirmá las condiciones locales y el acceso antes del ensayo.');}
function bestId(points,request){return [...points].sort((a,b)=>{
 const distance=(a.requirementDeviation??0)-(b.requirementDeviation??0);if(distance)return distance;
 if(request.focus==='wind')return b.values.wind-a.values.wind;
 if(request.focus==='cold')return a.values.temperature-b.values.temperature;
 if(request.focus==='dry')return a.values.precipitation-b.values.precipitation;
 return Math.abs(a.values.slope-((request.criteria.minSlope??0)+(request.criteria.maxSlope??45))/2)-Math.abs(b.values.slope-((request.criteria.minSlope??0)+(request.criteria.maxSlope??45))/2);
 })[0]?.id;}
function SeasonSummary({point,explanation}){
 const season=point.season;
 return <div className="location-season"><strong>📅 {season?.bestMonth?`${season.status==='matches'?t('Mes destacado'):t('Mes más cercano')}: ${t(MONTHS[season.bestMonth])}`:t('Época sin datos suficientes')}</strong><p>{explanation?.seasonWhy||t(season?.reason)||t('Faltan datos mensuales para comparar épocas.')}</p>{season?.status==='closest'&&<small>{t("Ningún mes cumple todos tus requisitos. La sugerencia es aproximada.")}</small>}</div>;
}
export default function LocationResults({job,analysis}){
 useI18n();
 const [detail,setDetail]=useState(null),[tab,setTab]=useState('overview');
 const points=job.candidates||job.results||[],chosen=analysis?.recommendedId||bestId(points,job.request);
 const ordered=[...points].sort((a,b)=>(b.id===chosen?1:0)-(a.id===chosen?1:0));
 function open(point,nextTab='overview'){setDetail(point);setTab(nextTab);}
 const explanation=detail?analysis?.candidates.find(c=>c.id===detail.id):null;
 const relevant={wind:'wind',cold:'temperature',dry:'precipitation',slopes:'slope'};
 const visibleMetrics=METRICS.filter(m=>(job.request.objectives||[]).some(o=>relevant[o]===m.key));
 return <section className="locations-results" aria-labelledby="locations-heading"><h2 id="locations-heading" className="sr-only">{t("Candidatos para tu ensayo")}</h2>
 
 <div className="locations-grid">{ordered.map((point,index)=>{const note=analysis?.candidates.find(c=>c.id===point.id),recommended=point.id===chosen,identity=placeIdentity(point,note);return <article className={`location-card ${recommended?'recommended':''}`} key={point.id}><div className="location-card-top"><span>📍 {[identity.region,identity.country].filter(Boolean).join(' · ')}</span>{recommended&&<strong>{point.matches?t('Recomendado'):t('Alternativa cercana')}</strong>}</div><h3>{identity.title}</h3><p className="location-coordinates">{coordinate(point.coordinates)}</p><LocationPhoto point={point} caption={note?.imageCaption}/><div className="location-card-body"><p className="location-analysis-label">{t("Por qué considerarlo")}</p>{note?.reasonTitle&&<h4 className="recommendation-reason">{note.reasonTitle}</h4>}<p className="location-why">{note?.why||deterministic(point)}</p><div className="location-readings">{(visibleMetrics.length?visibleMetrics:METRICS.slice(0,2)).map(m=><div key={m.key}><span>{t(m.label)}</span><strong>{fmt(point.values[m.key])} <small>{t(m.unit)}</small></strong></div>)}</div>{note?.bestFor&&<p className="location-bestfor">🎯 {note.bestFor}</p>}<details className="card-measurements"><summary>{t("Ver mediciones →")}</summary><div className="location-metric-buttons">{METRICS.map(m=><button key={m.key} onClick={()=>open(point,m.tab)}><span>{m.icon} {t(m.label)}</span><strong>{fmt(point.values[m.key])} <small>{t(m.unit)}</small></strong><em>{t("Ver explicación →")}</em></button>)}</div></details><SeasonSummary point={point} explanation={note}/>{!point.matches&&<p className="location-mismatch">⚠️ {t('No cumple:')} {point.checks.filter(c=>!c.pass).map(c=>`${t(c.label)} (${fmt(c.value)} ${t('frente a')} ${c.threshold})`).join(' · ')}</p>}<button className="flow-primary w-full" onClick={()=>open(point)}>{t("Ver ficha completa →")}</button></div></article>;})}</div>
 {detail&&<Modal title={`📍 ${placeName(detail,explanation)}`} onClose={()=>setDetail(null)}><div className="place-detail"><div className="location-detail-tabs" aria-label={t("Secciones del lugar")}>{[['overview',t('✨ Resumen')],['weather',t('🌦️ Clima y meses')],['terrain',t('⛰️ Terreno y mapa')],['sources',t('📋 Condiciones')]].map(([id,label])=><button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}</button>)}</div>
 {tab==='overview'&&<><LocationPhoto point={detail} caption={explanation?.imageCaption} large/><div className="detail-context"><h3>{t("¿Por qué considerar este lugar?")}</h3><p>{explanation?.why||deterministic(detail)}</p><h3>{t("¿Qué limita su elección?")}</h3><p>{explanation?.tradeoffs||t('Las mediciones son regionales y aproximadas. Falta validar el sitio, permisos y condiciones locales.')}</p><SeasonSummary point={detail} explanation={explanation}/></div></>}
 {tab==='weather'&&<><h3 className="detail-section-title">{t("🌦️ Qué clima tiene y cuándo conviene")}</h3><SeasonSummary point={detail} explanation={explanation}/><p className="detail-caption">{t("Promedios climáticos mensuales para comparar épocas del año.")}</p>{METRICS.filter(m=>m.key!=='slope').map(m=><div className="detail-measurement" key={m.key}><strong>{m.icon} {t(m.label)}: {fmt(detail.values[m.key])} {t(m.unit)}</strong><p>{explanation?.metricNotes?.[m.key]||t('Promedio histórico regional de NASA POWER.')}</p></div>)}<div className="overflow-x-auto"><table className="location-months"><caption>{t("Comparación mensual del mismo punto")}</caption><thead><tr><th>{t("Mes")}</th><th>{t("Viento m/s")}</th><th>{t("Temp. °C")}</th><th>{t("Lluvia mm/día")}</th><th>{t("Tu búsqueda")}</th></tr></thead><tbody>{detail.months.filter(m=>m.month>0).map(m=><tr className={m.month===detail.season?.bestMonth?'best-month':''} key={m.month}><th scope="row">{t(MONTHS[m.month])}{m.month===detail.season?.bestMonth?' ★':''}</th><td>{fmt(m.wind)}</td><td>{fmt(m.temperature)}</td><td>{fmt(m.precipitation)}</td><td>{detail.qualifyingMonths.includes(m.month)?t('Cumple'):t('No cumple todo')}</td></tr>)}</tbody></table></div><p className="detail-caption">{t("★ Mes más favorable según tus condiciones.")}</p></>}
 {tab==='terrain'&&<><h3 className="detail-section-title">{t("⛰️ Terreno y localización")}</h3><div className="detail-measurement"><strong>{t('Pendiente estimada:')} {fmt(detail.values.slope)}° · {t('Elevación:')} {fmt(detail.terrain.elevation)} m</strong><p>{explanation?.metricNotes?.slope||t('Estimación del relieve alrededor del punto seleccionado.')}</p></div><TerrainMap sites={points.map(p=>({id:p.id,name:placeName(p),coordinates:p.coordinates}))} selected={{id:detail.id,coordinates:detail.coordinates}} onSelect={id=>setDetail(points.find(p=>p.id===id))} point={null} onSelectPoint={()=>{}}/></>}
 {tab==='sources'&&<><h3 className="detail-section-title">{t("📋 Condiciones del lugar")}</h3><ul className="detail-checks">{detail.checks.map(c=><li key={c.key}><strong>{c.pass?'✅':'⚠️'} {t(c.label)}</strong><p>{t('Valor:')} {fmt(c.value)} · {t('Objetivo:')} {c.threshold}</p></li>)}</ul><p className="detail-caption">{t("Datos climáticos: NASA POWER. Elevación: Copernicus DEM vía Open-Meteo.")}</p><p className="detail-caption">{t("Antes de planificar un ensayo, confirmá el acceso, los permisos y las condiciones locales.")}</p></>}
 </div></Modal>}
 </section>;
}
