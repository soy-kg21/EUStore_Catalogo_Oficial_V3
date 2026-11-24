import {watchFeaturedPiece} from './featured-motion';

async function smoothWheel(signal:AbortSignal) {
  const {default:Lenis}=await import('lenis');
  if(signal.aborted) return;
  const wheel=new Lenis({
    lerp:.085,wheelMultiplier:.9,syncTouch:false,autoRaf:false,
    virtualScroll:({event,deltaX,deltaY})=>event.type==='wheel' && !event.ctrlKey
      && Math.abs(deltaY)>Math.abs(deltaX) && !document.body.hasAttribute('data-scroll-locked'),
    prevent:node=>node.matches('[role=dialog],textarea,select,[contenteditable=true]'),
  });
  let frame=0;
  function advance() {
    // An anchor, focus change or scrollbar drag can move the document mid-burst.
    if(wheel.isScrolling==='smooth' && Math.abs(wheel.actualScroll-wheel.animatedScroll)>2) {
      interrupt();
      return;
    }
    frame=0;
    wheel.raf(performance.now());
    if(wheel.isScrolling==='smooth') frame=requestAnimationFrame(advance);
  }
  wheel.on('virtual-scroll',()=>{
    if(frame) return;
    if(Math.abs(wheel.animatedScroll-wheel.actualScroll)>1) wheel.resize();
    // Prime the clock before accepting a new wheel burst after an idle period.
    wheel.raf(performance.now());
    frame=requestAnimationFrame(advance);
  });
  function interrupt() {
    if(!frame) return;
    cancelAnimationFrame(frame);
    frame=0;
    wheel.stop();
    wheel.start();
  }
  document.addEventListener('pointerdown',interrupt,{capture:true,passive:true,signal});
  document.addEventListener('keydown',interrupt,{capture:true,signal});
  document.addEventListener('visibilitychange',interrupt,{signal});
  signal.addEventListener('abort',()=>{cancelAnimationFrame(frame);wheel.destroy();},{once:true});
}

const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>1-(1-clamp(n))**3;
const format=new Intl.NumberFormat('es-CO');
const railEaseEdge=.12;
const railCruise=1-railEaseEdge;
const railRamp=2*railEaseEdge*railCruise;

function mapRailPhase(phase:number,inverse=false) {
  const reversed=phase>.5;
  const half=reversed ? 1-phase : phase;
  const result=inverse
    ? half<railEaseEdge/(2*railCruise) ? Math.sqrt(half*railRamp) : half*railCruise+railEaseEdge/2
    : half<railEaseEdge ? half*half/railRamp : (half-railEaseEdge/2)/railCruise;
  return reversed ? 1-result : result;
}

const railStops=[0,.03,.06,.09,.12,.88,.91,.94,.97,1];
const railEasing='linear('+railStops.map(stop=>mapRailPhase(stop).toFixed(6)+' '+Math.round(stop*100)+'%').join(',')+')';

function cursorRing(signal:AbortSignal){
  const ring=document.createElement('div');
  ring.className='eu-cursor'; ring.setAttribute('aria-hidden','true');document.body.appendChild(ring);
  let x=0,y=0,px=0,py=0,raf=0,shown=false;
  function draw(){
    raf=0;x+=(px-x)*.25;y+=(py-y)*.25;
    ring.style.transform='translate3d('+x+'px,'+y+'px,0)';
    if(Math.abs(x-px)+Math.abs(y-py)>.25)raf=requestAnimationFrame(draw);
  }
  function hide(){
    shown=false;ring.hidden=true;document.documentElement.classList.remove('eu-ring-on');cancelAnimationFrame(raf);raf=0;
  }
  hide();
  document.addEventListener('pointermove',e=>{
    const target=e.target;
    if(e.pointerType==='touch'||!(target instanceof Element)||target.closest('input,textarea,select,[contenteditable=true]')){hide();return;}
    px=e.clientX;py=e.clientY;
    if(!shown){x=px;y=py;shown=true;ring.hidden=false;document.documentElement.classList.add('eu-ring-on');}
    ring.toggleAttribute('data-action',!!target.closest('a,button,[role=button],summary,label[for]'));
    if(!raf)raf=requestAnimationFrame(draw);
  },{passive:true,signal});
  let hitFrame=0;
  function refreshHover(){
    hitFrame=0;
    if(!shown)return;
    const target=document.elementFromPoint(px,py);
    if(!target || target.closest('input,textarea,select,[contenteditable=true]')){hide();return;}
    ring.toggleAttribute('data-action',!!target.closest('a,button,[role=button],summary,label[for]'));
  }
  window.addEventListener('scroll',()=>{
    if(shown && !hitFrame)hitFrame=requestAnimationFrame(refreshHover);
  },{passive:true,signal});
  signal.addEventListener('abort',()=>cancelAnimationFrame(hitFrame),{once:true});
  document.addEventListener('pointerout',e=>{if(!e.relatedTarget)hide();},{signal});
  document.addEventListener('keydown',e=>{if(e.key==='Tab')hide();},{signal});
  window.addEventListener('blur',hide,{signal});
  signal.addEventListener('abort',()=>{hide();ring.remove();},{once:true});
}

