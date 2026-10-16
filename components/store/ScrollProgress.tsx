'use client';
import {useEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';
import {cinemaPageProgress} from '@/lib/anime-cinema';
export default function ScrollProgress(){
 const track=useRef<HTMLDivElement>(null);
 const path=usePathname();
 useEffect(()=>{
  let frame=0;
  const update=()=>{
   frame=0;
   const h=document.documentElement;
   const max=h.scrollHeight-h.clientHeight;
   const cinema=document.querySelector<HTMLElement>('[data-anime-journey][data-enhanced="true"]:not([data-reduced="true"])');
   const start=Number(cinema?.dataset.journeyStart),end=Number(cinema?.dataset.journeyEnd);
   const progress=cinema&&Number.isFinite(start)&&Number.isFinite(end)
    ?cinemaPageProgress(window.scrollY,max,start,end,Number(cinema.dataset.sceneProgress))
    :max>0?Math.min(1,Math.max(0,window.scrollY/max)):0;
   const announcement=document.querySelector('.announcement');
   const bottom=announcement?.getBoundingClientRect().bottom??0;
   const header=document.querySelector('header.header');if(header)h.style.setProperty('--site-header-height',`${header.getBoundingClientRect().height}px`);
   if(track.current){
    track.current.style.top=`${Math.max(0,bottom-2)}px`;
    track.current.style.setProperty('--scroll-progress',String(progress));
   }
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  const observer=new ResizeObserver(schedule);
  observer.observe(document.body);
  update();
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  window.addEventListener('eu-cinema-measure',schedule);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);window.removeEventListener('eu-cinema-measure',schedule)}
 },[path]);
 return <div ref={track} className="eu-scroll-progress is-visible" aria-hidden="true"><span style={{transform:'scaleX(var(--scroll-progress, 0))'}}/></div>
}
