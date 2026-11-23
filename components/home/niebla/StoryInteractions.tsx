'use client';

import {useEffect,useRef,type ReactNode} from 'react';
import {startStory} from './story-motion';

function useNearbyMotion<T extends HTMLElement>(mount: (node:T,signal:AbortSignal)=>Promise<void>) {
  const ref=useRef<T>(null);
  useEffect(()=>{
    const node=ref.current!;
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    let controller:AbortController | undefined;
    let near=false;
    function sync(){
      if(motion.matches){controller?.abort();controller=undefined;return;}
      if(!near || controller) return;
      const current=new AbortController();controller=current;
      mount(node,current.signal).catch(()=>current.abort());
    }
    const io=new IntersectionObserver(([entry])=>{near=entry.isIntersecting;sync();},{rootMargin:'700px 0px'});
    io.observe(node);motion.addEventListener('change',sync);
    return ()=>{controller?.abort();io.disconnect();motion.removeEventListener('change',sync);};
  },[mount]);
  return ref;
}
async function loadLens(node:HTMLCanvasElement,signal:AbortSignal){
  const {mountLens}=await import('./material');
  if(!signal.aborted)await mountLens(node,signal);
}
async function loadClosing(node:HTMLElement,signal:AbortSignal){
  const {mountScene}=await import('./scene');
  if(!signal.aborted)await mountScene(node,signal);
}
export function MaterialLens(){
  const ref=useNearbyMotion(loadLens);
  return <canvas ref={ref} className="eu-lens" aria-hidden="true"/>;
}
export function ClosingScene({children}:{children:ReactNode}){
  const ref=useNearbyMotion(loadClosing);
  return <section className="niebla eu-closing" data-closing ref={ref} aria-labelledby="close-title">
    <div className="niebla-frame">
      <img className="niebla-land" src="/niebla/llanura.webp" alt="" loading="lazy"/>
      <div className="niebla-word" aria-hidden="true"><span data-ink>KAEL</span><i data-baseline/></div>
      <img className="niebla-figure" src="/niebla/codigo-nocturno.webp" alt="" loading="lazy"/>
      <canvas className="niebla-screen" aria-hidden="true"/>
      <div className="eu-closing-copy">{children}</div>
    </div>
  </section>;
}
export function StoryInteractions(){
  const ref=useRef<HTMLSpanElement>(null);
  useEffect(()=>{
    const main=ref.current!.closest('main')!;
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const pointer=matchMedia('(hover: hover) and (pointer: fine)');
    let cleanup=()=>{};
    function setup(){cleanup();cleanup=startStory(main,motion.matches,pointer.matches);}
    setup();motion.addEventListener('change',setup);pointer.addEventListener('change',setup);
    return ()=>{cleanup();motion.removeEventListener('change',setup);pointer.removeEventListener('change',setup);};
  },[]);
  return <span ref={ref} hidden/>;
}
