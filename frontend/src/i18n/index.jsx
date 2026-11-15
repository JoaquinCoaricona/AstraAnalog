import {createContext,useContext,useEffect,useState} from 'react';
import english from './en.js';
function preference(){try{return localStorage.getItem('astraanalog-language')==='en'?'en':'es';}catch{return 'es';}}
let currentLanguage=preference();
const LanguageContext=createContext(null);
export function t(text){
 if(currentLanguage!=='en'||typeof text!=='string')return text;
 if(english[text]!==undefined)return english[text];
 const range=text.match(/^Ingresá un número entre (.+) y (.+)\.$/);
 return range?'Enter a number between '+range[1]+' and '+range[2]+'.':text;
}
export function LanguageProvider({children}){
 const [language,setValue]=useState(currentLanguage);
 function setLanguage(next){if(!['es','en'].includes(next))return;currentLanguage=next;setValue(next);try{localStorage.setItem('astraanalog-language',next);}catch{}}
 useEffect(()=>{document.documentElement.lang=language;document.title=language==='en'?'AstraAnalog · Find your test environment':'AstraAnalog · Encontrá tu lugar de ensayo';},[language]);
 return <LanguageContext.Provider value={{language,setLanguage,t}}>{children}</LanguageContext.Provider>;
}
export function useI18n(){return useContext(LanguageContext);}
export function LanguageSwitch(){const {language,setLanguage}=useI18n();return <button type="button" className="language-switch" onClick={()=>setLanguage(language==='es'?'en':'es')} aria-label={language==='es'?'Switch to English':'Cambiar a español'}><span aria-hidden="true">🌐</span> {language==='es'?'English':'Español'}</button>;}
