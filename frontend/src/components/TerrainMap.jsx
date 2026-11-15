import {useEffect,useRef,useState} from 'react';
import {MapContainer,TileLayer,CircleMarker,Tooltip,useMap,useMapEvents} from 'react-leaflet';
function MapTools({sites,selected,point,onSelectPoint}){
 const map=useMap(),first=useRef(true);
 function showAll(){if(sites.length)map.fitBounds(sites.map(s=>s.coordinates),{padding:[35,35],maxZoom:7});else map.setView([15,0],2);}
 useEffect(()=>{if(first.current){showAll();first.current=false;}else if(selected)map.flyTo(selected.coordinates,8,{duration:1});},[map,selected?.id]);
 useEffect(()=>{if(point)map.flyTo([point.lat,point.lon],9,{duration:1});},[map,point?.lat,point?.lon]);
 useMapEvents({dblclick:e=>onSelectPoint({lat:e.latlng.lat,lon:e.latlng.lng})});
 return <button type="button" onClick={showAll} style={{position:'absolute',right:12,top:12,zIndex:1000}} className="rounded border border-stone-200 bg-white px-3 py-2 text-xs shadow">Ver todos los sitios</button>;
}
function SitePin({site,selected,onSelect}){
 const map=useMap();
 return <CircleMarker center={site.coordinates} radius={selected?12:8} pathOptions={{color:selected?'#fff':'#4e733c',weight:2,fillColor:'#a3d56d',fillOpacity:1}} eventHandlers={{click:()=>{onSelect(site.id);map.flyTo(site.coordinates,8,{duration:1});}}}><Tooltip>{site.name}{site.country?` · ${site.country}`:''} · {site.mission?`${site.mission.score}/100 campaña demo`:(Number.isFinite(site.match)?`${site.match}% ajuste físico demo`:'punto medido por APIs')}</Tooltip></CircleMarker>;
}
export default function TerrainMap({sites,selected,onSelect,onSelectPoint,point}){
 const [satellite,setSatellite]=useState(false);
 return <section className="overflow-hidden rounded-xl border border-stone-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-2 p-4"><div><h2 className="text-sm font-semibold">Explorador global de terrenos</h2><p className="mt-1 text-[11px] text-stone-500">Doble clic en cualquier país para consultar elevación.</p></div><button className="rounded border border-stone-200 px-3 py-2 text-xs" onClick={()=>setSatellite(v=>!v)}>{satellite?'Ver mapa':'Ver satélite'}</button></div><div className="relative z-0 h-[420px] sm:h-[500px]"><MapContainer center={[15,0]} zoom={2} minZoom={2} doubleClickZoom={false}><TileLayer key={satellite?'sat':'map'} url={satellite?'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}':'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'} attribution={satellite?'Tiles © Esri — Esri, Maxar, Earthstar Geographics':'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}/>{sites.map(site=><SitePin key={site.id} site={site} selected={selected?.id===site.id} onSelect={onSelect}/>)}{point&&<CircleMarker center={[point.lat,point.lon]} radius={8} pathOptions={{color:'#fff',fillColor:'#d47735',fillOpacity:1}}><Tooltip>Punto seleccionado para análisis</Tooltip></CircleMarker>}<MapTools sites={sites} selected={selected} point={point} onSelectPoint={onSelectPoint}/></MapContainer></div><div className="border-t border-stone-100 px-4 py-3 text-[10px] text-stone-500">Verde: candidatos de la búsqueda activa · Naranja: punto externo · Las imágenes no calculan NDVI ni aptitud.</div></section>;
}
