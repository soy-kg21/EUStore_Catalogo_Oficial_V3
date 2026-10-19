'use client';
import Image from 'next/image';
import {useEffect,useRef,type RefObject} from 'react';
import styles from './universe.module.css';
export default function AnimeActionScene({storyRef}:{storyRef:RefObject<HTMLElement|null>}){
 const wrapper=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const host=wrapper.current,surface=canvas.current,story=storyRef.current;if(!host||!surface||!story)return;
  let disposed=false,frame=0,visible=false,started=false,current=0,target=0,lastTime=0,pointerX=0,pointerY=0;
  let draw:((value:number)=>void)|undefined,resize:(()=>void)|undefined,cleanup:(()=>void)|undefined,setPointer:((x:number,y:number)=>void)|undefined;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const tick=(time:number)=>{frame=0;if(disposed||!visible||document.hidden||!draw)return;const dt=Math.min(60,Math.max(1,time-lastTime));lastTime=time;current=reduced.matches?0:current+(target-current)*(1-Math.exp(-dt/100));if(Math.abs(target-current)<.0004)current=target;try{draw(current);}catch{host.dataset.ready='false';return;}if(!reduced.matches&&Math.abs(target-current)>.0004)frame=requestAnimationFrame(tick);};
  const schedule=()=>{if(!frame&&visible&&!document.hidden&&draw){lastTime=performance.now()-16;frame=requestAnimationFrame(tick);}};
  const progress=(event:Event)=>{target=reduced.matches?0:Math.max(0,Math.min(1,(event as CustomEvent<number>).detail));schedule();};
  const pointer=(event:Event)=>{const value=(event as CustomEvent<{x:number;y:number}>).detail;pointerX=value.x;pointerY=value.y;setPointer?.(pointerX,pointerY);schedule();};
  async function start(){
   if(started)return;started=true;
   try{
    const [{createSukunaScene},THREE]=await Promise.all([import('./scene/createSukunaScene'),import('three')]);if(disposed)return;
    const context=surface!.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});if(!context)return;
    const renderer=new THREE.WebGLRenderer({canvas:surface!,context,alpha:true,antialias:true,powerPreference:'low-power'}),rig=await createSukunaScene();
    if(disposed){rig.dispose();renderer.dispose();return;}
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.setClearColor(0x101212,0);
    const theme=()=>{rig.setTheme(document.documentElement.dataset.theme==='light');schedule();};
    const themeObserver=new MutationObserver(theme);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    resize=()=>{const bounds=host!.getBoundingClientRect();if(bounds.width<1||bounds.height<1)return;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2,1920/bounds.width));renderer.setSize(bounds.width,bounds.height,false);rig.camera.aspect=bounds.width/bounds.height;rig.camera.updateProjectionMatrix();schedule();};
    setPointer=rig.setPointer;setPointer(pointerX,pointerY);
    draw=value=>{rig.update(value);renderer.render(rig.scene,rig.camera);host!.dataset.ready='true';};
    cleanup=()=>{themeObserver.disconnect();rig.dispose();renderer.dispose();};
    target=reduced.matches?0:Number(story!.dataset.sceneProgress||0);current=target;theme();resize();schedule();
   }catch{host!.dataset.ready='false';cleanup?.();cleanup=undefined;}
  }
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible){void start();schedule();}else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:'150px'});observer.observe(host);
  const resizeObserver=new ResizeObserver(()=>resize?.());resizeObserver.observe(host);
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();};
  const preference=()=>{target=reduced.matches?0:Number(story.dataset.sceneProgress||0);schedule();};
  const lost=(event:Event)=>{event.preventDefault();host.dataset.ready='false';cancelAnimationFrame(frame);frame=0;};
  const restored=()=>{resize?.();schedule();};
  story.addEventListener('eu-hero-progress',progress);story.addEventListener('eu-hero-pointer',pointer);reduced.addEventListener('change',preference);document.addEventListener('visibilitychange',visibility);surface.addEventListener('webglcontextlost',lost);surface.addEventListener('webglcontextrestored',restored);
  return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();resizeObserver.disconnect();cleanup?.();story.removeEventListener('eu-hero-progress',progress);story.removeEventListener('eu-hero-pointer',pointer);reduced.removeEventListener('change',preference);document.removeEventListener('visibilitychange',visibility);surface.removeEventListener('webglcontextlost',lost);surface.removeEventListener('webglcontextrestored',restored);};
 },[storyRef]);
 return <div ref={wrapper} className={styles.sceneCanvas} data-ready="false" aria-hidden="true"><Image quality={85} className={styles.scenePoster} src="/anime/hero/sukuna-v4-poster.webp" alt="" fill sizes="(max-width: 700px) 100vw, 1540px" preload/><canvas ref={canvas} className={styles.webglCanvas}/></div>;
}
