import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {cinemaFrame,cinemaGeometry,cinemaScrollProgress,clamp,smooth} from './anime-cinema';
import {createCinemaEffects} from './anime-cinema-effects';
import {CINEMA_GESTURE_PX,createCinemaGestureGate} from './anime-cinema-input';

/** Scroll remains the playback clock; only the category boundary checks two gestures. */
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
   const local=f.local[i],scale=1+[.08,.13,.12,.04][i]*local;
   // The power scene keeps both Goku and the energy sphere inside a narrow screen.
   const shotWidth=mobile&&i===2?Math.min(imageW,w*2.5):imageW,shotHeight=shotWidth/2;
   const center=mobile&&i===2?.78:centers[i];
   const closingLift=i===3?Math.max(0,imageH*.32-h*.40)*f.finish:0;
   const x=focus[i]*w-center*shotWidth+px*(8+i*2),y=12+(i===0?openingLift:0)-closingLift+py*(i+1)*1.7;
   const rotation=i===2?(local-.5)*-2.4:(local-.5)*.7;
   el.style.width=`${shotWidth}px`;el.style.height=`${shotHeight}px`;el.style.opacity=String(f.weights[i]);
   el.style.transform=`translate3d(${x}px,${y}px,0) scale(${scale}) rotate(${rotation}deg)`;
  });
  style('copy-title',1-smooth(.10,.26,p),-f.exit*w*.18,-f.exit*32,-f.exit*2);
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
 const gate=createCinemaGestureGate();
 let inputGesture=-1,inputUntil=0,releasedGesture=-1,previousY=window.scrollY,placing=false,wheelId=-1,wheelTravel=0;
 const ignore=(target:EventTarget|null)=>target instanceof Element&&!!target.closest('input,textarea,select,[role="dialog"],[data-cinema-native-scroll]');
 const blocked=()=>reduced.matches||document.hidden||!!document.querySelector('[role="dialog"][data-state="open"],[role="dialog"][data-open]');
 const markInput=(id:number)=>{inputGesture=id;inputUntil=Date.now()+1200;};
 const park=(id:number)=>{
  gate.arrive(id);releasedGesture=-1;placing=true;
  window.scrollTo({top:geometry.end,behavior:'instant'});previousY=geometry.end;placing=false;scheduleRender();
 };
 const atCategories=()=>Math.abs(window.scrollY-geometry.end)<=2;
 const crossesCategories=(from:number,to:number)=>from<geometry.end-2&&to>=geometry.end||from>geometry.end+2&&to<=geometry.end;
 const boundary=(direction:number,id:number,delta:number,travel:number)=>{
  if(blocked())return false;
  if(releasedGesture===id)return false;
  if(crossesCategories(window.scrollY,window.scrollY+delta)){park(id);return true;}
  if(!atCategories())return false;
  if(travel<CINEMA_GESTURE_PX)return true;
  if(!gate.boundary(direction,id))return true;
  releasedGesture=id;return false;
 };
 const wheel=(event:WheelEvent)=>{
  if(blocked()||event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||!event.deltaY||ignore(event.target))return;
  const direction=Math.sign(event.deltaY),delta=event.deltaY*(event.deltaMode===1?18:event.deltaMode===2?stableHeight:1);
  const id=gate.wheel(direction,Date.now());if(id!==wheelId){wheelId=id;wheelTravel=0;}wheelTravel+=Math.abs(delta);markInput(id);
  if(boundary(direction,id,delta,wheelTravel))event.preventDefault();
 };
 let touch:{id:number;x:number;y:number;lastY:number;manual:boolean}|null=null;
 const touchStart=(event:TouchEvent)=>{
  touch=!blocked()&&!ignore(event.target)&&event.touches.length===1?{id:gate.start(),x:event.touches[0].clientX,y:event.touches[0].clientY,lastY:event.touches[0].clientY,manual:false}:null;
 };
 const touchMove=(event:TouchEvent)=>{
  if(!touch||event.touches.length!==1||blocked())return;
  const item=event.touches[0],dy=touch.y-item.clientY,dx=touch.x-item.clientX,delta=touch.lastY-item.clientY;touch.lastY=item.clientY;
  if(Math.abs(dx)>Math.abs(dy)||!dy)return;
  markInput(touch.id);
  if(touch.manual){event.preventDefault();window.scrollTo({top:Math.max(0,window.scrollY+delta),behavior:'instant'});return;}
  const wasAtCategories=atCategories();
  if(boundary(Math.sign(dy),touch.id,delta,Math.abs(dy)))event.preventDefault();
  else if(wasAtCategories&&releasedGesture===touch.id){
   // A browser can cancel native panning after preventDefault. Carry the second
   // contact by its actual finger delta so release always works on mobile.
   touch.manual=true;event.preventDefault();window.scrollTo({top:Math.max(0,window.scrollY+delta),behavior:'instant'});
  }
 };
 const touchEnd=()=>{touch=null;};
 const key=(event:KeyboardEvent)=>{
  if(blocked()||event.ctrlKey||event.metaKey||event.altKey||ignore(event.target)||(event.target instanceof Element&&event.target.closest('button,a')))return;
  const down=['ArrowDown','PageDown',' ','End'].includes(event.key),up=['ArrowUp','PageUp','Home'].includes(event.key);
  if(!down&&!up||!atCategories())return;
  if(event.repeat){event.preventDefault();return;}
  const id=gate.start();markInput(id);if(boundary(down?1:-1,id,0,CINEMA_GESTURE_PX))event.preventDefault();
 };
 const scroll=()=>{
  const y=window.scrollY;
  // Catch native touch momentum overshooting the stop. Programmatic placement,
  // browser history, anchors and explicit product returns keep their own position.
  if(!placing&&!blocked()&&inputGesture>=0&&Date.now()<inputUntil&&releasedGesture!==inputGesture&&crossesCategories(previousY,y)){park(inputGesture);return;}
  previousY=y;scheduleRender();
 };
 const resetInput=()=>{inputGesture=-1;inputUntil=0;releasedGesture=-1;gate.arrive();};
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
 const explore=(event:Event)=>{event.preventDefault();resetInput();scrollTo(reduced.matches?panel.getBoundingClientRect().top+window.scrollY-Number(root.dataset.cinemaHeader):geometry.end);};
 const home=(event:MouseEvent)=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const anchor=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href^="#"]'):null;if(anchor)resetInput();
  const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[data-cinema-home]'):null;
  if(link){event.preventDefault();scrollTo(root.getBoundingClientRect().top+window.scrollY-Number(root.dataset.cinemaHeader));}
 };
 const openFilters=()=>{if(window.scrollY<geometry.end)explore(new Event('click'));};
 const observer=new ResizeObserver(entries=>{if(entries.some(entry=>entry.target!==commerce||root.clientWidth<=700))scheduleMeasure();});observer.observe(commerce);observer.observe(panel);
 const rootResize=new ResizeObserver(entries=>{if(Math.abs(entries[0].contentRect.width-width)>2)scheduleMeasure();});rootResize.observe(root);
 const header=document.querySelector('header.header');if(header)observer.observe(header);
 window.addEventListener('wheel',wheel,{passive:false});window.addEventListener('touchstart',touchStart,{passive:true});window.addEventListener('touchmove',touchMove,{passive:false});window.addEventListener('touchend',touchEnd,{passive:true});window.addEventListener('touchcancel',touchEnd,{passive:true});window.addEventListener('keydown',key);
 window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scheduleMeasure,{passive:true});
 document.addEventListener('click',home);window.addEventListener('eu-open-anime-filters',openFilters);window.addEventListener('popstate',resetInput);window.addEventListener('eu-anime-place-list',resetInput);
 stage.addEventListener('pointermove',pointer,{passive:true});stage.addEventListener('pointerleave',leave);
 root.querySelector('[data-cinema-explore]')?.addEventListener('click',explore);reduced.addEventListener('change',scheduleMeasure);
 document.fonts.ready.then(()=>{if(!destroyed)scheduleMeasure();});measure();
 return ()=>{
  destroyed=true;cancelAnimationFrame(frame);cancelAnimationFrame(measureFrame);trigger.kill();timeline.kill();observer.disconnect();rootResize.disconnect();
  window.removeEventListener('wheel',wheel);window.removeEventListener('touchstart',touchStart);window.removeEventListener('touchmove',touchMove);window.removeEventListener('touchend',touchEnd);window.removeEventListener('touchcancel',touchEnd);window.removeEventListener('keydown',key);
  window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scheduleMeasure);document.removeEventListener('click',home);
  window.removeEventListener('eu-open-anime-filters',openFilters);window.removeEventListener('popstate',resetInput);window.removeEventListener('eu-anime-place-list',resetInput);stage.removeEventListener('pointermove',pointer);stage.removeEventListener('pointerleave',leave);
  root.querySelector('[data-cinema-explore]')?.removeEventListener('click',explore);reduced.removeEventListener('change',scheduleMeasure);
 };
}
