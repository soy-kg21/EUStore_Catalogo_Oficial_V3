'use client';
import {useMemo,useSyncExternalStore} from 'react';
import {parseAnimeSelection,changeAnimeSelection} from './anime-selection-core';
export {parseAnimeSelection} from './anime-selection-core';
export type {AnimeSelection} from './anime-selection-core';
export const ANIME_SELECTION_KEY='eu-anime-universe-combo-v1';
const EVENT='eu-anime-premium-combo';let fallback='[]';let memoryOnly=false;
function snapshot(){if(memoryOnly)return fallback;try{return localStorage.getItem(ANIME_SELECTION_KEY)||'[]';}catch{return fallback;}}
function subscribe(listener:()=>void){const storage=(event:StorageEvent)=>{if(event.key===ANIME_SELECTION_KEY||event.key===null)listener();};window.addEventListener(EVENT,listener);window.addEventListener('storage',storage);return ()=>{window.removeEventListener(EVENT,listener);window.removeEventListener('storage',storage);};}
function write(rows:ReturnType<typeof parseAnimeSelection>){fallback=JSON.stringify(rows);try{localStorage.setItem(ANIME_SELECTION_KEY,fallback);}catch{memoryOnly=true;}window.dispatchEvent(new Event(EVENT));}
export function openAnimeCombo(){window.dispatchEvent(new Event('eu-open-anime-combo'));}
export function useAnimeSelection(){
 const raw=useSyncExternalStore(subscribe,snapshot,()=> '[]'),rows=useMemo(()=>parseAnimeSelection(raw),[raw]);
 return {rows,count:rows.reduce((total,row)=>total+row.quantity,0),
 add:(id:string,size:string,quantity=1)=>write(changeAnimeSelection(parseAnimeSelection(snapshot()),id,size,{add:quantity})),
 remove:(id:string,size?:string)=>write(changeAnimeSelection(parseAnimeSelection(snapshot()),id,size,{quantity:0})),
 setQuantity:(id:string,size:string|undefined,quantity:number)=>write(changeAnimeSelection(parseAnimeSelection(snapshot()),id,size,{quantity})),
 setSize:(id:string,size:string|undefined,nextSize:string)=>{if(['S','M','L','XL'].includes(nextSize))write(changeAnimeSelection(parseAnimeSelection(snapshot()),id,size,{nextSize}));},clear:()=>write([])};
}
