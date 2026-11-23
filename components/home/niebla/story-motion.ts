import {watchFeaturedPiece} from './featured-motion';

const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>1-(1-clamp(n))**3;
const format=new Intl.NumberFormat('es-CO');

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
  if(fine) cursorRing(signal);
  const pieces=[...pieceSection.querySelectorAll<HTMLElement>('.eu-piece')].map(piece=>({
    piece, motion:watchFeaturedPiece(piece,fine,signal),
  }));
  let travel=0, railRate=1, top=0, raf=0, lastX=-1, lastScroll=window.scrollY;
  let collectionWasVisible=false, piecesWereVisible=false;
  let cardGeometry:{left:number;width:number}[]=[];

  function paint() {
    raf=0;
    const currentScroll=window.scrollY;
    const direction=Math.sign(currentScroll-lastScroll);
    lastScroll=currentScroll;
    const bottom=innerHeight;
    const collection=strip.getBoundingClientRect();
    const collectionVisible=collection.top<bottom && collection.bottom>top;
    if(collectionVisible) {
      const width=pin.clientWidth;
      const x=Math.max(0,Math.min(travel,(top-collection.top)*railRate));
      if(x!==lastX || !collectionWasVisible) {
        lastX=x;
        track.style.transform='translate3d('+(-x)+'px,0,0)';
        strip.style.setProperty('--rail',String(travel ? x/travel : 1));
        cards.forEach((card,index)=>{
          const {left,width:cardWidth}=cardGeometry[index];
          const start=left-x;
          const progress=ease((width-start)/(width*.4));
          card.toggleAttribute('data-slide-in-view',start<width && start+cardWidth>0);
          card.style.setProperty('--cut',((1-progress)*100)+'%');
          card.style.setProperty('--blur',((1-progress)*14)+'px');
          card.style.setProperty('--zoom',String(1.25-.25*progress));
          card.style.setProperty('--brightness',String(.55+.45*progress));
        });
      }
    } else if(collectionWasVisible) {
      cards.forEach(card=>card.removeAttribute('data-slide-in-view'));
    }
    collectionWasVisible=collectionVisible;

    const statsTop=stats.getBoundingClientRect().top;
    if(statsTop<bottom) {
      const counted=ease((bottom*.9-statsTop)/(bottom*.6));
      counters.forEach(counter=>{
        const value=format.format(Math.round(Number(counter.dataset.total)*counted));
        if(counter.textContent!==value)counter.textContent=value;
      });
    }

    const pieceBounds=pieceSection.getBoundingClientRect();
    const piecesVisible=pieceBounds.top<bottom && pieceBounds.bottom>top;
    if(piecesVisible) {
      const bounds=pieces.map(({piece})=>piece.getBoundingClientRect());
      pieces.forEach(({motion},index)=>motion.update(bounds[index],top,bottom,direction));
    } else if(piecesWereVisible) {
      pieces.forEach(({motion})=>motion.suspend());
    }
    piecesWereVisible=piecesVisible;

    const socialTop=social.getBoundingClientRect().top;
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
    railRate=pin.clientWidth<=820 ? 1.19 : 1;
    travel=Math.max(0,track.scrollWidth-pin.clientWidth);
    cardGeometry=cards.map(card=>({left:card.offsetLeft,width:card.offsetWidth}));
    lastX=-1;
    strip.style.setProperty('--travel',(travel/railRate)+'px');
    schedule();
  }
  strip.addEventListener('focusin',event=>{
    const card=(event.target as Element).closest<HTMLElement>('.eu-collection-card');
    if(!card || !card.matches(':focus-visible'))return;
    const pos=card.getBoundingClientRect();
    if(pos.left>=0 && pos.right<=pin.clientWidth)return;
    const destination=scrollY+strip.getBoundingClientRect().top-top;
    const reveal=Math.max(0,Math.min(travel,card.offsetLeft-pin.clientWidth*.15));
    window.scrollTo({top:destination+reveal/railRate,behavior:'instant'});
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
    resize.disconnect();
    cancelAnimationFrame(raf);
    delete social.dataset.entering;
    strip.removeAttribute('data-pinned');
    strip.style.removeProperty('--travel');
    strip.style.removeProperty('--rail');
    track.style.removeProperty('transform');
    cards.forEach(card=>{
      card.removeAttribute('data-slide-in-view');
      card.removeAttribute('style');
    });
    social.style.removeProperty('--entry-opacity');
    social.style.removeProperty('--entry-offset');
    counters.forEach(counter=>counter.textContent=format.format(Number(counter.dataset.total)));
  };
}
