export function rankSites(sites, { slope=8, vegetation=15, terrain='Todos', reliefWeight=60 }={}) {
 return sites.filter(s=>terrain==='Todos'||s.terrain===terrain).map(s=>{
 const slopeFit=Math.max(0,100-Math.abs(s.slope-slope)*6);
 const vegetationFit=Math.max(0,100-Math.max(0,s.vegetation-vegetation)*4);
 return {...s,score:Math.round(slopeFit*reliefWeight/100+vegetationFit*(100-reliefWeight)/100),slopeFit,vegetationFit};
 }).sort((a,b)=>b.score-a.score);
}
