'use client';
import {useEffect} from 'react';
import {animeLocationFilters} from '@/lib/anime-routes';
import {animeNavigationKey,readAnimeList,requestAnimeReturn,safeAnimeListUrl} from '@/lib/anime-navigation';
/** Lives above route transitions so browser Back can request placement before mount. */
export default function AnimeHistoryBridge(){
 useEffect(()=>{
  const resume=()=>{
   const url=window.location.pathname+window.location.search;
   if(!safeAnimeListUrl(url))return;
   const key=animeNavigationKey(animeLocationFilters(window.location.pathname,window.location.search));
   const saved=readAnimeList(key);
   if(saved&&saved.url===url)requestAnimeReturn('resume',url,key);
  };
  window.addEventListener('popstate',resume,true);
  return()=>window.removeEventListener('popstate',resume,true);
 },[]);
 return null;
}
