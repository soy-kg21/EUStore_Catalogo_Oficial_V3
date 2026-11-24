import * as THREE from 'three';
import {FAB_FS,VS} from './shaders';

export function mountLens(canvas: HTMLCanvasElement, image: HTMLImageElement, signal: AbortSignal, fallback: () => void) {
  const frame = canvas.parentElement!;
  const context = canvas.getContext('webgl2',{alpha:false,depth:false,antialias:false});
  if (!context) return false;
  const renderer = new THREE.WebGLRenderer({canvas,context});
  let shaderFailed = false;
  renderer.debug.onShaderError = () => { shaderFailed = true; };
  const texture = new THREE.Texture(image);
  texture.needsUpdate = true;
  const uniforms = {
    tFab:{value:texture},uRes:{value:new THREE.Vector2()},uFabScale:{value:new THREE.Vector2()},
    uLens:{value:new THREE.Vector2(.70,.5)},uMouse:{value:new THREE.Vector2(.5,.5)},
    uDpr:{value:1},uAspect:{value:1},uLensR:{value:150},uZoom:{value:2},uProg:{value:0},
  };
  const material = new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:FAB_FS,uniforms,depthTest:false,depthWrite:false});
  const geometry = new THREE.PlaneGeometry(2,2);
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(geometry,material));
  const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const pointer = new THREE.Vector2();
  let lastMove = -Infinity, raf = 0, previous = 0, time = 0, visible = false;
  let placementDirty=true, placement:DOMRect, materialHeight=0;
  const section = frame.closest<HTMLElement>('.eu-material')!;
  function resize() {
    const width=frame.clientWidth,height=frame.clientHeight;
    if (!width || !height) return;
    const dpr=Math.min(devicePixelRatio,width<=820 ? 1.5 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width,height,false);
    const aspect=width/height, imageAspect=image.naturalWidth/image.naturalHeight;
    uniforms.uRes.value.set(width*dpr,height*dpr);
    uniforms.uFabScale.value.set(Math.min(1,aspect/imageAspect),Math.min(1,imageAspect/aspect));
    uniforms.uDpr.value=dpr;
    uniforms.uAspect.value=aspect;
    uniforms.uLensR.value=width<=820 ? 92 : 150;
    materialHeight=section.offsetHeight;
    placementDirty=true;
  }
  function render(now:number) {
    raf=0;
    if (!visible || signal.aborted || document.hidden) return;
    const dt=previous ? Math.min(.06,(now-previous)/1000) : 1/60;
    time+=dt; previous=now;
    const real=now-lastMove<2500;
    if(placementDirty) {
      const viewport=innerHeight;
      placement=frame.getBoundingClientRect();
      uniforms.uProg.value=THREE.MathUtils.clamp((viewport-section.getBoundingClientRect().top)/(materialHeight+viewport),0,1);
      placementDirty=false;
    }
    const x=real ? (pointer.x-placement.left)/placement.width : .5+.26*Math.sin(time*.42);
    const y=real ? 1-(pointer.y-placement.top)/placement.height : .5+.18*Math.sin(time*.57+1.2);
    const lens=uniforms.uLens.value, factor=1-Math.exp(-(real ? 18 : 9)*dt);
    lens.x+=(x-lens.x)*factor; lens.y+=(y-lens.y)*factor;
    uniforms.uMouse.value.copy(lens);
    try {
      renderer.render(scene,camera);
    } catch {
      recover();
      return;
    }
    if (shaderFailed) {recover();return;}
    if (!canvas.hasAttribute('data-ready')) canvas.dataset.ready='';
    raf=requestAnimationFrame(render);
  }
  function schedule(){
    if (visible && !document.hidden && !raf) raf=requestAnimationFrame(render);
    else if (!visible || document.hidden) { cancelAnimationFrame(raf);raf=0;previous=0; }
  }
  const observer=new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    placementDirty=true;
    canvas.toggleAttribute('data-in-view',visible);
    schedule();
  });
  const size=new ResizeObserver(resize);
  const listeners=new AbortController();
  frame.addEventListener('pointermove',e=>{
    pointer.set(e.clientX,e.clientY);
    lastMove=performance.now();
  },{passive:true,signal:listeners.signal});
  window.addEventListener('scroll',()=>{placementDirty=true;},{passive:true,signal:listeners.signal});
  document.addEventListener('visibilitychange',schedule,{signal:listeners.signal});
  let disposed=false;
  function stop(){
    if(disposed)return;
    disposed=true;listeners.abort();observer.disconnect();size.disconnect();cancelAnimationFrame(raf);
    delete canvas.dataset.ready;
    delete canvas.dataset.inView;
    geometry.dispose();material.dispose();texture.dispose();renderer.dispose();
  }
  function recover(){
    stop();
    fallback();
  }
  signal.addEventListener('abort',stop,{once:true,signal:listeners.signal});
  canvas.addEventListener('webglcontextlost',recover,{once:true,signal:listeners.signal});
  resize();size.observe(frame);observer.observe(frame);
  return true;
}
