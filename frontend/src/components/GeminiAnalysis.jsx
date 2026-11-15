import {useEffect,useRef} from 'react';
import {getExplanationStatus} from '../services/api.js';
export default function GeminiAnalysis({job,onAnalysis,onStateChange}){
 const callbacks=useRef({onAnalysis,onStateChange});callbacks.current={onAnalysis,onStateChange};
 useEffect(()=>{const controller=new AbortController();getExplanationStatus(job.id,controller.signal).then(state=>{if(controller.signal.aborted)return;if(state.analysis)callbacks.current.onAnalysis?.(state.analysis);callbacks.current.onStateChange?.({status:state.analysis?'complete':'error'});}).catch(()=>{if(!controller.signal.aborted)callbacks.current.onStateChange?.({status:'error'});});return()=>controller.abort();},[job.id]);
 return null;
}
