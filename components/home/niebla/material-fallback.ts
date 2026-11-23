import {clampProgress} from './scene-timing';

export function mountLensFallback(frame: HTMLElement, image: HTMLImageElement, signal: AbortSignal) {
  const lens = frame.querySelector<HTMLElement>('.eu-lens-fallback')!;
  const section = frame.parentElement!;
  let raf = 0, visible = false;
  let pointer: {x:number;y:number} | undefined;
  lens.style.backgroundImage = 'url('+JSON.stringify(image.currentSrc || image.src)+')';

  function draw() {
    raf = 0;
    if (!visible || signal.aborted || document.hidden) return;
    const bounds = frame.getBoundingClientRect();
    const radius = Math.min(bounds.width*.23,bounds.width<=820 ? 92 : 150);
    const progress = clampProgress((innerHeight-section.getBoundingClientRect().top)/(innerHeight+section.offsetHeight));
    const lensX = bounds.width*(pointer?.x ?? .73-.18*progress);
    const lensY = bounds.height*(pointer?.y ?? .6+.14*Math.sin(progress*Math.PI));
    const frameScale = Math.max(bounds.width/image.naturalWidth,bounds.height/image.naturalHeight);
    const magnifiedWidth = image.naturalWidth*frameScale*2;
    const magnifiedHeight = image.naturalHeight*frameScale*2;
    lens.style.width = lens.style.height = radius*2+'px';
    lens.style.transform = 'translate3d('+(lensX-radius)+'px,'+(lensY-radius)+'px,0)';
    lens.style.backgroundSize = magnifiedWidth+'px '+magnifiedHeight+'px';
    lens.style.backgroundPosition = (radius-2*lensX+bounds.width-magnifiedWidth*.5)+'px '+(radius-2*lensY+bounds.height-magnifiedHeight*.5)+'px';
    if (!lens.hasAttribute('data-ready')) lens.dataset.ready = '';
  }
  function schedule() {
    if (visible && !document.hidden && !raf) raf = requestAnimationFrame(draw);
    else if (!visible || document.hidden) {cancelAnimationFrame(raf);raf=0;}
  }
  const intersection = new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule();});
  const resize = new ResizeObserver(schedule);
  frame.addEventListener('pointermove',event=>{
    if (event.pointerType === 'touch') return;
    const bounds=frame.getBoundingClientRect();
    pointer={x:(event.clientX-bounds.left)/bounds.width,y:(event.clientY-bounds.top)/bounds.height};
    schedule();
  },{passive:true,signal});
  frame.addEventListener('pointerleave',()=>{pointer=undefined;schedule();},{signal});
  window.addEventListener('scroll',schedule,{passive:true,signal});
  document.addEventListener('visibilitychange',schedule,{signal});
  signal.addEventListener('abort',()=>{
    intersection.disconnect();
    resize.disconnect();
    cancelAnimationFrame(raf);
    delete lens.dataset.ready;
    lens.removeAttribute('style');
  },{once:true});
  intersection.observe(frame);
  resize.observe(frame);
}
