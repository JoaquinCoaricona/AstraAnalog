export async function searchPlaces(query,{fetchImpl=fetch}={}){
 const url=new URL('https://geocoding-api.open-meteo.com/v1/search');
 url.searchParams.set('name',query);url.searchParams.set('count','12');url.searchParams.set('language','es');url.searchParams.set('format','json');
 try{
  const response=await fetchImpl(url,{signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw Object.assign(new Error(response.status===429?'El buscador alcanzó su cuota. Intentá más tarde.':'El buscador global no pudo responder.'),{status:response.status===429?503:502});
  const data=await response.json();
  if(data.results!==undefined&&!Array.isArray(data.results))throw new Error('Respuesta inválida del proveedor.');
  return {results:(data.results||[]).filter(p=>Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)).map(p=>({id:p.id,name:p.name,country:p.country||'Sin país informado',region:p.admin1||'',coordinates:[p.latitude,p.longitude],elevation:Number.isFinite(p.elevation)?p.elevation:null})),source:'Open-Meteo Geocoding / GeoNames',sourceUrl:'https://open-meteo.com/en/docs/geocoding-api',limitations:'Búsqueda por nombres indexados, principalmente localidades. No descubre automáticamente terrenos por condiciones ni certifica análogos. Para zonas remotas usá coordenadas.'};
 }catch(error){if(error.status)throw error;throw Object.assign(new Error(error.name==='TimeoutError'?'La búsqueda global superó los 10 segundos.':'No se pudo consultar el buscador global.'),{status:error.name==='TimeoutError'?504:502});}
}
