'use client';
import {useMemo,useSyncExternalStore} from 'react';
import {type AnimeFilters} from '@/lib/anime-catalog-core';
import {animeFilterHref,animeLocationFilters} from '@/lib/anime-routes';
const EVENT='eu-anime-filters',snapshot=()=>JSON.stringify(animeLocationFilters(window.location.pathname,window.location.search));
function subscribe(listener:()=>void){window.addEventListener('popstate',listener);window.addEventListener(EVENT,listener);return ()=>{window.removeEventListener('popstate',listener);window.removeEventListener(EVENT,listener);};}
export function useAnimeFilters(initialSearch:string){
 const initial=useMemo(()=>{const p=new URLSearchParams(initialSearch);return JSON.stringify({linea:p.get('linea')||'',categoria:p.get('categoria')||'',q:p.get('q')||'',...(p.get('estampado')==='doble'?{doble:true}:{})});},[initialSearch]);
 const raw=useSyncExternalStore(subscribe,snapshot,()=>initial),filters=useMemo(()=>JSON.parse(raw) as AnimeFilters,[raw]);
 return {filters,update:(patch:Partial<AnimeFilters>,replace=false)=>{
  const next={...filters,...patch},url=new URL(animeFilterHref(next),window.location.origin);
  for(const [key,value] of new URLSearchParams(window.location.search))if(key.startsWith('utm_')||key==='fbclid')url.searchParams.set(key,value);
  window.history[replace?'replaceState':'pushState']({...window.history.state},'',url.pathname+url.search);window.dispatchEvent(new Event(EVENT));
 }};
}
