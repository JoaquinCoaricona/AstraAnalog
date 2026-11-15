export function placeIdentity(point,explanation){
 const [lat,lon]=point.coordinates;
 if(point.discovery?.name){const location=point.location||{};return {title:point.discovery.name,country:location.country||location.territory||point.discovery.country,region:location.region||point.discovery.region,ai:location.status==='discovery-proposal',proposed:true};}
 if(lat<=-60){const sector=`Sector ${Math.abs(lon).toFixed(1)}° ${lon<0?'O':'E'}`;return {title:`Antártida · ${sector}`,country:'Antártida',region:sector,ai:false};}
 if(point.location?.label)return {title:point.location.label,country:point.location.country||point.location.territory||'Región geográfica',region:point.location.region||point.location.country,ai:false};
 if(explanation?.location?.label)return {title:explanation.location.label,country:explanation.location.country||'Región sugerida',region:explanation.location.region||explanation.location.label,ai:true};
 const label=`Sector ${Math.abs(lat).toFixed(1)}° ${lat<0?'S':'N'} · ${Math.abs(lon).toFixed(1)}° ${lon<0?'O':'E'}`;
 return {title:label,country:'Referencia geográfica',region:label,ai:false};
}
