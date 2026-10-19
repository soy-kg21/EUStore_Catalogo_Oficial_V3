'use client';
import {useEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';
import {cinemaPageProgress} from '@/lib/anime-cinema';
export default function ScrollProgress(){
 const track=useRef<HTMLDivElement>(null);
 const path=usePathname();
 useEffect(()=>{
  let frame=0,disposed=false,max=0,announcementEnd=0,lastHeader=-1;
  const h=document.documentElement,announcement=document.querySelector('.announcement'),header=document.querySelector('header.header');
  let cinema=document.querySelector<HTMLElement>('[data-anime-journey]');
  const update=()=>{
   frame=0;
   if(disposed||document.hidden)return;
   const start=Number(cinema?.dataset.journeyStart),end=Number(cinema?.dataset.journeyEnd);
   const progress=cinema?.dataset.enhanced==='true'&&cinema.dataset.reduced!=='true'&&Number.isFinite(start)&&Number.isFinite(end)
    ?cinemaPageProgress(window.scrollY,max,start,end)
    :max>0?Math.min(1,Math.max(0,window.scrollY/max)):0;
   if(track.current){
    const top=`${Math.max(0,announcementEnd-window.scrollY-2)}px`;
    if(track.current.style.top!==top)track.current.style.top=top;
    track.current.style.setProperty('--scroll-progress',String(progress));
   }
  };
  const schedule=()=>{if(!frame&&!disposed&&!document.hidden)frame=requestAnimationFrame(update)};
  const measure=()=>{
   if(disposed)return;
   // Layout reads happen on resize/content changes, not during every scroll frame.
   max=h.scrollHeight-h.clientHeight;
   announcementEnd=announcement?announcement.getBoundingClientRect().bottom+window.scrollY:0;
   const height=header?.getBoundingClientRect().height||82;
   if(height!==lastHeader){lastHeader=height;h.style.setProperty('--site-header-height',`${height}px`);}
   schedule();
  };
  const cinemaMeasure=()=>{cinema=document.querySelector<HTMLElement>('[data-anime-journey]');measure();};
  const observer=new ResizeObserver(measure);
  observer.observe(document.body);
  if(header)observer.observe(header);
  measure();
  document.fonts.ready.then(()=>{if(!disposed)measure();});
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',measure);
  window.addEventListener('eu-cinema-measure',cinemaMeasure);
  document.addEventListener('visibilitychange',schedule);
  return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',measure);window.removeEventListener('eu-cinema-measure',cinemaMeasure);document.removeEventListener('visibilitychange',schedule)}
 },[path]);
 return <div ref={track} className="eu-scroll-progress is-visible" aria-hidden="true"><span/></div>
}
