import {t,useI18n} from '../i18n/index.jsx';
import {useEffect,useId,useRef} from 'react';
export default function Modal({title,onClose,children}){
 useI18n();
 const ref=useRef(null),id=useId();
 useEffect(()=>{const dialog=ref.current;const previous=document.activeElement;dialog.showModal();return()=>{dialog.close();previous?.focus?.();};},[]);
 return <dialog ref={ref} aria-labelledby={id} onCancel={event=>{event.preventDefault();onClose();}} onClick={event=>{if(event.target===ref.current){const r=ref.current.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)onClose();}}} className="fixed inset-0 m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-[1000px] overflow-auto rounded-xl border border-stone-200 bg-white p-5 text-[#243c30] shadow-2xl backdrop:bg-black/50 sm:p-7"><div className="mb-5 flex items-start justify-between gap-4"><h2 id={id} className="text-xl font-semibold">{title}</h2><button autoFocus onClick={onClose} aria-label={t("Cerrar comparación")} className="rounded border border-stone-200 px-3 py-1">×</button></div>{children}</dialog>;
}
