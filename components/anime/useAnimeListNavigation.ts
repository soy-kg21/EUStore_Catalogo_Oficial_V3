'use client';
import {useEffect,useLayoutEffect,useRef} from 'react';
import type {AnimeFilters} from '@/lib/anime-catalog-core';
import {ANIME_REMEMBER_EVENT,animeNavigationKey,animeResumeTarget,consumeAnimeReturn,readAnimeList,saveAnimeList,requestAnimeProduct,type AnimeListSnapshot,type AnimeReturnIntent} from '@/lib/anime-navigation';
import {animePublicRoutes} from '@/lib/anime-routes';
const productPaths=new Map(Object.entries(animePublicRoutes).map(([id,route])=>[route.path,id]));

type RestoreState={count:number;filterOpen:boolean;gridFilterOpen:boolean;filterOffset?:number;filterFloor?:number};
export function useAnimeListNavigation({filters,count,filterOpen,gridFilterOpen,restore}:{
 filters:AnimeFilters;count:number;filterOpen:boolean;gridFilterOpen:boolean;filterOffset?:number;filterFloor?:number;
 restore:(saved:RestoreState)=>void;
}){
 const key=animeNavigationKey(filters),localFilterEdit=useRef(false);
 const placement=useRef<{key:string;saved:AnimeListSnapshot|null;intent:AnimeReturnIntent|null;placed:boolean}|null>(null);
 const restoreRef=useRef(restore);
 useLayoutEffect(()=>{restoreRef.current=restore;},[restore]);
 useEffect(()=>{
  const remember=(event:Event)=>{
   const productId=(event as CustomEvent<string>).detail,card=document.getElementById('anime-card-'+productId);
   saveAnimeList({version:1,url:window.location.pathname+window.location.search,key,count,scroll:window.scrollY,
    productId:card?productId:undefined,cardTop:card?.getBoundingClientRect().top,width:window.innerWidth,
    filterOpen,gridFilterOpen,savedAt:Date.now()});
  };
  const capture=(event:MouseEvent)=>{
   if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
   if(!link||link.target==='_blank')return;
   const url=new URL(link.href,window.location.origin),id=url.origin===window.location.origin?productPaths.get(url.pathname):undefined;
   if(id){remember(new CustomEvent(ANIME_REMEMBER_EVENT,{detail:id}));requestAnimeProduct(id);}
  };
  window.addEventListener(ANIME_REMEMBER_EVENT,remember);document.addEventListener('click',capture,true);
  return()=>{window.removeEventListener(ANIME_REMEMBER_EVENT,remember);document.removeEventListener('click',capture,true);};
 },[key,count,filterOpen,gridFilterOpen]);
 useLayoutEffect(()=>{
  // Consume a new history intent even when React retains the same route component.
  const intent=consumeAnimeReturn(key),changed=placement.current?.key!==key;
  if(!changed&&!intent)return;
  const saved=readAnimeList(key),editedHere=localFilterEdit.current;localFilterEdit.current=false;
  placement.current={key,saved,intent,placed:false};
  if(saved&&(!editedHere||intent))restoreRef.current({...saved,filterOffset:0,filterFloor:0});
 },[key]);
 useLayoutEffect(()=>{
  const state=placement.current;if(!state||state.key!==key||!state.intent||state.placed)return;
  // The layout update restores the loaded pages before any placement or paint.
  if(state.intent.mode==='resume'&&state.saved&&count!==state.saved.count)return;
  const root=document.querySelector<HTMLElement>('[data-anime-journey]');
  const header=document.querySelector('header.header')?.getBoundingClientRect().height||82;
  const panel=document.getElementById('anime-discover'),end=Number(root?.dataset.journeyEnd);
  const categoryTop=root?.dataset.enhanced==='true'&&root.dataset.reduced!=='true'&&Number.isFinite(end)?end:panel?window.scrollY+panel.getBoundingClientRect().top-header:0;
  let top=categoryTop;
  if(state.intent.mode==='resume'&&state.saved){
   const saved=state.saved,card=saved.productId?document.getElementById('anime-card-'+saved.productId):null;
   top=Math.max(categoryTop,animeResumeTarget(saved,{scroll:window.scrollY,cardTop:card?.getBoundingClientRect().top,width:window.innerWidth,header}));
  }
  window.scrollTo({top:Math.max(0,top),behavior:'instant'});
  // Paint the cinema's closing frame synchronously at the restored position.
  window.dispatchEvent(new Event('eu-anime-place-list'));state.placed=true;
 },[key,count]);
 return ()=>{localFilterEdit.current=true;};
}
