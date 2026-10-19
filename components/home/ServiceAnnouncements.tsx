'use client';
import {useEffect,useState} from 'react';
import {Layers,MessageCircle,PackageCheck,Ruler,Shirt,Sparkles,Truck} from 'lucide-react';
import styles from './service-announcements.module.css';
const announcements=[
 {icon:Truck,label:'Envíos a Colombia'},
 {icon:Layers,label:'Looks para combinar'},
 {icon:MessageCircle,label:'Asesoría personalizada'},
 {icon:Ruler,label:'Elige tus diseños y tallas'},
 {icon:Shirt,label:'Descubre Anime Shop'},
 {icon:PackageCheck,label:'Confirma por WhatsApp'},
 {icon:Sparkles,label:'Viste a tu manera'},
];
const HOLD=4000,SLIDE=340;
export default function ServiceAnnouncements(){
 const [index,setIndex]=useState(0),[moving,setMoving]=useState(false),[reset,setReset]=useState(false);
 const [paused,setPaused]=useState(false),[hovered,setHovered]=useState(false);
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer:ReturnType<typeof setTimeout>;
  const schedule=()=>{clearTimeout(timer);
   if(moving){timer=setTimeout(()=>{setReset(true);setIndex(i=>(i+1)%announcements.length);setMoving(false);},SLIDE);return;}
   if(paused||hovered||document.hidden||media.matches)return;
   timer=setTimeout(()=>setMoving(true),HOLD);
  };
  schedule();document.addEventListener('visibilitychange',schedule);media.addEventListener('change',schedule);
  return()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',schedule);media.removeEventListener('change',schedule);};
 },[index,paused,hovered,moving]);
 useEffect(()=>{if(!reset)return;const frame=requestAnimationFrame(()=>setReset(false));return()=>cancelAnimationFrame(frame);},[reset]);
 return <div className={styles.strip} role="region" tabIndex={0} aria-label="Beneficios de compra; pausa al mantener el foco" onFocus={()=>setPaused(true)} onBlur={()=>setPaused(false)} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
  <div className={styles.viewport}><div className={styles.track} data-moving={moving} data-reset={reset} aria-hidden="true">
   {[index,(index+1)%announcements.length].map((n,i)=>{const Icon=announcements[n].icon;return <span key={i}><Icon size={19}/>{announcements[n].label}</span>;})}
  </div></div>
  <span className={styles.srOnly}>{announcements.map(a=>a.label).join('. ')}.</span>
 </div>;
}
