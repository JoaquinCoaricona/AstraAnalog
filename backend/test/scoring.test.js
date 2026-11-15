import test from 'node:test';
import assert from 'node:assert/strict';
import { rankSites } from '../scoring.js';
test('priorizar pendiente cambia el candidato y respeta tipo de terreno',()=>{
 const sites=[{id:'a',slope:2,vegetation:30,terrain:'Volcánico'},{id:'b',slope:12,vegetation:0,terrain:'Sedimentario'}];
 assert.equal(rankSites(sites,{slope:2,vegetation:0,reliefWeight:100})[0].id,'a');
 assert.equal(rankSites(sites,{slope:2,vegetation:0,reliefWeight:0})[0].id,'b');
 assert.deepEqual(rankSites(sites,{terrain:'Volcánico'}).map(s=>s.id),['a']);
});
