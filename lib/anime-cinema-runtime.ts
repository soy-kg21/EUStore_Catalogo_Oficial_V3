import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {cinemaFrame,cinemaGeometry,cinemaScrollProgress,clamp,smooth} from './anime-cinema';
import {createCinemaEffects} from './anime-cinema-effects';
import {cinemaArtwork,portraitCinemaCamera,type CinemaArtId} from './anime-cinema-art';

/** Native scrolling drives the film and the short category settling interval. */
export function mountAnimeCinema(root:HTMLElement){
 gsap.registerPlugin(ScrollTrigger);
 const find=<T extends HTMLElement>(name:string)=>root.querySelector<T>(`[data-cinema="${name}"]`)!;
 const view=find('viewport'),stage=find('stage'),commerce=find('commerce'),panel=find('panel'),discover=find('discover');
 const shots=[...root.querySelectorAll<HTMLElement>('[data-cinema-shot]')];
 const effect=createCinemaEffects(root.querySelector<HTMLCanvasElement>('canvas')!);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)'),fine=window.matchMedia('(pointer:fine)');
 const head={p:0};
 let geometry=cinemaGeometry({width:root.clientWidth,viewport:window.innerHeight,header:82,commerceTop:312,commerceHeight:380,panelHeight:300,rootTop:0});
 let frame=0,measureFrame=0,destroyed=false,px=0,py=0,width=root.clientWidth,stableHeight=window.innerHeight;
 const style=(name:string,opacity:number,x=0,y=0,rotation=0,scale=1)=>{
  const el=find(name);el.style.opacity=String(clamp(opacity));el.style.transform=`translate3d(${x}px,${y}px,0) rotate(${rotation}deg) scale(${scale})`;el.inert=opacity<.04;
 };
 const draw=(progress:number)=>{
  if(destroyed)return;
  const p=reduced.matches?0:clamp(progress),f=cinemaFrame(p),mobile=geometry.mobile;
  const base=geometry.base-(geometry.base-Math.min(geometry.base,geometry.available))*smooth(0,.23,p);
  const h=base+(geometry.collapsed-base)*f.finish,w=stage.clientWidth;
  stage.style.height=`${h}px`;
  const cameraHeight=mobile?h+(Math.min(h,560)-h)*(1-smooth(.12,.28,p)):h;
  const imageW=Math.max(w,cameraHeight*2),imageH=imageW/2;
  // Atlas landmarks keep Gojo inside the mobile opening and his head inside the closing shot.
  const centers=[.72,.78,.68,.72],focus=mobile?[.75,.68,.65,.75]:[.70,.72,.68,.73];
  const leadConsumed=clamp(window.scrollY-(geometry.start-geometry.lead),0,geometry.lead);
  const openingLift=mobile?leadConsumed*(1-smooth(0,.23,p)):0;
  shots.forEach((el,i)=>{
   const id=el.dataset.cinemaArt as CinemaArtId,art=cinemaArtwork[id],portrait=art?.format==='portrait';
   const local=f.local[i],scale=1+[.08,.13,.12,.04][i]*local;
   // The power scene keeps both Goku and the energy sphere inside a narrow screen.
   let shotWidth=mobile&&i===2?Math.min(imageW,w*2.5):imageW,shotHeight=shotWidth/2;
   const center=mobile&&i===2?.78:centers[i];
   const closingLift=i===3?Math.max(0,imageH*.32-h*.40)*f.finish:0;
   let x=focus[i]*w-center*shotWidth+px*(8+i*2),y=12+(i===0?openingLift:0)-closingLift+py*(i+1)*1.7;
   const rotation=portrait?(local-.5)*.10:i===2?(local-.5)*-2.4:(local-.5)*.7;
   if(portrait){
    const overflow=Math.max(0,h+panel.offsetHeight*f.discover-geometry.available);
    // Match the part actually hidden under the sticky header, during both entry and exit.
    const clipped=Math.min(overflow,Math.max(0,window.scrollY-(geometry.start-geometry.lead)));
    const frameOffset=h-clipped>=80?clipped:0;
    const camera=portraitCinemaCamera(id,{width:w,height:reduced.matches?340:h-frameOffset,mobile,scale,rotation,px,py,local,closing:f.collection});
    shotWidth=camera.width;shotHeight=camera.height;x=camera.x;y=camera.y+frameOffset;
   }
   el.dataset.cinemaVisible=String(f.weights[i]>.01);
   el.style.width=`${shotWidth}px`;el.style.height=`${shotHeight}px`;el.style.opacity=String(f.weights[i]);
   el.style.transform=`translate3d(${x}px,${y}px,0) scale(${scale}) rotate(${rotation}deg)`;
  });
  const portraitOpening=cinemaArtwork[shots[0].dataset.cinemaArt as CinemaArtId]?.format==='portrait';
  style('copy-title',1-smooth(.10,.26,p),-f.exit*w*.18,f.exit*(mobile&&portraitOpening?12:-32),-f.exit*2);
  style('copy-description',1-smooth(.12,.28,p),f.exit*w*.10,f.exit*28,f.exit*1.5);
  style('copy-actions',1-smooth(.14,.29,p),-f.exit*w*.08,f.exit*66);
  style('edition',1-smooth(.15,.3,p),0,-f.exit*22);
  style('label-b',f.labelB,f.exit*120,f.exit*70,-3-f.exit*16);
  style('selection',f.selection*(1-smooth(.18,.29,p))*(geometry.lead>0?1-smooth(.02,.18,p):1),f.exit*35,f.exit*100,f.exit*7,1-f.exit*.1);
  style('awake',f.awake,(1-f.awake)*-28,(1-f.awake)*40);style('power',f.power,(1-f.power)*-40,(1-f.power)*35);style('collection',f.collection,0,(1-f.collection)*25);
  style('vertical',1-f.finish*.7,px*2);
  const reveal=reduced.matches?1:f.discover;
  discover.style.height=reduced.matches?'auto':`${panel.offsetHeight*reveal}px`;
  discover.style.opacity=String(reveal);discover.inert=reveal<.86;
  panel.style.transform=`translateY(${(1-reveal)*40}px)`;
  view.style.top=`${Number(root.dataset.cinemaHeader||82)-Math.max(0,h+panel.offsetHeight*reveal-geometry.available)}px`;
  root.dataset.sceneProgress=String(p);root.dataset.cinemaLocked='false';
  find('caption').textContent=f.caption;find('hint').textContent=p>=1?'EXPLORA LOS DISEÑOS':'TÚ MARCAS EL RITMO';
  effect(p,w,h,mobile,px,py);
 };
 const timeline=gsap.timeline({paused:true}).to(head,{p:1,duration:1,ease:'none'});
 const render=()=>{
  frame=0;if(destroyed)return;
  const p=reduced.matches?0:cinemaScrollProgress(window.scrollY,geometry.start,geometry.end);
  timeline.progress(p);draw(head.p);
 };
 const scheduleRender=()=>{if(!frame&&!destroyed)frame=requestAnimationFrame(render);};
 // The browser keeps ownership of wheel, touch, momentum and keyboard input.
 // A short sticky interval in geometry settles categories without trapping input.
 const scroll=()=>scheduleRender();
 const measure=()=>{
  measureFrame=0;if(destroyed)return;
  const header=document.querySelector('header.header')?.getBoundingClientRect().height||82;
  const nextWidth=root.clientWidth;
  if(Math.abs(nextWidth-width)>2||Math.abs(window.innerHeight-stableHeight)>180){width=nextWidth;stableHeight=window.innerHeight;}
  geometry=cinemaGeometry({width:root.clientWidth,viewport:stableHeight,header,commerceTop:commerce.offsetTop,commerceHeight:commerce.offsetHeight,panelHeight:panel.offsetHeight,rootTop:root.getBoundingClientRect().top+window.scrollY});
  root.dataset.cinemaHeader=String(header);root.dataset.journeyStart=String(geometry.start);root.dataset.journeyEnd=String(geometry.end);
  root.style.height=reduced.matches?'auto':`${geometry.height}px`;root.dataset.enhanced='true';root.dataset.reduced=String(reduced.matches);
  trigger.refresh();render();window.dispatchEvent(new Event('eu-cinema-measure'));
 };
 const scheduleMeasure=()=>{if(!measureFrame&&!destroyed)measureFrame=requestAnimationFrame(measure);};
 const trigger=ScrollTrigger.create({trigger:root,start:()=>geometry.start,end:()=>geometry.end,onUpdate:scheduleRender});
 const pointer=(event:PointerEvent)=>{
  if(!fine.matches||reduced.matches)return;
  const b=stage.getBoundingClientRect();px=clamp((event.clientX-b.left)/b.width*2-1,-1,1);py=clamp((event.clientY-b.top)/b.height*2-1,-1,1);scheduleRender();
 };
 const leave=()=>{px=py=0;scheduleRender();};
 const scrollTo=(top:number)=>window.scrollTo({top:Math.max(0,top),behavior:reduced.matches?'instant':'smooth'});
 const explore=(event:Event)=>{event.preventDefault();scrollTo(reduced.matches?panel.getBoundingClientRect().top+window.scrollY-Number(root.dataset.cinemaHeader):geometry.end);};
 const home=(event:MouseEvent)=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[data-cinema-home]'):null;
  if(link){event.preventDefault();scrollTo(root.getBoundingClientRect().top+window.scrollY-Number(root.dataset.cinemaHeader));}
 };
 const openFilters=()=>{if(window.scrollY<geometry.end){scrollTo(geometry.end);}};
 const observer=new ResizeObserver(entries=>{if(entries.some(entry=>entry.target!==commerce||root.clientWidth<=700))scheduleMeasure();});observer.observe(commerce);observer.observe(panel);
 const rootResize=new ResizeObserver(entries=>{if(Math.abs(entries[0].contentRect.width-width)>2)scheduleMeasure();});rootResize.observe(root);
 const header=document.querySelector('header.header');if(header)observer.observe(header);
 window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scheduleMeasure,{passive:true});
 root.addEventListener('eu-cinema-art-change',scheduleRender);
 document.addEventListener('click',home);window.addEventListener('eu-open-anime-filters',openFilters);
 stage.addEventListener('pointermove',pointer,{passive:true});stage.addEventListener('pointerleave',leave);
 root.querySelector('[data-cinema-explore]')?.addEventListener('click',explore);reduced.addEventListener('change',scheduleMeasure);
 document.fonts.ready.then(()=>{if(!destroyed)scheduleMeasure();});measure();
 return ()=>{
  destroyed=true;cancelAnimationFrame(frame);cancelAnimationFrame(measureFrame);trigger.kill();timeline.kill();observer.disconnect();rootResize.disconnect();
  window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scheduleMeasure);document.removeEventListener('click',home);
  root.removeEventListener('eu-cinema-art-change',scheduleRender);
  window.removeEventListener('eu-open-anime-filters',openFilters);stage.removeEventListener('pointermove',pointer);stage.removeEventListener('pointerleave',leave);
  root.querySelector('[data-cinema-explore]')?.removeEventListener('click',explore);reduced.removeEventListener('change',scheduleMeasure);
 };
}
