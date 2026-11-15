import {t,useI18n} from '../i18n/index.jsx';
import {useEffect,useState} from 'react';
import {satelliteImage,IMAGERY_CREDIT,IMAGERY_SOURCE} from '../services/imagery.js';
export default function LocationPhoto({point,caption,large=false}){
 useI18n();
 const imagery=satelliteImage(point.coordinates);
 return <SatelliteView key={imagery?.url||'invalid'} point={point} imagery={imagery} caption={caption} large={large}/>;
}
function SatelliteView({point,imagery,caption,large}){
 const [status,setStatus]=useState(imagery?'loading':'error'),[attempt,setAttempt]=useState(0);
 useEffect(()=>{if(status!=='loading')return;const timer=setTimeout(()=>setStatus('error'),20000);return()=>clearTimeout(timer);},[status,attempt]);
 const title=point.discovery?.name||point.name||t('el lugar seleccionado');
 return <figure className={large?'location-photo location-photo-detail':'location-photo'}>
 <div className="satellite-frame" aria-busy={status==='loading'}>
 {imagery&&status!=='error'&&<img key={attempt} src={imagery.url} width="640" height="320" decoding="async" onLoad={()=>setStatus('loaded')} onError={()=>setStatus('error')} alt={t('Vista satelital del entorno de ')+title+t('. La cruz indica el punto analizado.')}/>}
 {status==='loading'&&<span className="satellite-status" role="status">{t("🛰️ Cargando vista satelital…")}</span>}
 {status==='loaded'&&<><span className="satellite-label">{t("Vista satelital")}</span><span className="satellite-pin" aria-hidden="true">＋</span><a className="satellite-open" href={imagery.mapUrl} target="_blank" rel="noreferrer">{t("Explorar mapa ↗")}</a></>}
 {status==='error'&&<div className="location-photo-unavailable"><span>{t("🛰️ No se pudo cargar la vista satelital.")}</span>{imagery&&<div><button type="button" onClick={()=>{setAttempt(v=>v+1);setStatus('loading');}}>{t("Reintentar")}</button><a href={imagery.mapUrl} target="_blank" rel="noreferrer">{t("Abrir mapa ↗")}</a></div>}</div>}
 </div>
 <figcaption><p className="location-image-context">{caption||(t('Vista satelital del entorno de ')+title+t('. La cruz marca el punto consultado en las APIs.'))}</p><small>{t("Vista satelital de referencia · El marcador indica el punto analizado.")}</small><small>© {t(IMAGERY_CREDIT)}. <a href={imagery?.sourceUrl||IMAGERY_SOURCE} target="_blank" rel="noreferrer">Esri World Imagery ↗</a></small></figcaption>
 </figure>;
}
