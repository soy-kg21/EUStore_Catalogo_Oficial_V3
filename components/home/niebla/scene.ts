import * as THREE from 'three';
import {createFogField} from './fog-field';
import {VS, FOG_FS, COMP_FS} from './shaders';

function smooth(a: number, b: number, value: number) {
  const x = Math.min(1, Math.max(0, (value - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

export async function mountScene(root: HTMLElement, signal: AbortSignal) {
  const get = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const canvas = get<HTMLCanvasElement>('.niebla-screen');
  const frame = get('.niebla-frame');
  const background = get<HTMLImageElement>('.niebla-land');
  const figure = get<HTMLImageElement>('.niebla-figure');
  const opening = [...root.querySelectorAll<HTMLElement>('.niebla-opening')];
  const endingLink = get<HTMLAnchorElement>('.niebla-end');
  await Promise.all([background.decode(), figure.decode(), document.fonts.load('800 100px NieblaArchivo')]);
  if (signal.aborted) return;

  const lettering = document.createElement('canvas');
  const ctx = lettering.getContext('2d');
  if (!ctx) return;
  const context = canvas.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false});
  if (!context) return;
  const gpu = new THREE.WebGLRenderer({canvas,context});
  const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const geometry = new THREE.PlaneGeometry(2,2);
  const target = new THREE.WebGLRenderTarget(1,1,{depthBuffer:false,stencilBuffer:false});
  const ink = new THREE.CanvasTexture(lettering);
  const terrain = new THREE.Texture(background);
  const subject = new THREE.Texture(figure);
  for (const image of [ink, terrain, subject]) {
    image.generateMipmaps = true;
    image.minFilter = THREE.LinearMipmapLinearFilter;
    image.needsUpdate = true;
  }
  const flow = createFogField();
  const val = <T,>(value: T) => ({value});
  const U = {
    tBg:val(terrain),tFig:val(subject),tText:val(ink),tFog:val(target.texture),
    uMouse:val(new THREE.Vector2(.87,.62)),uFig:val(new THREE.Vector4()),
    uWordCh:val(new THREE.Vector3(1,0,0)),uBgScale:val(new THREE.Vector2()),
    uRes:val(new THREE.Vector2()),uAspect:val(1),uDpr:val(1),uBgZoom:val(1.06),
    uWordOut:val(0),uWordIn:val(1),uFigOut:val(0),uFigIn:val(1),uFigA:val(1),
    uFigLod:val(0),uHeadIn:val(0),uGhost:val(0),uDark:val(0),uFray:val(0),uLight:val(0),
  };
  const mist = {tField:val(flow.field),uTime:val(0),uAspect:U.uAspect,uIntroR:val(8),uFront:val(1),uBack:val(1)};
  function pass(fragmentShader: string, uniforms: Record<string,THREE.IUniform>) {
    const scene = new THREE.Scene();
    const material = new THREE.ShaderMaterial({vertexShader:VS,fragmentShader,uniforms,depthTest:false,depthWrite:false});
    const mesh = new THREE.Mesh(geometry,material);
    mesh.frustumCulled = false;
    scene.add(mesh);
    return {scene,material};
  }
  const fogPass = pass(FOG_FS,mist);
  const imagePass = pass(COMP_FS,U);
  let width = 1, height = 1, start = 0, travel = 1, small = false;
  let raf = 0, previous = 0, time = 0, onScreen = false, stopped = false;
  let lastMove = -Infinity, pointerX = .5, pointerY = .5, speed = 0;
  const lifecycle = new AbortController();
  const figureBox = new THREE.Vector4();
  let previousScroll = -1;

  function measure() {
    if (stopped) return;
    const box = frame.getBoundingClientRect();
    width = Math.round(box.width);
    height = Math.round(box.height);
    if (!width || !height) return;
    small = width <= 820;
    const dpr = Math.min(devicePixelRatio || 1, small ? 1.5 : 2);
    const aspect = width / height;
    const bgAspect = background.naturalWidth/background.naturalHeight;
    start = scrollY + root.getBoundingClientRect().top - parseFloat(getComputedStyle(frame).top);
    travel = Math.max(1,root.offsetHeight-height);
    gpu.setPixelRatio(dpr);
    gpu.setSize(width,height,false);
    target.setSize(Math.max(1,Math.round(width*dpr*.4)),Math.max(1,Math.round(height*dpr*.4)));
    U.uDpr.value = dpr;
    U.uRes.value.set(width*dpr,height*dpr);
    U.uAspect.value = aspect;
    U.uBgScale.value.set(Math.min(1,aspect/bgAspect),Math.min(1,bgAspect/aspect));
    const fig = figure.getBoundingClientRect();
    figureBox.set((fig.left-box.left)/width,(box.bottom-fig.bottom)/height,fig.width/width,fig.height/height);
    U.uFigLod.value = Math.max(0,Math.log2(figure.naturalHeight/(fig.height*dpr)));

    // WebGL allocates an immutable mip chain at upload. Reallocate it when
    // rotating a phone or crossing a breakpoint, before uploading new glyphs.
    if (lettering.width !== Math.round(width*dpr) || lettering.height !== Math.round(height*dpr)) ink.dispose();
    lettering.width = Math.round(width*dpr);
    lettering.height = Math.round(height*dpr);
    ctx!.setTransform(dpr,0,0,dpr,0,0);
    ctx!.fillStyle = '#000';
    ctx!.fillRect(0,0,width,height);
    ctx!.globalCompositeOperation = 'lighter';
    root.querySelectorAll<HTMLElement>('[data-ink]').forEach(el => {
      const rect = el.getBoundingClientRect();
      const baseline = el.nextElementSibling!.getBoundingClientRect().top-box.top;
      const style = getComputedStyle(el);
      ctx!.font = '800 '+style.fontSize+' NieblaArchivo';
      ctx!.fillStyle = el.closest('h1') ? '#f00' : '#0f0';
      ctx!.save();
      ctx!.translate(rect.left-box.left,baseline);
      ctx!.scale(rect.width / Math.max(1,ctx!.measureText(el.textContent!).width),1);
      ctx!.fillText(el.textContent!,0,0);
      ctx!.restore();
    });
    ink.needsUpdate = true;
  }

  function render(now: number) {
    raf = 0;
    if (stopped || document.hidden || !onScreen) {previous = 0;return;}
    const dt = previous ? Math.min(.05,(now-previous)/1000) : 1/60;
    previous = now;
    time += dt;
    const s = Math.max(0, Math.min(1, (scrollY-start)/travel));
    // The announcement scrolls away before the header pins. Fit the real look
    // above the visible lower edge throughout those first pixels of travel.
    const cropped = Math.min(.22, Math.max(0,start-scrollY)/height);
    const box = U.uFig.value.copy(figureBox);
    box.x += box.z*cropped*.5;
    box.y += cropped;
    box.z *= 1-cropped;
    box.w *= 1-cropped;
    const real = now-lastMove < 2500;
    const sweep = Math.sin(time*.4+1.2);
    const x = real ? pointerX : .5+(small ? .34 : .4)*sweep;
    const y = real ? pointerY : (small ? .64 : .6)+(small ? .2 : .3)*(1-sweep*sweep)+.02*Math.sin(time*1.3);
    const mouse = U.uMouse.value;
    const ease = 1-Math.exp(-dt*7);
    const vx = (x-mouse.x)*ease/dt, vy = (y-mouse.y)*ease/dt;
    mouse.x += vx*dt;
    mouse.y += vy*dt;
    speed += (Math.hypot(vx*U.uAspect.value,vy)-speed)*.2;
    flow.advance(dt,vx,vy,mouse.x,mouse.y,U.uAspect.value);
    mist.uTime.value = time;
    mist.uFront.value = 1-.55*smooth(.3,.8,s);
    mist.uBack.value = 1-.4*smooth(.3,.8,s);
    U.uWordOut.value = smooth(.07,.46,s);
    U.uFigOut.value = smooth(.03,.5,s);
    U.uHeadIn.value = smooth(.28,.8,s);
    U.uGhost.value = .16*smooth(.1,.22,s)*(1-smooth(.36,.56,s));
    U.uDark.value = .8*smooth(.18,.62,s);
    U.uBgZoom.value = 1.06+.1*s;
    U.uLight.value = Number(document.documentElement.dataset.theme === 'light');
    U.uFray.value = (1-smooth(0,.15,s))*(.45+.55*Math.min(1,speed*1.2))*(.4+.6*smooth(0,1.5,time))*(small ? .6 : 1)*(real ? 1 : .75);
    if (s !== previousScroll) {
      previousScroll = s;
      const open = 1-smooth(0,.07,s);
      const end = smooth(.88,1,s);
      root.style.setProperty('--opening',String(open));
      root.style.setProperty('--ending',String(end));
      opening.forEach(el => {if(el.inert !== (open < .1)) el.inert = open < .1;});
      endingLink.inert = end < .1;
      root.toggleAttribute('data-ending',!endingLink.inert);
    }
    gpu.setRenderTarget(target);
    gpu.render(fogPass.scene,camera);
    gpu.setRenderTarget(null);
    gpu.render(imagePass.scene,camera);
    raf = requestAnimationFrame(render);
  }
  function schedule() {
    if (!document.hidden && onScreen && !raf && !stopped) raf = requestAnimationFrame(render);
    else if (document.hidden || !onScreen) {cancelAnimationFrame(raf);raf=0;previous=0;}
  }
  const visibility = new IntersectionObserver(([entry]) => {onScreen=entry.isIntersecting;schedule();});
  const resize = new ResizeObserver(measure);
  function stop() {
    if (stopped) return;
    stopped = true;
    lifecycle.abort();
    visibility.disconnect();
    resize.disconnect();
    cancelAnimationFrame(raf);
    root.removeAttribute('data-motion');
    root.removeAttribute('data-ending');
    root.style.removeProperty('--opening');
    root.style.removeProperty('--ending');
    opening.forEach(el => {el.inert=false;});
    endingLink.inert=false;
    for(const resource of [ink,terrain,subject,flow.field,target,geometry,fogPass.material,imagePass.material,gpu]) resource.dispose();
  }
  signal.addEventListener('abort',stop,{once:true});
  canvas.addEventListener('webglcontextlost',stop,{once:true,signal:lifecycle.signal});
  document.addEventListener('visibilitychange',schedule,{signal:lifecycle.signal});
  frame.addEventListener('pointermove',event=>{
    const box=frame.getBoundingClientRect();
    pointerX=(event.clientX-box.left)/width;
    pointerY=1-(event.clientY-box.top)/height;
    lastMove=performance.now();
  },{passive:true,signal:lifecycle.signal});
  root.dataset.motion = '';
  measure();
  visibility.observe(root);
  resize.observe(frame);
  resize.observe(root);
}
