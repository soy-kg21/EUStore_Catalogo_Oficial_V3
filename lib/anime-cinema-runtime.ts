import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {cinemaFrame,cinemaGeometry,cinemaScrollProgress,clamp,smooth} from './anime-cinema';
import {createCinemaEffects} from './anime-cinema-effects';

/** Native scrolling is the only playback clock. Nothing consumes wheel/touch input. */
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
  const centers=[.72,.65,.51,.73],focus=mobile?[.75,.63,.55,.75]:[.70,.72,.56,.73];
  const leadConsumed=clamp(window.scrollY-(geometry.start-geometry.lead),0,geometry.lead);
  const openingLift=mobile?leadConsumed*(1-smooth(0,.23,p)):0;
  shots.forEach((el,i)=>{
   const local=f.local[i],scale=1+[.08,.13,.12,.04][i]*local;
   const x=focus[i]*w-centers[i]*imageW+px*(8+i*2),y=12+(i===0?openingLift:0)+py*(i+1)*1.7;
   const rotation=i===2?(local-.5)*-2.4:(local-.5)*.7;
   el.style.width=`${imageW}px`;el.style.height=`${imageH}px`;el.style.opacity=String(f.weights[i]);
   el.style.transform=`translate3d(${x}px,${y}px,0) scale(${scale}) rotate(${rotation}deg)`;
  });
  const spread=f.exit*w*.42;
  style('brand-a',f.brand,-spread,-f.exit*18,f.exit*-5);style('brand-b',f.brand,spread,f.exit*14,f.exit*5);
  style('copy',f.copy,-f.exit*20,-f.exit*55);style('edition',1-smooth(.15,.3,p),0,-f.exit*22);
  style('label-a',f.labelA,f.exit*(mobile?-80:90),-f.exit*58,3+f.exit*14);
  style('label-b',f.labelB,f.exit*120,f.exit*70,-3-f.exit*16);
  style('selection',f.selection*(geometry.lead>0?1-smooth(.02,.18,p):1),f.exit*35,f.exit*100,f.exit*7,1-f.exit*.1);
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
 const openFilters=()=>{if(window.scrollY<geometry.end)explore(new Event('click'));};
 const observer=new ResizeObserver(entries=>{if(entries.some(entry=>entry.target!==commerce||root.clientWidth<=700))scheduleMeasure();});observer.observe(commerce);observer.observe(panel);
 const rootResize=new ResizeObserver(entries=>{if(Math.abs(entries[0].contentRect.width-width)>2)scheduleMeasure();});rootResize.observe(root);
 const header=document.querySelector('header.header');if(header)observer.observe(header);
 window.addEventListener('scroll',scheduleRender,{passive:true});window.addEventListener('resize',scheduleMeasure,{passive:true});
 document.addEventListener('click',home);window.addEventListener('eu-open-anime-filters',openFilters);
 stage.addEventListener('pointermove',pointer,{passive:true});stage.addEventListener('pointerleave',leave);
 root.querySelector('[data-cinema-explore]')?.addEventListener('click',explore);reduced.addEventListener('change',scheduleMeasure);
 document.fonts.ready.then(()=>{if(!destroyed)scheduleMeasure();});measure();
 return ()=>{
  destroyed=true;cancelAnimationFrame(frame);cancelAnimationFrame(measureFrame);trigger.kill();timeline.kill();observer.disconnect();rootResize.disconnect();
  window.removeEventListener('scroll',scheduleRender);window.removeEventListener('resize',scheduleMeasure);document.removeEventListener('click',home);
  window.removeEventListener('eu-open-anime-filters',openFilters);stage.removeEventListener('pointermove',pointer);stage.removeEventListener('pointerleave',leave);
  root.querySelector('[data-cinema-explore]')?.removeEventListener('click',explore);reduced.removeEventListener('change',scheduleMeasure);
 };
}
