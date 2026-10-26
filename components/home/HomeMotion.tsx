'use client';
import {useEffect} from 'react';
export default function HomeMotion(){useEffect(()=>{
 const story=document.querySelector<HTMLElement>('[data-home-story]');if(!story)return;
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 let cleanup=()=>{};
 const setup=()=>{cleanup();const reveals=Array.from(story.querySelectorAll<HTMLElement>('[data-reveal]'));if(motion.matches){reveals.forEach(e=>e.classList.add('is-visible'));return}
 story.classList.add('motion-enabled');
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.08});reveals.forEach(e=>observer.observe(e));
 const hero=story.querySelector<HTMLElement>('[data-hero]'),look=story.querySelector<HTMLElement>('.look-story');
 let frame=0,measureFrame=0,disposed=false,heroTop=0,heroHeight=1,lookTop=0,lookHeight=1,lastHero=-1,lastLook=-1;
 const clamp=(value:number)=>Math.min(1,Math.max(0,value));
 const update=()=>{
  frame=0;if(disposed||document.hidden)return;
  const y=window.scrollY,heroProgress=clamp((y-heroTop)/heroHeight),lookProgress=clamp((window.innerHeight+y-lookTop)/(window.innerHeight+lookHeight));
  // Scope changing properties to the two animated sections, never the entire store.
  if(hero&&heroProgress!==lastHero){hero.style.setProperty('--hero-progress',String(heroProgress));lastHero=heroProgress;}
  if(look&&lookProgress!==lastLook){look.style.setProperty('--section-progress',String(lookProgress));lastLook=lookProgress;}
 };
 const schedule=()=>{if(!frame&&!disposed&&!document.hidden)frame=requestAnimationFrame(update)};
 const measure=()=>{
  measureFrame=0;if(disposed)return;
  // Cache geometry on content/viewport changes; scrolling does no layout reads.
  const y=window.scrollY,heroRect=hero?.getBoundingClientRect(),lookRect=look?.getBoundingClientRect();
  heroTop=(heroRect?.top||0)+y;heroHeight=heroRect?.height||1;lookTop=(lookRect?.top||0)+y;lookHeight=lookRect?.height||1;schedule();
 };
 const scheduleMeasure=()=>{if(!measureFrame&&!disposed)measureFrame=requestAnimationFrame(measure)};
 const resize=new ResizeObserver(scheduleMeasure);resize.observe(story);if(hero)resize.observe(hero);if(look)resize.observe(look);
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',scheduleMeasure,{passive:true});document.addEventListener('visibilitychange',schedule);
 const pointer=(e:PointerEvent)=>{if(e.pointerType==='touch'||!hero||document.hidden)return;const r=hero.getBoundingClientRect();hero.style.setProperty('--pointer-x',`${(e.clientX-r.left)/r.width*100}%`);hero.style.setProperty('--pointer-y',`${(e.clientY-r.top)/r.height*100}%`)};hero?.addEventListener('pointermove',pointer,{passive:true});
 measure();document.fonts.ready.then(()=>{if(!disposed)scheduleMeasure()});
 cleanup=()=>{disposed=true;observer.disconnect();resize.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',scheduleMeasure);document.removeEventListener('visibilitychange',schedule);hero?.removeEventListener('pointermove',pointer);cancelAnimationFrame(frame);cancelAnimationFrame(measureFrame);story.classList.remove('motion-enabled')};
 };setup();motion.addEventListener('change',setup);return()=>{cleanup();motion.removeEventListener('change',setup)};
},[]);return <div className="reading-progress" aria-hidden="true"/>}
