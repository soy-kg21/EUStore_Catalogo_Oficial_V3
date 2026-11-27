import * as THREE from 'three';
import {VS} from './shaders';
import {clampProgress} from './scene-timing';

const glassFragment = `
varying vec2 vUv;
uniform sampler2D tPhoto;
uniform vec2 uCenter, uRadius;
void main(){
  vec2 point=vUv*2.-1.;
  float distanceFromCenter=length(point);
  if(distanceFromCenter>=1.) discard;
  float edge=smoothstep(.5,1.,distanceFromCenter);
  vec2 spot=uCenter+point*uRadius*(1.+.4*edge*edge);
  vec2 prism=point*uRadius*.09*edge*edge;
  vec3 color=vec3(texture2D(tPhoto,spot+prism).r,texture2D(tPhoto,spot).g,texture2D(tPhoto,spot-prism).b);
  color*=1.06-.3*edge*edge;
  vec2 highlight=point-vec2(-.43,.47);
  color+=.17*exp(-10.*dot(highlight,highlight));
  color+=.24*smoothstep(.945,.985,distanceFromCenter)*(1.-smoothstep(.985,1.,distanceFromCenter));
  gl_FragColor=vec4(color,1.-smoothstep(.986,1.,distanceFromCenter));
}`;

function createOpticalLens(canvas:HTMLCanvasElement,image:HTMLImageElement) {
  const context=canvas.getContext('webgl2',{alpha:true,depth:false,antialias:false,powerPreference:'low-power'});
  if(!context) return;
  const renderer=new THREE.WebGLRenderer({canvas,context,alpha:true});
  const texture=new THREE.Texture(image);
  texture.generateMipmaps=false;
  texture.minFilter=THREE.LinearFilter;
  texture.needsUpdate=true;
  const uniforms={
    tPhoto:{value:texture},
    uCenter:{value:new THREE.Vector2()},
    uRadius:{value:new THREE.Vector2()},
  };
  const material=new THREE.ShaderMaterial({
    vertexShader:VS,fragmentShader:glassFragment,uniforms,depthTest:false,depthWrite:false,
  });
  const plane=new THREE.PlaneGeometry(2,2);
  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  scene.add(new THREE.Mesh(plane,material));
  let failed=false;
  renderer.debug.onShaderError=()=>{failed=true;};

  return {
    resize(size:number,dpr:number) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(size,size,false);
    },
    paint(sourceX:number,sourceY:number,sourceRadius:number) {
      uniforms.uCenter.value.set(sourceX/image.naturalWidth,1-sourceY/image.naturalHeight);
      uniforms.uRadius.value.set(sourceRadius/image.naturalWidth,sourceRadius/image.naturalHeight);
      renderer.render(scene,camera);
      return !failed;
    },
    dispose() {
      plane.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    },
  };
}

