import {readFile} from 'node:fs/promises';
const BASE='https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
let datasets,loadedAt=0;
const cache=new Map();
const boxes=new WeakMap();
function inRing([x,y],ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [a,b]=ring[i],[c,d]=ring[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)inside=!inside;}return inside;}
function contains(g,point){
 if(!g)return false;
 let box=boxes.get(g);if(!box){box=[Infinity,Infinity,-Infinity,-Infinity];const walk=coordinates=>{if(typeof coordinates[0]==='number'){box[0]=Math.min(box[0],coordinates[0]);box[1]=Math.min(box[1],coordinates[1]);box[2]=Math.max(box[2],coordinates[0]);box[3]=Math.max(box[3],coordinates[1]);}else for(const child of coordinates)walk(child);};walk(g.coordinates);boxes.set(g,box);}
 if(point[0]<box[0]||point[0]>box[2]||point[1]<box[1]||point[1]>box[3])return false;
 const polygons=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];return polygons.some(p=>inRing(point,p[0])&&!p.slice(1).some(h=>inRing(point,h)));
}
async function load(){
 if(!datasets||Date.now()-loadedAt>3600000){loadedAt=Date.now();datasets=Promise.allSettled([{file:'countries.geojson',remote:'ne_110m_admin_0_countries.geojson'},{file:'regions.geojson',remote:'ne_10m_admin_1_states_provinces.geojson'}].map(async item=>{
  let data;try{data=JSON.parse(await readFile(new URL('../data/'+item.file,import.meta.url),'utf8'));}catch{const response=await fetch(BASE+item.remote,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error('Límites no disponibles.');data=await response.json();}
  if(!Array.isArray(data.features))throw new Error('Formato inválido.');return data.features;
 })).then(values=>values.map(v=>v.status==='fulfilled'?v.value:[]));}
 return datasets;
}
export function geographicLocation([lat,lon],language='es'){
 if(lat<=-60){const sector=`Sector ${Math.abs(lon).toFixed(1)}° ${lon<0?(language==='en'?'W':'O'):'E'}`;const territory=language==='en'?'Antarctica':'Antártida';return {country:null,territory,region:sector,label:`${territory} · ${sector}`,status:'geographic',source:'Clasificación geográfica del punto terrestre antártico',note:'La Antártida no es un país ni tiene provincias de soberanía universalmente reconocida. El sector indica longitud, no una división administrativa.'};}
 return {country:null,region:null,territory:null,label:null,status:'unavailable',source:'Natural Earth',note:'No se dispone de identificación administrativa para el punto. La IA puede sugerir una región amplia, marcada como aproximada.'};
}
export async function resolveLocation(coordinates,language='es'){
 const key=language+':'+coordinates.join(',');if(cache.has(key))return cache.get(key);
 const fallback=geographicLocation(coordinates,language);if(fallback.status==='geographic')return fallback;
 try{
  const [countries,regions]=await load(),[lat,lon]=coordinates,point=[lon,lat];
  const country=countries.find(f=>contains(f.geometry,point))?.properties;
  const region=regions.find(f=>contains(f.geometry,point))?.properties;
  const countryName=language==='en'?(country?.NAME_EN||country?.name_en||country?.ADMIN||country?.admin||country?.NAME||country?.name||region?.admin||null):(country?.NAME_ES||country?.name_es||country?.ADMIN||country?.admin||country?.NAME||country?.name||region?.admin||null);
  const regionName=language==='en'?(region?.name_en||region?.name||region?.NAME||null):(region?.name_es||region?.name||region?.NAME||null);
  const result={...fallback,country:countryName,region:regionName,label:[regionName,countryName].filter(Boolean).join(', ')||null,status:countryName?'approximate':'unavailable',source:'Natural Earth · países y subdivisiones',sourceUrl:'https://www.naturalearthdata.com/',note:'Identificación aproximada por polígonos administrativos; fronteras e islas pueden diferir de otras fuentes.'};
  if(result.label)cache.set(key,result);if(cache.size>500)cache.delete(cache.keys().next().value);return result;
 }catch{return fallback;}
}
