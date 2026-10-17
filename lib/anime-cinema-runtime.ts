import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {cinemaFrame,cinemaGeometry,clamp,createCinemaPlayback,smooth} from './anime-cinema';
import {createCinemaEffects} from './anime-cinema-effects';

/** One controller owns the film, UI choreography and guided native scroll. */
export function mountAnimeCinema(root:HTMLElement){
 gsap.registerPlugin(ScrollTrigger);
 const find=<T extends HTMLElement>(name:string)=>root.querySelector<T>(`[data-cinema="${name}"]`)!;
 const view=find('viewport'),stage=find('stage'),commerce=find('commerce'),panel=find('panel'),discover=find('discover');
 const shots=[...root.querySelectorAll<HTMLElement>('[data-cinema-shot]')];
 const effect=createCinemaEffects(root.querySelector<HTMLCanvasElement>('canvas')!);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)'),fine=window.matchMedia('(pointer:fine)');
 const player=createCinemaPlayback(),head={p:0};
 let geometry=cinemaGeometry({width:root.clientWidth,viewport:window.innerHeight,header:82,commerceTop:312,commerceHeight:380,panelHeight:300,rootTop:0});
 let frame=0,measureFrame=0,last=0,visible=true,destroyed=false,locked=false,explicitNavigation=false,px=0,py=0,tx=0,ty=0;
 let width=root.clientWidth,stableHeight=window.innerHeight;
 let mode:'auto'|'manual'='auto';
 try{if(sessionStorage.getItem('eu-cinema-mode')==='manual')mode='manual';}catch{}
 let guideY=window.scrollY,guideP=0,guideEnd=0;
 const syncMode=()=>{root.dataset.cinemaMode=mode;root.querySelectorAll<HTMLButtonElement>('[data-cinema-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.cinemaMode===mode)));};
 syncMode();
 const blocked=()=>document.hidden||!!document.querySelector('[role="dialog"][data-state="open"],[role="dialog"][data-open]');
 const style=(name:string,opacity:number,x=0,y=0,rotation=0,scale=1)=>{
  const el=find(name);el.style.opacity=String(clamp(opacity));el.style.transform=`translate3d(${x}px,${y}px,0) rotate(${rotation}deg) scale(${scale})`;el.inert=opacity<.04;
 };
 const draw=(progress:number)=>{
  if(destroyed)return;
  const p=reduced.matches?0:clamp(progress),f=cinemaFrame(p),mobile=geometry.mobile,unit=geometry.scale;
  const base=geometry.base-(geometry.base-Math.min(geometry.base,geometry.available))*smooth(0,.23,p);
  const h=base+(geometry.collapsed-base)*f.finish,w=stage.clientWidth;
  stage.style.height=`${h}px`;
  const imageW=Math.max(w,h*2),imageH=imageW/2,centers=[.67,.65,.51,.71],focus=mobile?[.68,.63,.55,.75]:[.69,.72,.56,.73];
  shots.forEach((el,i)=>{const local=f.local[i],scale=1+[.08,.13,.12,.04][i]*local,ox=focus[i]*w-centers[i]*imageW,y=(h-imageH)*.24+(mobile?12:0)+py*(i+1)*1.7,rot=i===2?(local-.5)*-2.4:(local-.5)*.7;el.style.width=`${imageW}px`;el.style.height=`${imageH}px`;el.style.opacity=String(f.weights[i]);el.style.transform=`translate3d(${ox+px*(8+i*2)}px,${y}px,0) scale(${scale}) rotate(${rot}deg)`;});
  const spread=f.exit*w*.42;
  style('brand-a',f.brand,-spread,-f.exit*18*unit,f.exit*-5);style('brand-b',f.brand,spread,f.exit*14*unit,f.exit*5);
  style('copy',f.copy,-f.exit*20*unit,-f.exit*55*unit);style('edition',1-smooth(.15,.3,p),0,-f.exit*22*unit);
  style('label-a',f.labelA,f.exit*(mobile?-80:90)*unit,-f.exit*58*unit,3+f.exit*14);
  style('label-b',f.labelB,f.exit*120*unit,f.exit*70*unit,-3-f.exit*16);
  style('selection',f.selection*(geometry.lead>0?1-smooth(.02,.18,p):1),f.exit*35*unit,f.exit*100*unit,f.exit*7,1-f.exit*.1);
  style('awake',f.awake,(1-f.awake)*-28*unit,(1-f.awake)*40*unit);style('power',f.power,(1-f.power)*-40*unit,(1-f.power)*35*unit);style('collection',f.collection,0,(1-f.collection)*45*unit);
  style('vertical',1-f.finish*.7,px*2);
  const reveal=reduced.matches?1:f.discover;
  discover.style.height=reduced.matches?'auto':`${panel.offsetHeight*reveal}px`;
  discover.style.opacity=String(reveal);discover.inert=reveal<.86;
  panel.style.transform=`translateY(${(1-reveal)*55*unit}px)`;
  const height=h+panel.offsetHeight*reveal;
  // Only the over-tall composition needs a negative sticky offset on short screens.
  view.style.top=`${Number(root.dataset.cinemaHeader||82)-Math.max(0,height-geometry.available)}px`;
  root.dataset.sceneProgress=String(p);root.dataset.cinemaLocked=String(locked);
  find('caption').textContent=f.caption;
  find('hint').textContent=mode==='manual'?'TÚ CONTROLAS EL SCROLL':locked?'RECORRIDO AUTOMÁTICO · 23 s':'DESLIZA PARA COMENZAR';
  effect(p,w,h,mobile,px,py);
 };
 const timeline=gsap.timeline({paused:true}).to(head,{p:1,duration:1,ease:'none',onUpdate:()=>draw(head.p)});
 const allowed=()=>locked&&player.target!==guideP?guideY+(guideEnd-guideY)*clamp((player.position-guideP)/(player.target-guideP)):geometry.start+player.position*geometry.distance;
 const place=()=>{const y=allowed();if(Math.abs(window.scrollY-y)>.5)window.scrollTo({top:y,behavior:'instant'});};
 const tick=(time:number)=>{
  frame=0;if(destroyed)return;const dt=Math.max(0,(time-(last||time))/1000);last=time;
  if(!blocked()&&visible){
   if(locked&&player.moving){player.advance(dt);place();}
   const k=1-Math.exp(-dt/.16);px+=(tx-px)*k;py+=(ty-py)*k;
   timeline.progress(player.position);draw(player.position);
   if(locked&&!player.moving&&(player.position===0||player.position===1)){locked=false;draw(player.position);}
  }
  if((locked&&player.moving)||Math.abs(px-tx)>.001||Math.abs(py-ty)>.001)frame=requestAnimationFrame(tick);else last=0;
 };
 const wake=()=>{if(!frame&&!destroyed){last=window.performance.now()||Number.EPSILON;frame=requestAnimationFrame(tick);}};
 const measure=()=>{
  measureFrame=0;if(destroyed)return;
  const header=document.querySelector('header.header')?.getBoundingClientRect().height||82;
  const nextWidth=root.clientWidth;if(Math.abs(nextWidth-width)>2||Math.abs(window.innerHeight-stableHeight)>180){width=nextWidth;stableHeight=window.innerHeight;}
  geometry=cinemaGeometry({width:root.clientWidth,viewport:stableHeight,header,commerceTop:commerce.offsetTop,commerceHeight:commerce.offsetHeight,panelHeight:panel.offsetHeight,rootTop:root.getBoundingClientRect().top+window.scrollY,scale:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--eu-ui-scale'))||1,phoneDesktop:document.documentElement.dataset.phoneDesktop==='true'});
  root.dataset.cinemaHeader=String(header);root.dataset.journeyStart=String(geometry.start);root.dataset.journeyEnd=String(geometry.end);
  root.style.height=reduced.matches?'auto':`${geometry.height}px`;root.dataset.enhanced='true';root.dataset.reduced=String(reduced.matches);
  if(reduced.matches){locked=false;player.seek(0);discover.inert=false;}
  if(locked){guideY=window.scrollY;guideP=player.position;guideEnd=player.target===1?geometry.end:geometry.start;}
  trigger.refresh();draw(player.position);window.dispatchEvent(new Event('eu-cinema-measure'));
 };
 const scheduleMeasure=()=>{if(!measureFrame&&!destroyed)measureFrame=requestAnimationFrame(measure);};
 const trigger=ScrollTrigger.create({trigger:root,start:()=>geometry.start,end:()=>geometry.end,onUpdate:self=>{if(!locked&&!reduced.matches){player.seek(self.progress);timeline.progress(self.progress);draw(self.progress);}}});
 const engage=(direction:number)=>{
  if(mode==='manual'||reduced.matches||blocked())return false;
  const y=window.scrollY,entry=0;
  if(!locked){
   if(y<entry-2||y>geometry.end+2)return false;
   player.seek(clamp((y-geometry.start)/geometry.distance));
   if((direction>0&&player.position>=1)||(direction<0&&player.position<=0))return false;
  }
  const target=direction>0?1:0;
  if(!locked||player.target!==target){guideY=y;guideP=player.position;guideEnd=target===1?geometry.end:Math.max(0,geometry.start-geometry.lead);}
  locked=true;explicitNavigation=false;player.request(direction,true);place();wake();return true;
 };
 const ignore=(target:EventTarget|null)=>target instanceof Element&&!!target.closest('input,textarea,select,[role="dialog"],[data-cinema-native-scroll]');
 const wheel=(event:WheelEvent)=>{
  if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||ignore(event.target)||!event.deltaY)return;
  const direction=Math.sign(event.deltaY);
  if(engage(direction)){event.preventDefault();}
 };
 const scroll=()=>{
  if(destroyed||reduced.matches||blocked()||explicitNavigation)return;
  // Native scrollbar, history and explicit product returns may place the page directly.
  if(locked){if(Math.abs(window.scrollY-allowed())>3){locked=false;player.seek(clamp((window.scrollY-geometry.start)/geometry.distance));timeline.progress(player.position);draw(player.position);}}
 };
 let touch:{x:number;y:number}|null=null;
 const touchStart=(event:TouchEvent)=>{touch=!ignore(event.target)&&event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;};
 const touchMove=(event:TouchEvent)=>{if(!touch||event.touches.length!==1)return;const item=event.touches[0],dy=touch.y-item.clientY,dx=touch.x-item.clientX;if(Math.abs(dx)>Math.abs(dy))return;if(Math.abs(dy)<12)return;const direction=Math.sign(dy);if(engage(direction)){event.preventDefault();touch={x:item.clientX,y:item.clientY};}};
 const touchEnd=()=>{touch=null;};
 const key=(event:KeyboardEvent)=>{if(event.ctrlKey||event.metaKey||event.altKey||ignore(event.target)||(event.target instanceof Element&&event.target.closest('button,a')))return;const down=['ArrowDown','PageDown',' ','End'].includes(event.key),up=['ArrowUp','PageUp','Home'].includes(event.key);if(!down&&!up)return;if(engage(down?1:-1))event.preventDefault();};
 const pointer=(event:PointerEvent)=>{if(!fine.matches||reduced.matches)return;const b=stage.getBoundingClientRect();tx=clamp((event.clientX-b.left)/b.width*2-1,-1,1);ty=clamp((event.clientY-b.top)/b.height*2-1,-1,1);wake();};
 const leave=()=>{tx=ty=0;wake();};
 const explore=(event:Event)=>{
  if(reduced.matches)return;
  event.preventDefault();
  if(mode==='manual'){window.scrollTo({top:geometry.end,behavior:'smooth'});return;}
  if(window.scrollY>geometry.end){window.scrollTo({top:Math.max(0,geometry.start-geometry.lead),behavior:'instant'});player.seek(0);}
  engage(1);
 };
 const setMode=(event:Event)=>{
  const button=event.target instanceof Element?event.target.closest<HTMLElement>('button[data-cinema-mode]'):null;
  if(!button)return;
  const next=button.dataset.cinemaMode;if(next!=='auto'&&next!=='manual')return;
  if(next===mode)return;
  const wasLocked=locked;locked=false;player.seek(player.position);mode=next;syncMode();
  try{sessionStorage.setItem('eu-cinema-mode',mode);}catch{}
  if(wasLocked){explicitNavigation=true;window.scrollTo({top:geometry.start+player.position*geometry.distance,behavior:'instant'});explicitNavigation=false;}
  draw(player.position);
 };
 const placeList=()=>{locked=false;explicitNavigation=true;player.seek(1);timeline.progress(1);draw(1);};
 const visibility=()=>{last=0;if(!document.hidden)wake();};
 const navigation=(event:MouseEvent)=>{const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href^="#"]'):null;if(link&&link.getAttribute('href')!=='#anime-discover'){explicitNavigation=true;locked=false;player.seek(player.position);}};
 const openFilters=()=>{if(window.scrollY<=geometry.end&&!reduced.matches){explore(new Event('click'));}};
 const observer=new ResizeObserver(entries=>{if(entries.some(entry=>entry.target!==commerce||root.clientWidth<=700))scheduleMeasure();});observer.observe(commerce);observer.observe(panel);
 const rootResize=new ResizeObserver(entries=>{if(Math.abs(entries[0].contentRect.width-width)>2)scheduleMeasure();});rootResize.observe(root);
 const header=document.querySelector('header.header');if(header)observer.observe(header);
 const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)wake();},{rootMargin:'100px'});intersection.observe(root);
 window.addEventListener('wheel',wheel,{passive:false});window.addEventListener('touchstart',touchStart,{passive:true});window.addEventListener('touchmove',touchMove,{passive:false});window.addEventListener('touchend',touchEnd,{passive:true});window.addEventListener('keydown',key);window.addEventListener('scroll',scroll,{passive:true,capture:true});window.addEventListener('resize',scheduleMeasure,{passive:true});window.addEventListener('eu-display-change',scheduleMeasure);window.addEventListener('eu-anime-place-list',placeList);document.addEventListener('visibilitychange',visibility);
 root.addEventListener('click',navigation,true);root.addEventListener('click',setMode);
 window.addEventListener('eu-open-anime-filters',openFilters);
 stage.addEventListener('pointermove',pointer,{passive:true});stage.addEventListener('pointerleave',leave);root.querySelector('[data-cinema-explore]')?.addEventListener('click',explore);reduced.addEventListener('change',scheduleMeasure);
 document.fonts.ready.then(()=>{if(!destroyed)scheduleMeasure();});measure();
 // Browser history may restore a product-grid position without restarting the intro.
 if(window.scrollY>geometry.end){player.seek(1);timeline.progress(1);draw(1);}
 return ()=>{destroyed=true;cancelAnimationFrame(frame);cancelAnimationFrame(measureFrame);trigger.kill();timeline.kill();observer.disconnect();rootResize.disconnect();intersection.disconnect();window.removeEventListener('wheel',wheel);window.removeEventListener('touchstart',touchStart);window.removeEventListener('touchmove',touchMove);window.removeEventListener('touchend',touchEnd);window.removeEventListener('keydown',key);window.removeEventListener('scroll',scroll,true);window.removeEventListener('resize',scheduleMeasure);window.removeEventListener('eu-display-change',scheduleMeasure);window.removeEventListener('eu-anime-place-list',placeList);document.removeEventListener('visibilitychange',visibility);root.removeEventListener('click',setMode);window.removeEventListener('eu-open-anime-filters',openFilters);root.removeEventListener('click',navigation,true);stage.removeEventListener('pointermove',pointer);stage.removeEventListener('pointerleave',leave);root.querySelector('[data-cinema-explore]')?.removeEventListener('click',explore);reduced.removeEventListener('change',scheduleMeasure);};
}
