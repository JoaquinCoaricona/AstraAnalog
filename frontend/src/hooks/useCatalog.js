import {useEffect,useState} from 'react';
import {getSites} from '../services/api.js';
export function useCatalog(){
 const [sites,setSites]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[revision,setRevision]=useState(0);
 useEffect(()=>{const controller=new AbortController();setLoading(true);setError('');
  getSites(controller.signal).then(data=>{if(!Array.isArray(data.sites))throw new Error('El catálogo tiene un formato inválido.');setSites(data.sites);}).catch(e=>{if(e.name!=='AbortError')setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return()=>controller.abort();
 },[revision]);
 return {sites,loading,error,retry:()=>setRevision(v=>v+1)};
}
