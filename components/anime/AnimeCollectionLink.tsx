'use client';
import Link from 'next/link';
import {useEffect,useState,type ReactNode} from 'react';
import {animeLocationFilters} from '@/lib/anime-routes';
import {animeNavigationKey,readAnimeList,requestAnimeReturn} from '@/lib/anime-navigation';

export default function AnimeCollectionLink({href,resume=false,children,...props}:{href:string;resume?:boolean;children:ReactNode;className?:string;style?:React.CSSProperties}){
 const [previous,setPrevious]=useState<string|null>(null);
 useEffect(()=>{if(resume)setPrevious(readAnimeList()?.url||null);},[resume]);
 const target=resume&&previous?previous:href;
 return <Link {...props} href={resume&&previous?target:target+'#anime-discover'} scroll={false} onNavigate={()=>{
  const url=new URL(target,window.location.origin),key=animeNavigationKey(animeLocationFilters(url.pathname,url.search));
  requestAnimeReturn(resume&&previous?'resume':'categories',target,key);
 }}>{children}</Link>;
}
