'use client';
import Link from 'next/link';
import type {ComponentProps} from 'react';
import {ANIME_REMEMBER_EVENT,requestAnimeProduct} from '@/lib/anime-navigation';

export default function AnimeProductLink({productId,onNavigate,...props}:ComponentProps<typeof Link>&{productId:string}){
 return <Link {...props} scroll={false} onNavigate={event=>{
  onNavigate?.(event);
  window.dispatchEvent(new CustomEvent(ANIME_REMEMBER_EVENT,{detail:productId}));
  requestAnimeProduct(productId);
 }}/>;
}
