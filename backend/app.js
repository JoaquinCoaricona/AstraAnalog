import express from 'express';
import {fileURLToPath} from 'node:url';
import {sites,testingCatalog} from './catalog.js';
import {searchPlaces} from './services/geocodingService.js';
import {matchSites} from './matchingEngine.js';
import {analyzePoint} from './services/elevationService.js';
import {recommendSites} from './recommendationEngine.js';
import {startRealSearch,getRealSearch,cancelRealSearch} from './services/realSearchService.js';
import {explainSearch,getExplanationStatus} from './services/geminiService.js';
import {resolveLocation} from './services/locationService.js';
import {AI_CONTRACT} from './contracts.js';
import {existsSync} from 'node:fs';
export const app=express();
app.disable('x-powered-by');
app.use((req,res,next)=>{
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 res.setHeader('X-Frame-Options','DENY');
 if(req.path.startsWith('/api/'))res.setHeader('Cache-Control','no-store');
 next();
});
app.use(express.json({limit:'8kb'}));
app.post('/api/locations',async(req,res,next)=>{
 const points=req.body?.points;
 if(!Array.isArray(points)||points.length>24||points.some(p=>typeof p.id!=='string'||p.id.length>120||!Array.isArray(p.coordinates)||p.coordinates.length!==2||!p.coordinates.every(Number.isFinite)||Math.abs(p.coordinates[0])>90||Math.abs(p.coordinates[1])>180))return res.status(400).json({error:'Lista de coordenadas inválida.'});
 try{const locations=[];for(const point of points)locations.push({id:point.id,location:await resolveLocation(point.coordinates)});res.json({contract:AI_CONTRACT,locations});}catch(error){next(error);}
});
app.post('/api/real-search/:id/explanation',async(req,res,next)=>{try{res.json(await explainSearch(req.params.id));}catch(error){next(error);}});
app.get('/api/real-search/:id/explanation',(req,res,next)=>{try{res.json(getExplanationStatus(req.params.id));}catch(error){next(error);}});
app.post('/api/real-search',(req,res,next)=>{try{res.status(202).json(startRealSearch(req.body));}catch(error){next(error);}});
app.get('/api/real-search/:id',(req,res,next)=>{try{res.json(getRealSearch(req.params.id));}catch(error){next(error);}});
app.delete('/api/real-search/:id',(req,res,next)=>{try{res.json(cancelRealSearch(req.params.id));}catch(error){next(error);}});
app.get('/api/health',(_req,res)=>res.json({status:'ok',contract:AI_CONTRACT,geography:{countries:existsSync(new URL('./data/countries.geojson',import.meta.url)),regions:existsSync(new URL('./data/regions.geojson',import.meta.url))}}));
app.get('/api/sites',(_req,res)=>res.json({sites,dataStatus:'illustrative'}));
app.get('/api/testing-catalog',(_req,res)=>res.json(testingCatalog));
app.get('/api/places',async(req,res,next)=>{
 const query=typeof req.query.q==='string'?req.query.q.trim():'';
 if(query.length<3||query.length>120)return res.status(400).json({error:'Ingresá entre 3 y 120 caracteres para buscar un lugar.'});
 try{res.json(await searchPlaces(query));}catch(error){next(error);}
});
app.post('/api/recommendations',(req,res)=>{
 const body=req.body??{};
 const {filters={},selectedTestIds=[],priorities={},month=0,scope='global'}=body;
 if(!['global','argentina'].includes(scope))return res.status(400).json({error:'El alcance debe ser global o argentina.'});
 const isObject=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
 if(!isObject(filters)||!isObject(priorities)||!Array.isArray(selectedTestIds)||selectedTestIds.some(id=>typeof id!=='string')||selectedTestIds.length>testingCatalog.tests.length)return res.status(400).json({error:'Filtros, ensayos o prioridades inválidos.'});
 for(const [key,min,max] of [['maxSlope',0,45],['maxNdvi',-1,1]])if(filters[key]!==undefined&&(typeof filters[key]!=='number'||!Number.isFinite(filters[key])||filters[key]<min||filters[key]>max))return res.status(400).json({error:`${key} debe estar entre ${min} y ${max}.`});
 if(filters.soilType!==undefined&&!['Todos',...sites.map(s=>s.soilType)].includes(filters.soilType))return res.status(400).json({error:'Sustrato no reconocido.'});
 try{
  // Las prioridades de campaña son independientes del antiguo índice físico.
  const eligible=matchSites(scope==='argentina'?sites.filter(s=>s.country==='Argentina'):sites,filters,{slope:60,ndvi:40,soilType:0});
  const plan=recommendSites(eligible,testingCatalog.tests,testingCatalog.profiles,{selectedTestIds,priorities,month});
  res.json({...plan,dataStatus:testingCatalog.dataStatus,methodNote:testingCatalog.methodNote});
 }catch(error){res.status(400).json({error:error.message});}
});
app.post('/api/match',(req,res)=>{
 const {filters={},weights={}}=req.body??{};
 if(!filters||typeof filters!=='object'||Array.isArray(filters)||!weights||typeof weights!=='object'||Array.isArray(weights))return res.status(400).json({error:'filters y weights deben ser objetos.'});
 for(const [key,min,max] of [['maxSlope',0,45],['maxNdvi',-1,1]])if(filters[key]!==undefined&&(typeof filters[key]!=='number'||!Number.isFinite(filters[key])||filters[key]<min||filters[key]>max))return res.status(400).json({error:`${key} debe estar entre ${min} y ${max}.`});
 if(filters.soilType!==undefined&&!['Todos',...sites.map(s=>s.soilType)].includes(filters.soilType))return res.status(400).json({error:'Sustrato no reconocido.'});
 for(const key of ['slope','ndvi','soilType'])if(weights[key]!==undefined&&(typeof weights[key]!=='number'||!Number.isFinite(weights[key])||weights[key]<0||weights[key]>100))return res.status(400).json({error:`Peso ${key} inválido (0–100).`});
 try{res.json({sites:matchSites(sites,filters,weights),dataStatus:'illustrative'});}catch(error){res.status(400).json({error:error.message});}
});
app.post('/api/analyze-point',async(req,res,next)=>{
 const {lat,lon}=req.body??{};
 if(typeof lat!=='number'||typeof lon!=='number'||!Number.isFinite(lat)||!Number.isFinite(lon)||lat < -90||lat>90||lon < -180||lon>180)return res.status(400).json({error:'lat y lon deben ser números: latitud −90 a 90, longitud −180 a 180.'});
 try{res.json(await analyzePoint(lat,lon));}catch(error){next(error);}
});
if(process.env.NODE_ENV==='production'){
 const dist=fileURLToPath(new URL('../frontend/dist/',import.meta.url));
 app.use(express.static(dist,{index:'index.html',maxAge:'1h',setHeaders:(res,path)=>{if(path.endsWith('.html'))res.setHeader('Cache-Control','no-cache');}}));
 app.get(/^(?!\/api(?:\/|$)).*/,(_req,res,next)=>res.sendFile('index.html',{root:dist,headers:{'Cache-Control':'no-cache'}},error=>{if(error)next(error);}));
}
app.use((_req,res)=>res.status(404).json({error:'No encontramos esta página.'}));
app.use((error,_req,res,_next)=>{
 const status=error.type==='entity.too.large'?413:error.type==='entity.parse.failed'?400:error.status||500;
 res.status(status).json({error:status>=500?'No pudimos completar la solicitud. Intentá más tarde.':error.type==='entity.parse.failed'?'El cuerpo debe ser JSON válido.':error.type==='entity.too.large'?'Solicitud demasiado grande.':error.message});
});