export function startStory(main:HTMLElement,reduced:boolean,fine:boolean) {
  const strip=main.querySelector<HTMLElement>('.eu-collection')!;
  const track=strip.querySelector<HTMLElement>('.eu-collection-track')!;
  const pin=strip.querySelector<HTMLElement>('.eu-collection-pin')!;
  const cards=[...strip.querySelectorAll<HTMLElement>('.eu-collection-card')];
  const stats=main.querySelector<HTMLElement>('.eu-stats')!;
  const counters=[...stats.querySelectorAll<HTMLElement>('[data-total]')];
  const pieceSection=main.querySelector<HTMLElement>('.eu-pieces')!;
  const social=main.querySelector<HTMLElement>('.eu-social')!;
  if(reduced) return ()=>{};

  const controller=new AbortController();
  const {signal}=controller;
  const entrances = new Map<Element,Animation>();
  const chapterEntries = new IntersectionObserver(entries=>{
    for (const entry of entries) {
      entrances.get(entry.target)?.cancel();
      entrances.delete(entry.target);
      if (!entry.isIntersecting || !entry.intersectionRatio) continue;
      const offset = entry.boundingClientRect.top < innerHeight*.3 ? -18 : 24;
      const animation = entry.target.animate([
        {opacity:.35,transform:'translate3d(0,'+offset+'px,0)'},
        {opacity:1,transform:'translate3d(0,0,0)'},
      ],{duration:540,easing:'cubic-bezier(.16,1,.3,1)'});
      entrances.set(entry.target,animation);
    }
  },{rootMargin:'0px 0px -4% 0px'});
  for (const element of main.querySelectorAll('.eu-stats > .eu-label,.eu-stats dl > div,.eu-section-heading,.eu-carrier-window,.eu-shipping-note,.eu-shipping + [role=region]')) {
    chapterEntries.observe(element);
  }
  if(fine) {
    cursorRing(signal);
    void smoothWheel(signal).catch(()=>{/* Keep the browser's native wheel if the chunk is unavailable. */});
  }
  const pieces=[...pieceSection.querySelectorAll<HTMLElement>('.eu-piece')].map(piece=>({
    piece, motion:watchFeaturedPiece(piece,fine,signal),
  }));
  const nativeRail=CSS.supports('animation-timeline','--collection-scroll')
    && CSS.supports('animation-range','contain') && CSS.supports('animation-timing-function',railEasing);
  if(nativeRail) {
    strip.dataset.nativeRail='';
    strip.style.setProperty('--rail-easing',railEasing);
  }
  let travel=0, railLength=1, viewportWidth=0, top=0, headerHeight=0, raf=0, lastX=-1, lastScroll=window.scrollY;
  let adjustRailEntry=false, lastHeadroom=-1;
  let collectionWasVisible=false, piecesWereVisible=false;
  let cardGeometry:{left:number;width:number;reveal:number}[]=[];

  function paint() {
    raf=0;
    const currentScroll=window.scrollY;
    const direction=Math.sign(currentScroll-lastScroll);
    lastScroll=currentScroll;
    const bottom=innerHeight;
    const collection=strip.getBoundingClientRect();
    const collectionVisible=collection.top<bottom && collection.bottom>top;
    const statsBounds=stats.getBoundingClientRect();
    const pieceBounds=pieceSection.getBoundingClientRect();
    const piecesVisible=pieceBounds.top<bottom && pieceBounds.bottom>top;
    const pieceRects=piecesVisible ? pieces.map(({piece})=>piece.getBoundingClientRect()) : [];
    const socialTop=social.getBoundingClientRect().top;
    if(collectionVisible) {
      if(adjustRailEntry) {
        // Ease the vertical approach to a stop as the horizontal rail starts.
        const entry=clamp(1-collection.top/(2*headerHeight));
        const headroom=headerHeight*entry**2;
        if(headroom!==lastHeadroom) {
          strip.style.setProperty('--rail-headroom',headroom+'px');
          lastHeadroom=headroom;
        }
      }
      const progress=mapRailPhase(clamp((top-collection.top)/railLength));
      const x=travel*progress;
      if(x!==lastX || !collectionWasVisible) {
        lastX=x;
        if(!nativeRail) {
          track.style.transform='translate3d('+(-x)+'px,0,0)';
          strip.style.setProperty('--rail',String(progress));
        }
        cards.forEach((card,index)=>{
          const {left,width:cardWidth}=cardGeometry[index];
          const start=left-x;
          const visible=start<viewportWidth+2 && start+cardWidth>-2;
          if(card.hasAttribute('data-slide-in-view')!==visible)card.toggleAttribute('data-slide-in-view',visible);
          const reveal=Math.round(ease((viewportWidth-start)/(viewportWidth*.5))*100)/100;
          if(reveal===cardGeometry[index].reveal) return;
          cardGeometry[index].reveal=reveal;
          card.style.setProperty('--photo-reveal',String(reveal));
          card.toggleAttribute('data-revealing',visible && reveal<1);
        });
      }
    } else if(collectionWasVisible) {
      cards.forEach(card=>card.removeAttribute('data-slide-in-view'));
    }
    collectionWasVisible=collectionVisible;

    if(statsBounds.top<bottom && statsBounds.bottom>0) {
      const counted=ease((bottom*.9-statsBounds.top)/(bottom*.6));
      counters.forEach(counter=>{
        const value=format.format(Math.round(Number(counter.dataset.total)*counted));
        if(counter.textContent!==value)counter.textContent=value;
      });
    }

    if(piecesVisible) {
      pieces.forEach(({motion},index)=>motion.update(pieceRects[index],headerHeight,bottom,direction));
    } else if(piecesWereVisible) {
      pieces.forEach(({motion})=>motion.suspend());
    }
    piecesWereVisible=piecesVisible;

    if(socialTop<bottom) {
      const progress=ease((bottom-socialTop)/(bottom*.3));
      social.style.setProperty('--entry-opacity',String(.12+.88*progress));
      social.style.setProperty('--entry-offset',((1-progress)*44)+'px');
    }
  }
  function schedule() {
    if(document.hidden) {
      cancelAnimationFrame(raf);
      raf=0;
      cards.forEach(card=>card.removeAttribute('data-slide-in-view'));
      pieces.forEach(({motion})=>motion.suspend());
      collectionWasVisible=false;
    } else if(!raf) raf=requestAnimationFrame(paint);
  }
  function measure() {
    if(signal.aborted) return;
    strip.dataset.pinned='';
    top=parseFloat(getComputedStyle(pin).top)||0;
    headerHeight=parseFloat(getComputedStyle(main).getPropertyValue('--site-header-height'))||82;
    adjustRailEntry=getComputedStyle(strip).getPropertyValue('--rail-entry-inset').trim()==='1';
    viewportWidth=pin.clientWidth;
    travel=Math.max(0,track.scrollWidth-viewportWidth);
    cardGeometry=cards.map(card=>({left:card.offsetLeft,width:card.offsetWidth,reveal:-1}));
    lastX=-1;
    strip.style.setProperty('--travel',travel+'px');
    const panelHeight=pin.offsetHeight;
    railLength=Math.max(1,strip.offsetHeight-panelHeight);
    if(nativeRail)strip.style.setProperty('--rail-panel',panelHeight+'px');
    schedule();
  }
  strip.addEventListener('focusin',event=>{
    const card=(event.target as Element).closest<HTMLElement>('.eu-collection-card');
    if(!card || !card.matches(':focus-visible'))return;
    const pos=card.getBoundingClientRect();
    const section=strip.getBoundingClientRect();
    if(pos.left>=0 && pos.right<=pin.clientWidth && pos.top>=section.top && pos.bottom<=section.bottom)return;
    const destination=scrollY+strip.getBoundingClientRect().top-top;
    const reveal=Math.max(0,Math.min(travel,card.offsetLeft-pin.clientWidth*.15));
    window.scrollTo({top:destination+(travel ? mapRailPhase(reveal/travel,true)*railLength : 0),behavior:'instant'});
  },{signal});

  main.addEventListener('focusin',event=>{
    const link=event.target;
    if(!(link instanceof HTMLAnchorElement) || !link.matches(':focus-visible'))return;
    const chapter=link.closest('.eu-material,.eu-closing');
    if(!chapter)return;
    const edge=chapter.getBoundingClientRect(), box=link.getBoundingClientRect();
    if(box.top<edge.top || box.bottom>edge.bottom) {
      window.scrollTo({top:scrollY+edge.top,behavior:'instant'});
    }
  },{signal});

  social.dataset.entering='';
  const resize=new ResizeObserver(measure);
  resize.observe(pin);
  resize.observe(track);
  measure();
  document.fonts.ready.then(measure);
  window.addEventListener('scroll',schedule,{passive:true,signal});
  document.addEventListener('visibilitychange',schedule,{signal});
  return ()=>{
    controller.abort();
    chapterEntries.disconnect();
    entrances.forEach(animation=>animation.cancel());
    resize.disconnect();
    cancelAnimationFrame(raf);
    delete social.dataset.entering;
    strip.removeAttribute('data-pinned');
    strip.removeAttribute('data-native-rail');
    strip.style.removeProperty('--travel');
    strip.style.removeProperty('--rail-panel');
    strip.style.removeProperty('--rail-easing');
    strip.style.removeProperty('--rail');
    strip.style.removeProperty('--rail-headroom');
    track.style.removeProperty('transform');
    cards.forEach(card=>{
      card.removeAttribute('data-slide-in-view');
      card.removeAttribute('data-revealing');
      card.removeAttribute('style');
    });
    social.style.removeProperty('--entry-opacity');
    social.style.removeProperty('--entry-offset');
    counters.forEach(counter=>counter.textContent=format.format(Number(counter.dataset.total)));
  };
}
