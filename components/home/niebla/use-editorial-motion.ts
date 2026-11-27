'use client';

import {useEffect, useRef} from 'react';
import {sceneCopy} from './scene-timing';

export function useNearbyMotion<T extends HTMLElement>(mount: (node:T,signal:AbortSignal)=>Promise<void>, defer = true) {
  const ref = useRef<T>(null);
  useEffect(()=>{
    const node = ref.current!;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let controller: AbortController | undefined;
    let near = !defer;
    function sync(){
      if (motion.matches) {
        controller?.abort();
        controller = undefined;
        return;
      }
      if (!near || controller) return;
      const current = new AbortController();
      controller = current;
      mount(node,current.signal).catch(()=>current.abort());
    }
    const intersection = defer
      ? new IntersectionObserver(([entry])=>{near=entry.isIntersecting;sync();},{rootMargin:'750px 0px'})
      : undefined;
    intersection?.observe(node);
    motion.addEventListener('change',sync);
    sync();
    return ()=>{
      controller?.abort();
      intersection?.disconnect();
      motion.removeEventListener('change',sync);
    };
  },[mount,defer]);
  return ref;
}

export async function loadEditorialScene(root: HTMLElement, signal: AbortSignal) {
  const images = Array.from(root.querySelectorAll<HTMLImageElement>('.niebla-land,.niebla-figure'));
  try {
    await Promise.all([...images.map(image=>image.decode()),document.fonts.load('800 100px NieblaArchivo')]);
  } catch {
    if(!signal.aborted)root.dataset.staticScene='';
    return;
  }
  if (signal.aborted) return;
  delete root.dataset.staticScene;

  let attempted = false;
  async function mountCanvasFallback() {
    if (attempted || signal.aborted) return;
    attempted = true;
    try {
      const {mountFiberCanvas} = await import('./fiber-canvas');
      if (signal.aborted || mountFiberCanvas(root,signal)) return;
    } catch {
      // The original image and links remain available if canvas creation fails.
    }
    delete root.dataset.motion;
    root.dataset.staticScene='';
    sceneCopy(root,root.hasAttribute('data-closing')).reset();
  }
  // Clear the section if the component is removed while switching renderers.
  signal.addEventListener('abort',()=>{
    delete root.dataset.motion;
    sceneCopy(root,root.hasAttribute('data-closing')).reset();
  },{once:true});
  try {
    const {mountScene} = await import('./scene');
    if (!signal.aborted && !mountScene(root,signal,()=>{void mountCanvasFallback();})) await mountCanvasFallback();
  } catch {
    await mountCanvasFallback();
  }
}
