'use client';

import {useEffect,useRef,useState} from 'react';
import {Footprints,Layers,MessageCircle,PackageCheck,Ruler,Shirt,ShoppingBag,Sparkles,Truck} from 'lucide-react';
import styles from './service-announcements.module.css';

const groups=[
 [
  {icon:Truck,label:'Envíos a Colombia'},
  {icon:Layers,label:'Looks para combinar'},
  {icon:MessageCircle,label:'Asesoría personalizada'},
 ],
 [
  {icon:Ruler,label:'Elige tus diseños y tallas'},
  {icon:Shirt,label:'Descubre Anime Shop'},
  {icon:PackageCheck,label:'Confirma por WhatsApp'},
 ],
 [
  {icon:Sparkles,label:'Viste a tu manera'},
  {icon:Footprints,label:'Encuentra tu próximo par'},
  {icon:ShoppingBag,label:'Revisa tu selección y pide'},
 ],
] as const;

const mobileMessages=groups.flat().filter(message=>message.label!=='Viste a tu manera');
const mobileGroups=Array.from({length:4},(_,index)=>mobileMessages.slice(index*2,index*2+2));

export default function ServiceAnnouncements(){
 const region=useRef<HTMLDivElement>(null);
 const [slide,setSlide]=useState<{current:number;previous:number|null}>({current:0,previous:null});
 const [inView,setInView]=useState(false);
 const [compact,setCompact]=useState(false);
 const displayGroups=compact?mobileGroups:groups;
 const [pageVisible,setPageVisible]=useState(true);
 const [reduced,setReduced]=useState(false);
 const [hovered,setHovered]=useState(false);
 const [focused,setFocused]=useState(false);
 const running=inView&&pageVisible&&!reduced&&!hovered&&!focused;

 useEffect(()=>{const media=window.matchMedia('(max-width:700px)');const change=()=>{setCompact(media.matches);setSlide({current:0,previous:null});};change();media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);

 useEffect(()=>{
  const node=region.current;
  if(!node)return;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const updateMotion=()=>setReduced(motion.matches);
  const updateVisibility=()=>setPageVisible(document.visibilityState==='visible');
  updateMotion();updateVisibility();
  motion.addEventListener('change',updateMotion);
  document.addEventListener('visibilitychange',updateVisibility);
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
   const entry=entries[entries.length-1];
   setInView(!!entry&&entry.isIntersecting&&entry.intersectionRatio>=.25);
  },{threshold:[0,.25]}):null;
  observer?.observe(node);
  return()=>{observer?.disconnect();motion.removeEventListener('change',updateMotion);document.removeEventListener('visibilitychange',updateVisibility);};
 },[]);

 useEffect(()=>{
   if(!running)return;
  const timer=window.setTimeout(()=>setSlide(old=>({current:(old.current+1)%displayGroups.length,previous:old.current})),compact?4000:3000);
  return()=>window.clearTimeout(timer);
 },[running,slide.current,compact,displayGroups.length]);

 useEffect(()=>{
  if(slide.previous===null)return;
  const timer=window.setTimeout(()=>setSlide(old=>({...old,previous:null})),550);
  return()=>window.clearTimeout(timer);
 },[slide.previous]);

 return <div ref={region} className={styles.strip} role="region" tabIndex={0} aria-label="Beneficios de compra; pausa al mantener el foco" aria-roledescription="carrusel" data-reduced={reduced} data-mobile={compact} data-rotating={running} data-in-view={inView} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
  <div className={styles.viewport} aria-live="off">
   {displayGroups.map((announcements,index)=><div key={index} className={styles.group} role="group" aria-label={`${index+1} de ${displayGroups.length}`} aria-hidden={!reduced&&index!==slide.current} inert={!reduced&&index!==slide.current} data-current={index===slide.current} data-enter={index===slide.current&&slide.previous!==null} data-leave={index===slide.previous}>
    {announcements.map(({icon:Icon,label})=><span key={label}><Icon size={19} aria-hidden="true"/>{label}</span>)}
   </div>)}
  </div>
 </div>;
}
