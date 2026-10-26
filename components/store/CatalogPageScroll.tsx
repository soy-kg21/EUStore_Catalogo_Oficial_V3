'use client';
import {useLayoutEffect} from 'react';
import {useSearchParams} from 'next/navigation';
export default function CatalogPageScroll({page}:{page:number}){
 const params=useSearchParams(),key=params.toString();
 useLayoutEffect(()=>{
  if(!params.has('page'))return;
  const frame=requestAnimationFrame(()=>{
   const start=document.querySelector<HTMLElement>('[data-catalog-start]');if(!start)return;
   // Layout offsets exclude the route-entry animation, which otherwise moves the target after arrival.
   let top=0;for(let node:HTMLElement|null=start;node;node=node.offsetParent as HTMLElement|null)top+=node.offsetTop;
   const header=document.querySelector('header.header')?.getBoundingClientRect().height||90;
   window.scrollTo({top:Math.max(0,top-header-16),behavior:'instant'});
  });
  return()=>cancelAnimationFrame(frame);
 },[page,key,params]);
 return null;
}
