const dunes={src:'/backgrounds/dunes.jpg',credit:'Imagen real · NASA/METI/AIST/Japan Space Systems · ASTER',source:'https://science.nasa.gov/photojournal/namibia-dunes/'};
const ice={src:'/backgrounds/ice.jpg',credit:'Imagen real · NASA Terra/Aqua MODIS · NSIDC',source:'https://science.nasa.gov/earth/earth-observatory/high-resolution-mosaic-of-antarctica-6087/'};
const terrain={src:'/backgrounds/terrain.jpg',credit:'Imagen satelital real · Esri y colaboradores',source:'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'};
export function stepPhoto(step,draft){if(step==='cold'||step==='month'||draft.focus==='cold'&&['focus','review'].includes(step))return ice;if(['slopeMin','slopeMax','region'].includes(step))return terrain;return dunes;}
