'use client';
import {useEffect} from 'react';
import {useSearchParams} from 'next/navigation';
export default function CatalogPageScroll({page}:{page:number}){
 const params=useSearchParams(),key=params.toString();
 useEffect(()=>{
  if(!params.has('page'))return;
  const frame=requestAnimationFrame(()=>{const grid=document.getElementById('catalogo-productos');if(!grid)return;const header=document.querySelector('header.header')?.getBoundingClientRect().height||90;window.scrollTo({top:Math.max(0,window.scrollY+grid.getBoundingClientRect().top-header-16),behavior:'instant'});});
  return()=>cancelAnimationFrame(frame);
 },[page,key,params]);
 return null;
}
