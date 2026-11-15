export const MISSION_TYPES = [
 {id:'mars-rover',name:'Rover en Marte',symbol:'◉',description:'Navegación, ruedas y exposición a partículas.',destination:'mars',tests:['dust','traction','navigation'],focus:'navigation'},
 {id:'lunar-rover',name:'Rover en la Luna',symbol:'☾',description:'Movilidad sobre terreno inclinado y obstáculos.',destination:'moon',tests:['traction','navigation','slopes'],focus:'slopes'},
 {id:'surface-station',name:'Estación de superficie',symbol:'⌁',description:'Sensores y equipos expuestos a polvo o frío.',destination:'undecided',tests:['dust','cold'],focus:'cold'},
 {id:'robotics',name:'Ensayo de robótica',symbol:'↗',description:'Una capacidad concreta, sin destino definido.',destination:'undecided',tests:['navigation'],focus:'navigation'},
];
export const missionName=id=>MISSION_TYPES.find(m=>m.id===id)?.name||'Sin elegir';
