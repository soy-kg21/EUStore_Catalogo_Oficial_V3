'use client';
import {useEffect,useRef} from 'react';
import {useRouter} from 'next/navigation';
export default function LiveCatalogRefresh({revision}:{revision:string|null}){
 const router=useRouter(),current=useRef(revision);
 useEffect(()=>{current.current=revision;},[revision]);
 useEffect(()=>{let running=false;const controller=new AbortController();const check=async()=>{if(running||document.visibilityState!=='visible')return;running=true;try{const response=await fetch('/api/catalog-revision',{cache:'no-store',signal:controller.signal});if(response.ok){const data=await response.json() as {revision:string|null};if(data.revision!==current.current){current.current=data.revision;window.dispatchEvent(new Event('eu-catalog-updated'));router.refresh();}}}catch{}finally{running=false;}};const timer=setInterval(check,5000);window.addEventListener('focus',check);document.addEventListener('visibilitychange',check);return()=>{controller.abort();clearInterval(timer);window.removeEventListener('focus',check);document.removeEventListener('visibilitychange',check);};},[router]);
 return null;
}
