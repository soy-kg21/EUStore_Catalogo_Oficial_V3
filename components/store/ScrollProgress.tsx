'use client';
import {useEffect,useState} from 'react';

export default function ScrollProgress(){
 const [progress,setProgress]=useState(0);
 const [visible,setVisible]=useState(false);

 useEffect(()=>{
  const update=()=>{
   const h=document.documentElement;
   const max=h.scrollHeight-h.clientHeight;
   setProgress(max>0?(window.scrollY/max)*100:0);
   // La barra aparece solamente cuando el anuncio superior ya salió de pantalla.
   const announcement=document.querySelector('.announcement') as HTMLElement | null;
   const threshold=announcement?.offsetHeight || 38;
   setVisible(window.scrollY>threshold);
  };
  update();
  window.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update);
  return()=>{
   window.removeEventListener('scroll',update);
   window.removeEventListener('resize',update);
  };
 },[]);

 return (
  <div className={`eu-scroll-progress ${visible?'is-visible':''}`} aria-hidden="true">
   <span style={{transform:`scaleX(${progress/100})`}}/>
  </div>
 );
}
