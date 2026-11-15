export function geographicLocation([lat,lon]){
 if(lat<=-60){const sector=`Sector ${Math.abs(lon).toFixed(1)}° ${lon<0?'O':'E'}`;return {country:null,territory:'Antártida',region:sector,label:`Antártida · ${sector}`,status:'geographic',source:'Clasificación geográfica del punto antártico',note:'La Antártida no es un país. El sector describe una longitud, no una provincia.'};}
 return {country:null,region:null,territory:null,label:null,status:'unavailable',source:'Natural Earth',note:'Identificación administrativa no disponible; una sugerencia de IA se marca como aproximada.'};
}
