'use client';
import {useEffect} from 'react';
export default function HomeMotion(){useEffect(()=>{
 const story=document.querySelector<HTMLElement>('[data-home-story]');if(!story)return;
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 let cleanup=()=>{};
 const setup=()=>{cleanup();const reveals=Array.from(story.querySelectorAll<HTMLElement>('[data-reveal]'));if(motion.matches){reveals.forEach(e=>e.classList.add('is-visible'));return}
 story.classList.add('motion-enabled');
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.08});reveals.forEach(e=>observer.observe(e));
 const hero=story.querySelector<HTMLElement>('[data-hero]');const look=story.querySelector<HTMLElement>('.look-story');let frame=0;
 const update=()=>{frame=0;const y=window.scrollY;const pageProgress=y/Math.max(1,document.documentElement.scrollHeight-window.innerHeight);story.style.setProperty('--page-progress',String(pageProgress));story.style.setProperty('--scroll-progress',String(pageProgress*100));document.documentElement.style.setProperty('--page-progress',String(pageProgress));if(hero)hero.style.setProperty('--hero-progress',String(Math.min(1,Math.max(0,-hero.getBoundingClientRect().top/hero.offsetHeight))));if(look)look.style.setProperty('--section-progress',String(Math.min(1,Math.max(0,(window.innerHeight-look.getBoundingClientRect().top)/(window.innerHeight+look.offsetHeight)))))};
 const scroll=()=>{if(!frame)frame=requestAnimationFrame(update)};update();window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll);
 const pointer=(e:PointerEvent)=>{if(e.pointerType==='touch'||!hero)return;const r=hero.getBoundingClientRect();hero.style.setProperty('--pointer-x',`${(e.clientX-r.left)/r.width*100}%`);hero.style.setProperty('--pointer-y',`${(e.clientY-r.top)/r.height*100}%`)};hero?.addEventListener('pointermove',pointer,{passive:true});
 cleanup=()=>{observer.disconnect();window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);hero?.removeEventListener('pointermove',pointer);if(frame)cancelAnimationFrame(frame);story.classList.remove('motion-enabled')};
 };setup();motion.addEventListener('change',setup);return()=>{cleanup();motion.removeEventListener('change',setup)};
},[]);return <div className="reading-progress" aria-hidden="true"/>}
