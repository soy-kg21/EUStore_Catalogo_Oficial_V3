import * as THREE from 'three';
import {createFogField} from './fog-field';
import {VS, FOG_FS, COMP_FS} from './shaders';
import {trackSceneTouch} from './scene-touch';
import {clampProgress, drawLettering, fiberTiming, readSceneProgress, sceneCopy, smooth} from './scene-timing';

export function mountScene(root: HTMLElement, signal: AbortSignal, fallback: () => void) {
  const canvas = root.querySelector<HTMLCanvasElement>('.niebla-screen')!;
  const frame = root.querySelector<HTMLElement>('.niebla-frame')!;
  const background = root.querySelector<HTMLImageElement>('.niebla-land')!;
  const figure = root.querySelector<HTMLImageElement>('.niebla-figure')!;
  const letters = root.querySelectorAll<HTMLElement>('[data-ink]');
  const closing = root.hasAttribute('data-closing');
  const lettering = document.createElement('canvas');
  const ctx = lettering.getContext('2d');
  const context = canvas.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false});
  if (!context || !ctx) return false;

  const gpu = new THREE.WebGLRenderer({canvas,context});
  const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const geometry = new THREE.PlaneGeometry(2,2);
  const target = new THREE.WebGLRenderTarget(1,1,{depthBuffer:false,stencilBuffer:false});
  const ink = new THREE.CanvasTexture(lettering);
  const terrain = new THREE.Texture(background);
  const subject = new THREE.Texture(figure);
  const copy = sceneCopy(root,closing);
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
    uTouch:val(0),uFigLod:val(0),uHeadIn:val(0),uGhost:val(0),uDark:val(0),uFray:val(0),uLight:val(0),
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
  let width = 1, height = 1, pinnedTop = 0, travel = 1, small = false;
  let raf = 0, previous = 0, time = 0, onScreen = false, stopped = false, shaderFailed = false;
  let lastMove = -Infinity, pointerX = .5, pointerY = .5, speed = 0, touchInput = false, lastScroll = -1;
  const lifecycle = new AbortController();
  const figureBox = new THREE.Vector4();
  gpu.debug.onShaderError = () => { shaderFailed = true; };

  function measure() {
    if (stopped || !ctx) return;
    const box = frame.getBoundingClientRect();
    width = Math.round(box.width);
    height = Math.round(box.height);
    if (!width || !height) return;
    small = width <= 820 || matchMedia('(pointer: coarse)').matches;
    const dpr = Math.min(devicePixelRatio || 1, small ? 1 : 2);
    const aspect = width / height;
    const bgAspect = background.naturalWidth/background.naturalHeight;
    pinnedTop = parseFloat(getComputedStyle(frame).top) || 0;
    travel = Math.max(1,root.offsetHeight-height);
    gpu.setPixelRatio(dpr);
    gpu.setSize(width,height,false);
    const mistScale = dpr*(small ? .32 : .4);
    target.setSize(Math.max(1,Math.round(width*mistScale)),Math.max(1,Math.round(height*mistScale)));
    U.uDpr.value = dpr;
    U.uRes.value.set(width*dpr,height*dpr);
    U.uAspect.value = aspect;
    U.uBgScale.value.set(Math.min(1,aspect/bgAspect),Math.min(1,bgAspect/aspect));
    const fig = figure.getBoundingClientRect();
    figureBox.set((fig.left-box.left)/width,(box.bottom-fig.bottom)/height,fig.width/width,fig.height/height);
    U.uFigLod.value = Math.max(0,Math.log2(figure.naturalHeight/(fig.height*dpr)));

    // The mip chain must be reallocated when the lettering texture changes dimensions.
    if (lettering.width !== Math.round(width*dpr) || lettering.height !== Math.round(height*dpr)) ink.dispose();
    lettering.width = Math.round(width*dpr);
    lettering.height = Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,width,height);
    ctx.globalCompositeOperation = 'lighter';
    drawLettering(ctx,box,letters,element => element.closest('.niebla-word') ? '#f00' : '#0f0');
    ink.needsUpdate = true;
  }

  function render(now: number) {
    raf = 0;
    if (stopped || document.hidden || !onScreen) {previous = 0;return;}
    const scrollPosition = window.scrollY;
    if (small && scrollPosition === lastScroll && now-lastMove>800 && previous && now-previous<27) {
      raf=requestAnimationFrame(render);
      return;
    }
    lastScroll=scrollPosition;
    const dt = previous ? Math.max(.001,Math.min(.05,(now-previous)/1000)) : 1/60;
    previous = now;
    time += dt;
    const progress = readSceneProgress(root,height,pinnedTop,travel,closing);
    const timing = fiberTiming(progress,closing);
    const cropped = closing ? 0 : Math.min(.22, Math.max(0,root.getBoundingClientRect().top-pinnedTop)/height);
    const box = U.uFig.value.copy(figureBox);
    box.x += box.z*cropped*.5;
    box.y += cropped;
    box.z *= 1-cropped;
    box.w *= 1-cropped;
    const contact = touchInput ? 1-smooth(.14,.72,(now-lastMove)/1000) : Number(now-lastMove < 2500);
    const touch = touchInput ? contact : 0;
    const sweep = Math.sin(time*.4+1.2);
    const idleX = .5+(small ? .34 : .4)*sweep;
    const idleY = (small ? .64 : .6)+(small ? .2 : .3)*(1-sweep*sweep)+.02*Math.sin(time*1.3);
    const x = idleX+(pointerX-idleX)*contact;
    const y = idleY+(pointerY-idleY)*contact;
    const mouse = U.uMouse.value;
    const ease = 1-Math.exp(-dt*(7+touch*14));
    const vx = (x-mouse.x)*ease/dt, vy = (y-mouse.y)*ease/dt;
    mouse.x += vx*dt;
    mouse.y += vy*dt;
    speed += (Math.hypot(vx*U.uAspect.value,vy)-speed)*.2;
    flow.advance(dt,vx*(1+touch*.8),vy*(1+touch*.8),mouse.x,mouse.y,U.uAspect.value);
    mist.uTime.value = time;
    const fade = closing ? 0 : smooth(.3,.8,progress);
    mist.uFront.value = 1-.55*fade;
    mist.uBack.value = 1-.4*fade;
    U.uWordOut.value = timing.wordOut;
    U.uWordIn.value = timing.wordIn;
    U.uFigOut.value = timing.figureOut;
    U.uFigIn.value = timing.figureIn;
    U.uHeadIn.value = timing.titleIn;
    U.uGhost.value = timing.ghost;
    U.uDark.value = timing.dark;
    U.uBgZoom.value = closing ? 1.12-.06*progress : 1.06+.1*progress;
    U.uLight.value = Number(document.documentElement.dataset.theme === 'light');
    const fray = closing ? smooth(.85,1,progress) : (1-smooth(0,.15,progress))*(.4+.6*smooth(0,1.5,time));
    U.uTouch.value = touch;
    const dragFray = touch*(closing ? smooth(.38,.79,progress) : 1-smooth(.35,.78,progress));
    U.uFray.value = Math.max(fray*(small ? .65 : 1)*(.75+.25*contact),dragFray*1.18)
      *(.45+.55*Math.min(1,speed*(1.2+touch*.9)));
    copy.update(progress);
    try {
      gpu.setRenderTarget(target);
      gpu.render(fogPass.scene,camera);
      gpu.setRenderTarget(null);
      gpu.render(imagePass.scene,camera);
    } catch {
      recover();
      return;
    }
    if (shaderFailed) {recover();return;}
    if (root.dataset.renderer !== 'webgl') root.dataset.renderer = 'webgl';
    raf = requestAnimationFrame(render);
  }
  function schedule() {
    const active = !document.hidden && onScreen && !stopped;
    root.toggleAttribute('data-motion-active',active);
    if (active && !raf) raf=requestAnimationFrame(render);
    else if (!active) {cancelAnimationFrame(raf);raf=0;previous=0;}
  }
  const visibility = new IntersectionObserver(([entry]) => {onScreen=entry.isIntersecting;schedule();});
  const resize = new ResizeObserver(measure);

  function stop(preserveMotion = false) {
    if (stopped) return;
    stopped = true;
    lifecycle.abort();
    visibility.disconnect();
    resize.disconnect();
    cancelAnimationFrame(raf);
    delete root.dataset.renderer;
    delete root.dataset.motionActive;
    if (!preserveMotion) {
      delete root.dataset.motion;
      copy.reset();
    }
    for (const resource of [ink,terrain,subject,flow.field,target,geometry,fogPass.material,imagePass.material,gpu]) resource.dispose();
  }
  function recover() {
    stop(true);
    fallback();
  }
  signal.addEventListener('abort',() => stop(),{once:true,signal:lifecycle.signal});
  canvas.addEventListener('webglcontextlost',recover,{once:true,signal:lifecycle.signal});
  document.addEventListener('visibilitychange',schedule,{signal:lifecycle.signal});
  function move(clientX:number,clientY:number,touch:boolean) {
    if (!onScreen) return;
    const box=frame.getBoundingClientRect();
    pointerX=clampProgress((clientX-box.left)/width);
    pointerY=1-clampProgress((clientY-box.top)/height);
    touchInput=touch;
    lastMove=performance.now();
  }
  trackSceneTouch(frame,lifecycle.signal,touch=>move(touch.clientX,touch.clientY,true));
  frame.addEventListener('pointermove',event=>{
    if(event.pointerType!=='touch')move(event.clientX,event.clientY,false);
  },{passive:true,signal:lifecycle.signal});
  root.dataset.motion = '';
  measure();
  visibility.observe(frame);
  resize.observe(frame);
  resize.observe(root);
  return true;
}
