import {trackSceneTouch} from './scene-touch';
import {drawLettering, fiberTiming, readSceneProgress, sceneCopy, smooth} from './scene-timing';

const stripWidth = 3;

function makeLayer() {
  const canvas = document.createElement('canvas');
  return {canvas, context:canvas.getContext('2d')!};
}

export function mountFiberCanvas(root: HTMLElement, signal: AbortSignal) {
  const frame = root.querySelector<HTMLElement>('.niebla-frame')!;
  const figure = root.querySelector<HTMLImageElement>('.niebla-figure')!;
  const canvas = root.querySelector<HTMLCanvasElement>('.niebla-fibers')!;
  const context = canvas.getContext('2d');
  if (!context) return false;
  const word = makeLayer();
  const subject = makeLayer();
  const headline = makeLayer();
  const closing = root.hasAttribute('data-closing');
  const letters = root.querySelectorAll<HTMLElement>('.niebla-word [data-ink]');
  const title = root.querySelectorAll<HTMLElement>('.niebla-manifest [data-ink]');
  const copy = sceneCopy(root,closing);
  let visible = false;
  let frameId = 0;
  let contactX = -1000, contactY = 0, lastTouch = -Infinity;
  let width = 1, height = 1, pinnedTop = 0, travel = 1;

  function measure() {
    const bounds = frame.getBoundingClientRect();
    width = Math.max(1,Math.round(bounds.width));
    height = Math.max(1,Math.round(bounds.height));
    pinnedTop = parseFloat(getComputedStyle(frame).top) || 0;
    travel = Math.max(1,root.offsetHeight - height);
    canvas.width = width;
    canvas.height = height;
    for(const layer of [word,subject,headline]){
      layer.canvas.width = width;
      layer.canvas.height = height;
    }
    drawLettering(word.context,bounds,letters,()=>'#e9ede6');
    drawLettering(headline.context,bounds,title,()=>'#f1f2eb');
    const model = figure.getBoundingClientRect();
    subject.context.drawImage(figure,model.left-bounds.left,model.top-bounds.top,model.width,model.height);
    schedule();
  }

  function drawFibers(layer: HTMLCanvasElement, entering: number, leaving: number, salt: number, contact: number) {
    if (!context || entering === 0 || leaving === 1) return;
    if (entering === 1 && leaving === 0 && contact === 0) {
      context.globalAlpha = 1;
      context.drawImage(layer,0,0);
      return;
    }

    for(let x=0; x<width; x+=stripWidth){
      const noise = Math.sin(x*.073+salt)*.29 + Math.sin(x*2.36+salt)*.18+.5;
      const delay = noise*.57;
      const drop = smooth(delay,delay+.43,leaving);
      const rise = smooth(delay,delay+.43,entering);
      const slice = Math.min(stripWidth,width-x);
      const near = Math.max(0,1-Math.abs(x-contactX)/(width*.28));
      const ripple = near*near*contact*Math.sin(x*.77+salt)*(.028+contactY*.042);
      const offset = (drop*drop*1.13 - (1-rise)**2*.91+ripple)*height;
      const alpha = (1-smooth(.58,1,drop))*smooth(0,.35,rise);
      if (alpha <= 0 || Math.abs(offset) >= height) continue;
      const tail = height*.028*(drop+1-rise);
      if (tail > 1) {
        context.globalAlpha = alpha*.35;
        context.drawImage(layer,x,0,slice,height,x,offset-tail,slice,height);
      }
      context.globalAlpha = alpha;
      context.drawImage(layer,x,0,slice,height,x,offset,slice,height);
    }
  }
  function paint(now=performance.now()) {
    frameId = 0;
    if (!context || !visible || signal.aborted || document.hidden) return;
    const progress = readSceneProgress(root,height,pinnedTop,travel,closing);
    const timing = fiberTiming(progress,closing);
    const contact = 1-smooth(.10,.46,(now-lastTouch)/1000);
    copy.update(progress);
    root.style.setProperty('--fiber-dark',String(timing.dark*.73));
    root.style.setProperty('--fiber-zoom',String(closing ? 1.12-.06*progress : 1.06+.1*progress));
    context.clearRect(0,0,width,height);
    drawFibers(word.canvas,timing.wordIn,timing.wordOut,7,contact);
    if (timing.ghost > 0) {
      context.globalAlpha = timing.ghost;
      context.drawImage(word.canvas,0,0);
    }
    drawFibers(headline.canvas,timing.titleIn,0,11,contact*.45);
    drawFibers(subject.canvas,timing.figureIn,timing.figureOut,17,contact);
    context.globalAlpha = 1;
    if(contact>0)schedule();
  }
  function schedule(){
    if (visible && !document.hidden && !frameId) frameId=requestAnimationFrame(paint);
    else if (!visible || document.hidden) {cancelAnimationFrame(frameId);frameId=0;}
  }

  const intersection = new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule();});
  const resize = new ResizeObserver(measure);
  trackSceneTouch(frame,signal,touch=>{
    if(!visible)return;
    const bounds=frame.getBoundingClientRect();
    contactX=touch.clientX-bounds.left;
    contactY=Math.max(0,Math.min(1,(touch.clientY-bounds.top)/height));
    lastTouch=performance.now();
    schedule();
  });
  window.addEventListener('scroll',schedule,{passive:true,signal});
  document.addEventListener('visibilitychange',schedule,{signal});
  signal.addEventListener('abort',()=>{
    intersection.disconnect();
    resize.disconnect();
    cancelAnimationFrame(frameId);
    copy.reset();
    delete root.dataset.motion;
    delete root.dataset.renderer;
    root.style.removeProperty('--fiber-dark');
    root.style.removeProperty('--fiber-zoom');
  },{once:true});
  root.dataset.motion = '';
  measure();
  visible = frame.getBoundingClientRect().bottom > 0 && frame.getBoundingClientRect().top < innerHeight;
  paint();
  root.dataset.renderer = 'canvas';
  intersection.observe(frame);
  resize.observe(frame);
  resize.observe(root);
  return true;
}