export function mountLensFallback(frame:HTMLElement,image:HTMLImageElement,signal:AbortSignal) {
  const lens=frame.querySelector<HTMLElement>('.eu-lens-fallback')!;
  const glass=lens.querySelector<HTMLCanvasElement>('.eu-lens-optical')!;
  const backup=lens.querySelector<HTMLCanvasElement>('.eu-lens-magnified')!;
  const section=frame.closest<HTMLElement>('.eu-material')!;
  const software=backup.getContext('2d',{alpha:false});
  let optical:ReturnType<typeof createOpticalLens>;
  try {optical=createOpticalLens(glass,image);} catch {optical=undefined;}
  if(!optical && !software) return;
  lens.toggleAttribute('data-optical',!!optical);

  let width=0,height=0,radius=0,scale=1,offsetX=0,offsetY=0,stickyTop=0,scrollLength=1;
  let visible=false,resizeNeeded=true,raf=0,previous=0,x=NaN,y=NaN;
  let placementDirty=true,placement:DOMRect,progress=0;
  let drawnX=NaN,drawnY=NaN;
  let pointer:{x:number;y:number;touch:boolean} | undefined;
  let touchOrigin:{x:number;y:number} | undefined;
  let verticalPan=false;

  function switchToSoftware() {
    optical?.dispose();
    optical=undefined;
    lens.removeAttribute('data-optical');
    resizeNeeded=true;
    schedule();
  }

  function measure() {
    width=frame.clientWidth;
    height=frame.clientHeight;
    radius=Math.min(width*.205,width<=820 ? 86 : 148);
    if(!width || !height) return;
    const diameter=radius*2;
    const dpr=Math.min(devicePixelRatio,width<=820 ? 1.2 : 1.4);
    lens.style.width=lens.style.height=diameter+'px';
    optical?.resize(diameter,dpr);
    backup.width=backup.height=Math.max(1,Math.round(diameter*dpr));
    scale=Math.max(width/image.naturalWidth,height/image.naturalHeight);
    offsetX=(width-image.naturalWidth*scale)*.5;
    offsetY=(height-image.naturalHeight*scale)*.5;
    stickyTop=parseFloat(getComputedStyle(frame).top)||0;
    scrollLength=Math.max(1,section.offsetHeight-height);
    resizeNeeded=true;
    placementDirty=true;
    schedule();
  }

  function paintImage(sourceX:number,sourceY:number,sampleRadius:number) {
    if(optical) {
      try {
        if(optical.paint(sourceX,sourceY,sampleRadius)) return true;
      } catch {
        // A context loss can occur between animation frames.
      }
      switchToSoftware();
    }
    if(!software) return false;
    const size=sampleRadius*2;
    const left=Math.max(0,Math.min(image.naturalWidth-size,sourceX-sampleRadius));
    const top=Math.max(0,Math.min(image.naturalHeight-size,sourceY-sampleRadius));
    software.drawImage(image,left,top,size,size,0,0,backup.width,backup.height);
    return true;
  }

  function draw(now:number) {
    raf=0;
    if(!visible || signal.aborted || document.hidden || !radius) return;
    if(placementDirty) {
      placement=frame.getBoundingClientRect();
      progress=clampProgress((stickyTop-section.getBoundingClientRect().top)/scrollLength);
      placementDirty=false;
    }
    let targetX=width*(.75-.37*progress);
    let targetY=height*(.59+.17*Math.sin(progress*Math.PI));
    if(pointer) {
      const margin=radius*.62;
      targetX=Math.max(margin,Math.min(width-margin,pointer.x-placement.left));
      targetY=Math.max(margin,Math.min(height-margin,pointer.y-placement.top-(pointer.touch ? radius*.45 : 0)));
    }

    const dt=previous ? Math.min(.065,(now-previous)/1000) : 1/60;
    const speed=pointer?.touch ? 45 : pointer ? 20 : 15;
    const blend=1-Math.exp(-speed*dt);
    const nextX=Number.isFinite(x) ? x+(targetX-x)*blend : targetX;
    const nextY=Number.isFinite(y) ? y+(targetY-y)*blend : targetY;
    const moving=Math.hypot(targetX-nextX,targetY-nextY)>.45;
    x=moving ? nextX : targetX;
    y=moving ? nextY : targetY;
    if(resizeNeeded || Math.hypot(x-drawnX,y-drawnY)>.24 || !Number.isFinite(drawnX)) {
      resizeNeeded=false;
      drawnX=x;
      drawnY=y;
      lens.style.transform='translate3d('+(x-radius)+'px,'+(y-radius)+'px,0)';
      const ready=paintImage((x-offsetX)/scale,(y-offsetY)/scale,radius/(scale*1.9));
      if(lens.hasAttribute('data-ready')!==ready)lens.toggleAttribute('data-ready',ready);
    }
    previous=moving ? now : 0;
    if(moving) schedule();
  }

  function schedule() {
    if(!visible || signal.aborted || document.hidden) {
      cancelAnimationFrame(raf);
      raf=previous=0;
      return;
    }
    if(!raf) raf=requestAnimationFrame(draw);
  }

  function release() {
    touchOrigin=undefined;
    verticalPan=false;
    pointer=undefined;
    schedule();
  }
  function trackTouch(event:TouchEvent) {
    if(event.touches.length!==1) {release();return;}
    const touch=event.touches[0];
    const point={x:touch.clientX,y:touch.clientY};
    touchOrigin ??=point;
    if(verticalPan) return;
    const horizontal=Math.abs(point.x-touchOrigin.x);
    const vertical=Math.abs(point.y-touchOrigin.y);
    if(vertical>12 && vertical>horizontal*1.15) {
      verticalPan=true;
      pointer=undefined;
    } else {
      pointer={...point,touch:true};
    }
    schedule();
  }

  const resize=new ResizeObserver(measure);
  const intersection=new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    placementDirty=true;
    lens.toggleAttribute('data-in-view',visible);
    if(!visible) pointer=undefined;
    schedule();
  });
  const passive={passive:true,signal};
  frame.addEventListener('touchstart',trackTouch,passive);
  frame.addEventListener('touchmove',trackTouch,passive);
  frame.addEventListener('touchend',release,passive);
  frame.addEventListener('touchcancel',release,passive);
  frame.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch') return;
    pointer={x:event.clientX,y:event.clientY,touch:false};
    schedule();
  },passive);
  frame.addEventListener('pointerleave',event=>{
    if(event.pointerType!=='touch') release();
  },{signal});
  glass.addEventListener('webglcontextlost',switchToSoftware,{once:true,signal});
  window.addEventListener('scroll',()=>{placementDirty=true;schedule();},passive);
  document.addEventListener('visibilitychange',()=>{if(document.hidden) release();else schedule();},{signal});
  signal.addEventListener('abort',()=>{
    intersection.disconnect();
    resize.disconnect();
    cancelAnimationFrame(raf);
    optical?.dispose();
    lens.removeAttribute('data-ready');
    lens.removeAttribute('data-in-view');
    lens.removeAttribute('data-optical');
    lens.removeAttribute('style');
  },{once:true});
  measure();
  intersection.observe(frame);
  resize.observe(frame);
}
