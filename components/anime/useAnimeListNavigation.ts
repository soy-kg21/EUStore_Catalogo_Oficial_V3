'use client';
import {useEffect,useRef} from 'react';
import type {AnimeFilters} from '@/lib/anime-catalog-core';
import {ANIME_REMEMBER_EVENT,animeNavigationKey,animeResumeTarget,consumeAnimeReturn,readAnimeList,saveAnimeList,requestAnimeProduct} from '@/lib/anime-navigation';
import {animePublicRoutes} from '@/lib/anime-routes';
const productPaths=new Map(Object.entries(animePublicRoutes).map(([id,route])=>[route.path,id]));

export function useAnimeListNavigation({filters,count,filterOpen,gridFilterOpen,filterOffset=0,filterFloor=0,restore}:{
 filters:AnimeFilters;count:number;filterOpen:boolean;gridFilterOpen:boolean;filterOffset?:number;filterFloor?:number;
 restore:(saved:{count:number;filterOpen:boolean;gridFilterOpen:boolean;filterOffset?:number;filterFloor?:number})=>void;
}){
 const key=animeNavigationKey(filters),localFilterEdit=useRef(false);
 // Keep a consumed intent through React's effect setup/cleanup replay.
 const placement=useRef<{key:string;intent:ReturnType<typeof consumeAnimeReturn>}|null>(null);
 useEffect(()=>{
  const remember=(event:Event)=>{
   const productId=(event as CustomEvent<string>).detail;
   const card=document.getElementById('anime-card-'+productId);
   saveAnimeList({version:1,url:window.location.pathname+window.location.search,key,count,scroll:window.scrollY,
    productId:card?productId:undefined,cardTop:card?.getBoundingClientRect().top,width:window.innerWidth,
    filterOpen,gridFilterOpen,filterOffset,filterFloor,savedAt:Date.now()});
  };
  // Also covers a product chosen from the original header's global search.
  const capture=(event:MouseEvent)=>{
   if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
   if(!link||link.target==='_blank')return;
   const url=new URL(link.href,window.location.origin),id=url.origin===window.location.origin?productPaths.get(url.pathname):undefined;
   if(id){remember(new CustomEvent(ANIME_REMEMBER_EVENT,{detail:id}));requestAnimeProduct(id);}
  };
  window.addEventListener(ANIME_REMEMBER_EVENT,remember);
  document.addEventListener('click',capture,true);
  return()=>{window.removeEventListener(ANIME_REMEMBER_EVENT,remember);document.removeEventListener('click',capture,true);};
 },[key,count,filterOpen,gridFilterOpen,filterOffset,filterFloor]);
 useEffect(()=>{
  if(placement.current?.key!==key)placement.current={key,intent:consumeAnimeReturn(key)};
  const saved=readAnimeList(key),intent=placement.current.intent,editedHere=localFilterEdit.current;localFilterEdit.current=false;
  // Typing/selecting in the current list must not revive an older search layout.
  if(saved&&(!editedHere||intent))restore(saved);
  // Back/Forward can recover the loaded cards, but never receives a scripted scroll.
  if(!intent)return;
  let frame=0,stopped=false,stable=0,previous=-1,attempts=0;
  const stop=()=>{stopped=true;cancelAnimationFrame(frame);};
  const cancel=()=>{if(placement.current?.key===key)placement.current.intent=null;stop();};
  const place=()=>{
   if(stopped)return;
   attempts++;
   const root=document.querySelector<HTMLElement>('[data-anime-journey]');
   const header=document.querySelector('header.header')?.getBoundingClientRect().height||82;
   const ready=root?.dataset.enhanced==='true';
   if(!ready&&attempts<90){frame=requestAnimationFrame(place);return;}
   const panel=document.getElementById('anime-discover');
   const measuredEnd=Number(root?.dataset.journeyEnd);
   const categoryTop=Number.isFinite(measuredEnd)&&root?.dataset.reduced!=='true'?measuredEnd:panel?window.scrollY+panel.getBoundingClientRect().top-header:0;
   let top=categoryTop;
   if(intent.mode==='resume'&&saved){
    const card=saved.productId?document.getElementById('anime-card-'+saved.productId):null;
    top=Math.max(categoryTop,animeResumeTarget(saved,{scroll:window.scrollY,cardTop:card?.getBoundingClientRect().top,width:window.innerWidth,header}));
   }
   top=Math.max(0,top);
   window.dispatchEvent(new Event('eu-anime-place-list'));
   window.scrollTo({top,behavior:'instant'});
   stable=Math.abs(previous-top)<2?stable+1:0;previous=top;
   if(attempts<150&&(stable<8||!ready||document.fonts.status==='loading'))frame=requestAnimationFrame(place);
   else {stopped=true;if(placement.current?.key===key)placement.current.intent=null;}
  };
  frame=requestAnimationFrame(place);
  const measure=()=>{if(!stopped){stable=0;cancelAnimationFrame(frame);frame=requestAnimationFrame(place);}};
  window.addEventListener('eu-cinema-measure',measure);
  window.addEventListener('wheel',cancel,{passive:true});window.addEventListener('touchstart',cancel,{passive:true});window.addEventListener('keydown',cancel);
  return()=>{stop();window.removeEventListener('eu-cinema-measure',measure);window.removeEventListener('wheel',cancel);window.removeEventListener('touchstart',cancel);window.removeEventListener('keydown',cancel);};
  // The snapshot is read once per collection. New renders must not restart placement.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[key]);
 return ()=>{localFilterEdit.current=true;};
}
