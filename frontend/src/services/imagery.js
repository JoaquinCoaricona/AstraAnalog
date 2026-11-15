export const IMAGERY_SOURCE='https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer';
export const IMAGERY_CREDIT='Esri, Vantor, Earthstar Geographics y la comunidad GIS';
export function satelliteImage(coordinates){
 if(!Array.isArray(coordinates)||coordinates.length!==2||!coordinates.every(Number.isFinite))return null;
 const [lat,lon]=coordinates;
 if(Math.abs(lat)>85||Math.abs(lon)>180)return null;
 const radius=6378137;
 const x=radius*lon*Math.PI/180,y=radius*Math.log(Math.tan(Math.PI/4+lat*Math.PI/360));
 // Siete kilómetros de alto aproximadamente; escala adaptada a la latitud.
 const halfHeight=3500/Math.max(.087,Math.cos(lat*Math.PI/180));
 const url=new URL(IMAGERY_SOURCE+'/export');
 for(const [key,value] of Object.entries({bbox:[x-2*halfHeight,y-halfHeight,x+2*halfHeight,y+halfHeight].join(','),bboxSR:3857,imageSR:3857,size:'640,320',format:'jpg',transparent:false,f:'image'}))url.searchParams.set(key,String(value));
 const map=new URL('https://www.arcgis.com/apps/mapviewer/index.html');
 map.searchParams.set('basemap','satellite');map.searchParams.set('center',lon+','+lat);map.searchParams.set('level','12');
 return {url:url.toString(),mapUrl:map.toString(),sourceUrl:IMAGERY_SOURCE};
}
