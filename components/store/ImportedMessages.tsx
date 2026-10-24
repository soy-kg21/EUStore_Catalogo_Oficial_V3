'use client';

import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,Footprints,MessageCircle,Pause,Play,Ruler,Search,ShoppingBag,Tag} from 'lucide-react';
import {wa} from '@/lib/config';
import styles from './imported-messages.module.css';

const collection='#coleccion-importadas';
const advice=wa('Hola, quiero asesoría para elegir unas zapatillas importadas.');
const groups=[
  [
    {title:'Encuentra tu referencia',text:'Busca por nombre, marca o SKU.',icon:Search,href:'#busqueda'},
    {title:'Elige tu talla y color',text:'Revisa las opciones de cada modelo.',icon:Ruler,href:collection},
    {title:'Compra con asesoría',text:'Confirma disponibilidad antes de pedir.',icon:MessageCircle,href:advice},
  ],
  [
    {title:'Tu estilo pide evolución',text:'Descubre el par que va contigo.',icon:Footprints,href:collection},
    {title:'El precio, a la vista',text:'Compara referencias y elige tu próximo par.',icon:Tag,href:collection},
    {title:'¿Tienes un modelo en mente?',text:'Consúltanos por la referencia que buscas.',icon:Search,href:wa('Hola, busco una referencia de zapatillas importadas. ¿Me ayudan a encontrarla?')},
  ],
  [
    {title:'Tu talla merece certeza',text:'Aclara el ajuste con un asesor antes de pedir.',icon:Ruler,href:wa('Hola, necesito asesoría de talla para unas zapatillas importadas.')},
    {title:'Elige. Guarda. Decide.',text:'Añade tu par a la selección y revisa tu pedido.',icon:ShoppingBag,href:collection},
    {title:'Hazlo tuyo por WhatsApp',text:'Envía tu elección y confirma disponibilidad.',icon:ArrowUpRight,href:advice},
  ],
] as const;

export default function ImportedMessages(){
  const region=useRef<HTMLElement>(null);
  const [slide,setSlide]=useState<{current:number;previous:number|null}>({current:0,previous:null});
  const [inView,setInView]=useState(false);
  const [pageVisible,setPageVisible]=useState(true);
  const [reduced,setReduced]=useState(false);
  const [paused,setPaused]=useState(false);
  const [hovered,setHovered]=useState(false);
  const [focused,setFocused]=useState(false);
  const running=inView&&pageVisible&&!reduced&&!paused&&!hovered&&!focused;

  useEffect(()=>{
    const node=region.current;
    if(!node)return;
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion=()=>setReduced(motion.matches);
    const updateVisibility=()=>setPageVisible(document.visibilityState==='visible');
    updateMotion();updateVisibility();
    motion.addEventListener('change',updateMotion);
    document.addEventListener('visibilitychange',updateVisibility);
    // No scroll listener or per-frame polling: rotation exists only while visible.
    const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
      const entry=entries[entries.length-1];
      setInView(!!entry&&entry.isIntersecting&&entry.intersectionRatio>=.25);
    },{threshold:[0,.25]}):null;
    observer?.observe(node);
    return ()=>{observer?.disconnect();motion.removeEventListener('change',updateMotion);document.removeEventListener('visibilitychange',updateVisibility);};
  },[]);

  useEffect(()=>{
    if(!running){setSlide(old=>old.previous===null?old:{...old,previous:null});return;}
    const timer=window.setTimeout(()=>setSlide(old=>({current:(old.current+1)%groups.length,previous:old.current})),4000);
    return ()=>window.clearTimeout(timer);
  },[running,slide.current]);

  useEffect(()=>{
    if(slide.previous===null)return;
    const timer=window.setTimeout(()=>setSlide(old=>({...old,previous:null})),550);
    return ()=>window.clearTimeout(timer);
  },[slide.previous]);

  return <section ref={region} className={styles.carousel} data-rotating={running} data-in-view={inView} aria-label="Descubre tus zapatillas importadas" aria-roledescription="carrusel" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
    <div className={styles.viewport} aria-live={paused||focused||reduced?'polite':'off'} onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setFocused(false);}}>
      {groups.map((messages,index)=><div key={index} className={styles.group} role="group" aria-roledescription="grupo de mensajes" aria-label={`${index+1} de ${groups.length}`} aria-hidden={index!==slide.current} inert={index!==slide.current} data-current={index===slide.current} data-enter={index===slide.current&&slide.previous!==null} data-leave={index===slide.previous}>
        {messages.map(({title,text,icon:Icon,href})=><a className={styles.message} key={title} href={href} {...(href.startsWith('https:')?{target:'_blank',rel:'noopener noreferrer'}:{})}><Icon size={21} aria-hidden="true"/><span><strong>{title}</strong><small>{text}</small></span></a>)}
      </div>)}
    </div>
    <div className={styles.controls} aria-label="Controles de los mensajes">
      {groups.map((_,index)=><button key={index} type="button" className={styles.dot} aria-label={`Ver grupo de mensajes ${index+1}`} aria-pressed={index===slide.current} onClick={()=>setSlide(old=>old.current===index?old:{current:index,previous:inView&&!reduced?old.current:null})}><span aria-hidden="true"/></button>)}
      {!reduced&&<button type="button" className={styles.pause} aria-label={paused?'Reanudar anuncios':'Pausar anuncios'} aria-pressed={paused} onClick={()=>setPaused(old=>!old)}>{paused?<Play size={13} aria-hidden="true"/>:<Pause size={13} aria-hidden="true"/>}</button>}
    </div>
  </section>;
}
