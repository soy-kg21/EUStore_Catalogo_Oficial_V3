'use client';

import {useEffect,useRef,type ReactNode} from 'react';
import EditorialWordmark from './EditorialWordmark';
import {startStory} from './story-motion';
import {loadEditorialScene, useNearbyMotion} from './use-editorial-motion';

async function loadLens(canvas:HTMLCanvasElement,signal:AbortSignal){
  const frame = canvas.parentElement!;
  const image = frame.querySelector<HTMLImageElement>('.eu-material-photo')!;
  await image.decode();
  if (signal.aborted) return;
  let usesFallback = false;
  async function fallback() {
    if (usesFallback || signal.aborted) return;
    usesFallback = true;
    const {mountLensFallback} = await import('./material-fallback');
    if (!signal.aborted) mountLensFallback(frame,image,signal);
  }
  try {
    const {mountLens} = await import('./material');
    if (!signal.aborted && !mountLens(canvas,image,signal,()=>{void fallback().catch(()=>{});})) await fallback();
  } catch {
    await fallback();
  }
}
export function MaterialLens(){
  const ref=useNearbyMotion(loadLens);
  return <>
    <canvas ref={ref} className="eu-lens" aria-hidden="true"/>
    <div className="eu-lens-fallback" aria-hidden="true"/>
  </>;
}
export function ClosingScene({children}:{children:ReactNode}){
  const ref=useNearbyMotion(loadEditorialScene);
  return <section className="niebla eu-closing" data-closing ref={ref} aria-labelledby="close-title">
    <div className="niebla-frame">
      <img className="niebla-land" src="/niebla/llanura.webp" alt="" loading="lazy"/>
      <EditorialWordmark/>
      <img className="niebla-figure" src="/niebla/esencial-grafico-modelo.webp"
        alt="Look Esencial gráfico de Evolución Urbana con camiseta oversize blanca, pantalón negro y zapatillas blancas." loading="lazy"/>
      <canvas className="niebla-screen" aria-hidden="true"/>
      <canvas className="niebla-fibers" aria-hidden="true"/>
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
