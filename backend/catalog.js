import {readFileSync} from 'node:fs';
const read=name=>JSON.parse(readFileSync(new URL(name,import.meta.url),'utf8'));
const argentina=read('./sites.json').map(site=>({...site,country:'Argentina',scope:'argentina'}));
const global=read('./globalSites.json').map(site=>({...site,
 scope:'global',dataStatus:'illustrative',coordinateStatus:'Referencia regional aproximada; no zona autorizada de ensayo',
 description:`Referencia geográfica internacional: ${site.name}, ${site.country}. El perfil físico y de ensayo es únicamente una hipótesis de interfaz, sin validación del lugar.`,
 roverTestTypes:['Evaluación preliminar pendiente'],
 limitations:'Los parámetros y la clasificación de material se asignaron para la demo y NO describen mediciones del sitio. No se evaluaron accesos, restricciones, peligros ni permisos. No existe ventana estacional confirmada.',
 sources:'Localización de referencia aproximada. Pendiente, NDVI, sustrato y rugosidad sintéticos; no obtenidos de NASADEM ni Sentinel. Perfiles de ensayo reutilizados como hipótesis de demostración.'
}));
export const sites=[...argentina,...global];
const original=read('./testingCatalog.json');
export const testingCatalog={...original,profiles:[...original.profiles,...global.map(site=>{
 const base=original.profiles.find(profile=>profile.siteId===site.referenceProfile);
 return {siteId:site.id,assessments:Object.fromEntries(original.tests.map(test=>[test.id,{
  score:base?.assessments?.[test.id]?.score??null,
  reason:`Puntaje hipotético reutilizado de un perfil de demostración para explorar ${test.name.toLowerCase()}. No se midió esta condición en ${site.name}; requiere datos propios y validación.`
 }]))};
})],methodNote:'Catálogo internacional de referencia. Los puntajes adicionales son perfiles sintéticos reutilizados para demostrar el alcance global, no resultados científicos. Sin ventanas estacionales verificadas.'};
