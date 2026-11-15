const STEP=180, RADIUS=6371000;
const rad=v=>v*Math.PI/180, deg=v=>v*180/Math.PI, round=v=>Math.round(v*100)/100;
function destination(lat,lon,bearing){
 const p=rad(lat),l=rad(lon),t=rad(bearing),d=STEP/RADIUS;
 const nextP=Math.asin(Math.sin(p)*Math.cos(d)+Math.cos(p)*Math.sin(d)*Math.cos(t));
 const nextL=l+Math.atan2(Math.sin(t)*Math.sin(d)*Math.cos(p),Math.cos(d)-Math.sin(p)*Math.sin(nextP));
 return [deg(nextP),((deg(nextL)+540)%360)-180];
}
function failure(message,status){return Object.assign(new Error(message),{status});}
export async function analyzePoint(lat,lon,{fetchImpl=fetch}={}){
 if(Math.abs(lat)>89.9)throw failure('Pendiente no disponible a menos de 0,1° de los polos.',422);
 const coordinates=[[lat,lon],...[0,90,180,270].map(b=>destination(lat,lon,b))];
 const url=new URL('https://api.open-meteo.com/v1/elevation');
 url.searchParams.set('latitude',coordinates.map(c=>c[0].toFixed(7)).join(','));
 url.searchParams.set('longitude',coordinates.map(c=>c[1].toFixed(7)).join(','));
 let data;
 try{
  const response=await fetchImpl(url,{signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw failure(response.status===429?'Límite de consultas del proveedor alcanzado. Intentá más tarde.':'El proveedor de elevación no pudo responder.',response.status===429?503:502);
  data=await response.json();
 }catch(error){if(error.status)throw error;throw failure(error.name==='TimeoutError'?'La consulta superó los 10 segundos.':'No se pudo consultar el servicio de elevación.',error.name==='TimeoutError'?504:502);}
 if(!Array.isArray(data.elevation)||data.elevation.length!==5||!data.elevation.every(Number.isFinite))throw failure('El proveedor devolvió elevaciones incompletas o inválidas.',502);
 const [center,north,east,south,west]=data.elevation;
 const dzdx=(east-west)/(2*STEP),dzdy=(north-south)/(2*STEP);
 return {coordinates:[lat,lon],elevation:center,estimatedSlope:round(deg(Math.atan(Math.hypot(dzdx,dzdy)))),localRelief:round(Math.max(...data.elevation)-Math.min(...data.elevation)),units:{elevation:'m',estimatedSlope:'degrees',localRelief:'m'},samples:coordinates.map((point,i)=>({coordinates:point,elevation:data.elevation[i],direction:['center','north','east','south','west'][i]})),samplingDistanceMeters:STEP,source:'Open-Meteo Elevation API · Copernicus DEM 2021 GLO-90',sourceUrl:'https://open-meteo.com/en/docs/elevation-api',attribution:'Copernicus DEM / Open-Meteo. API data CC BY 4.0.',retrievedAt:new Date().toISOString(),ndvi:null,soilType:null,roughness:null,limitations:'Pendiente aproximada por diferencias centrales de cinco elevaciones, vecinos a 180 m; resolución nominal del modelo: 90 m. Relieve local = rango de cinco muestras, no rugosidad de rocas. No mide NDVI, geología, resistencia del suelo ni aptitud para rovers. No se incorpora al ranking.'};
}
