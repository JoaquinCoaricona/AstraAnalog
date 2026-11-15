import {useEffect,useState} from 'react';
import {getTestingCatalog} from '../services/api.js';
export function useTestingCatalog(){
 const [catalog,setCatalog]=useState({tests:[],profiles:[]}),[loading,setLoading]=useState(true),[error,setError]=useState(''),[revision,setRevision]=useState(0);
 useEffect(()=>{const controller=new AbortController();setLoading(true);setError('');
  getTestingCatalog(controller.signal).then(data=>{
   if(!Array.isArray(data.tests)||!Array.isArray(data.profiles))throw new Error('El catálogo de ensayos tiene un formato inválido.');
   if(!controller.signal.aborted)setCatalog(data);
  }).catch(e=>{if(e.name!=='AbortError')setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return()=>controller.abort();
 },[revision]);
 return {...catalog,loading,error,retry:()=>setRevision(value=>value+1)};
}
