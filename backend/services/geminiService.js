import '../config.js';
import {getRealSearch} from './realSearchService.js';
import {AI_CONTRACT} from '../contracts.js';
// Esta vista reutiliza la única respuesta del descubrimiento. No importa el cliente HTTP.
function savedAnalysis(job){
 if(!job.discovery)return null;
 const points=job.candidates||[];
 return {summary:job.discovery.summary,recommendedId:null,candidates:points.map(p=>({id:p.id,reasonTitle:p.discovery.reasonTitle,why:p.discovery.rationale,tradeoffs:p.discovery.accessCaveat,imageCaption:p.discovery.imageCaption,bestFor:p.discovery.bestFor,metricNotes:{},evidenceKeys:[],origin:'discovery-before-measurements'})),limitations:['La argumentación se generó antes de medir: es una propuesta del modelo sin búsqueda web ni referencias verificadas. Los umbrales, meses y orden final se calculan localmente con las APIs; no son una segunda evaluación del modelo.'],model:job.discovery.model,inputBytes:job.discovery.inputBytes,usage:job.discovery.usage,createdAt:job.discovery.createdAt,calls:1,pipelineCalls:1,origin:'discovery-before-measurements'};
}
export function getExplanationStatus(id){
 const job=getRealSearch(id),analysis=savedAnalysis(job);
 return {contract:AI_CONTRACT,configured:Boolean(process.env.GEMINI_API_KEY),model:job.discovery?.model||process.env.GEMINI_MODEL||'gemini-3.5-flash-lite',status:analysis?'complete':job.status==='running'?'pending':'error',analysis,error:analysis?null:job.error||'No se recibió la respuesta inicial.',startedAt:job.startedAt};
}
export async function explainSearch(id){
 const state=getExplanationStatus(id);
 if(state.analysis)return state.analysis;
 throw Object.assign(new Error(state.error||'La búsqueda todavía está en curso.'),{status:state.status==='pending'?409:502});
}
