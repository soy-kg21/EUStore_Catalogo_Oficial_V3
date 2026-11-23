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

function animatePiece(piece:HTMLElement, fine:boolean, signal:AbortSignal){
  const title=piece.querySelector('h3'), link=title?.closest('a');
  if(!title||!link)return;
  const name=title.textContent ?? '';
  const originalLabel=link.getAttribute('aria-label');
  link.setAttribute('aria-label',name);
  let frame=0;
  function scramble(){
    cancelAnimationFrame(frame);
    const start=performance.now(),letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    function step(now:number){
      const p=clamp((now-start)/620);
      title!.textContent=Array.from(name,(c,i)=> i<name.length*p||c===' ' ? c : letters[Math.floor(Math.random()*letters.length)]).join('');
      if(p<1)frame=requestAnimationFrame(step);
    }
    frame=requestAnimationFrame(step);
  }
  function reset(){cancelAnimationFrame(frame);title!.textContent=name;piece.removeAttribute('data-tilt');piece.style.removeProperty('--rx');piece.style.removeProperty('--ry');}
  piece.addEventListener('focusin',scramble,{signal});
  piece.addEventListener('focusout',reset,{signal});
  if(fine){
    piece.addEventListener('pointerenter',scramble,{signal});
    piece.addEventListener('pointerleave',reset,{signal});
    piece.addEventListener('pointermove',e=>{
      const b=piece.getBoundingClientRect(),x=(e.clientX-b.left)/b.width,y=(e.clientY-b.top)/b.height;
      piece.dataset.tilt='';
      piece.style.setProperty('--rx',((.5-y)*28)+'deg');piece.style.setProperty('--ry',((x-.5)*36)+'deg');
      piece.style.setProperty('--spot-x',(x*100)+'%');piece.style.setProperty('--spot-y',(y*100)+'%');
    },{passive:true,signal});
  }
  signal.addEventListener('abort',()=>{reset();if(originalLabel===null)link.removeAttribute('aria-label');else link.setAttribute('aria-label',originalLabel);},{once:true});
}

export function startStory(main:HTMLElement,reduced:boolean,fine:boolean){
  const strip=main.querySelector<HTMLElement>('.eu-collection')!;
  const track=strip.querySelector<HTMLElement>('.eu-collection-track')!;
  const pin=strip.querySelector<HTMLElement>('.eu-collection-pin')!;
  const cards=[...strip.querySelectorAll<HTMLElement>('.eu-collection-card')];
  const stats=main.querySelector<HTMLElement>('.eu-stats')!;
  const counters=[...stats.querySelectorAll<HTMLElement>('[data-total]')];
  const pieces=[...main.querySelectorAll<HTMLElement>('.eu-piece')];
  if(reduced){counters.forEach(n=>n.textContent=format.format(Number(n.dataset.total)));return ()=>{};}
  const controller=new AbortController(),{signal}=controller;
  if(fine)cursorRing(signal);
  pieces.forEach(piece=>animatePiece(piece,fine,signal));
  let travel=0,top=0,raf=0;
  let offsets:number[]=[];
  function paint(){
    raf=0;if(document.hidden)return;
    const rect=strip.getBoundingClientRect(),width=pin.clientWidth;
    const x=clamp((top-rect.top)/Math.max(1,travel))*travel;
    track.style.transform='translate3d('+(-x)+'px,0,0)';
    strip.style.setProperty('--rail',String(travel ? x/travel : 1));
    cards.forEach((card,i)=>{
      const e=ease((width-(offsets[i]-x))/(width*.5));
      card.style.setProperty('--cut',((1-e)*100)+'%');card.style.setProperty('--blur',((1-e)*14)+'px');
      card.style.setProperty('--zoom',String(1.25-.25*e));card.style.setProperty('--brightness',String(.55+.45*e));
    });
    const counted=ease((innerHeight*.9-stats.getBoundingClientRect().top)/(innerHeight*.6));
    counters.forEach(n=>{const value=format.format(Math.round(Number(n.dataset.total)*counted));if(n.textContent!==value)n.textContent=value;});
    if(!fine)pieces.forEach(piece=>{
      const r=piece.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
      const p=clamp((r.top+r.height*.5)/innerHeight)-.5;
      piece.style.setProperty('--rx',(-p*10)+'deg');piece.style.setProperty('--ry',(p*5)+'deg');
    });
  }
  function schedule(){if(!raf&&!document.hidden)raf=requestAnimationFrame(paint);}
  function measure(){
    if(signal.aborted)return;
    strip.dataset.pinned='';
    top=parseFloat(getComputedStyle(pin).top)||0;
    travel=Math.max(0,track.scrollWidth-pin.clientWidth);
    offsets=cards.map(card=>card.offsetLeft);
    strip.style.setProperty('--travel',travel+'px');schedule();
  }
  strip.addEventListener('focusin',event=>{
    const card=(event.target as Element).closest<HTMLElement>('.eu-collection-card');
    if(!card||!card.matches(':focus-visible'))return;
    const pos=card.getBoundingClientRect();
    if(pos.left>=0&&pos.right<=pin.clientWidth)return;
    window.scrollTo({top:scrollY+strip.getBoundingClientRect().top-top+Math.min(travel,card.offsetLeft-pin.clientWidth*.15),behavior:'instant'});
  },{signal});
  const resize=new ResizeObserver(measure);resize.observe(pin);resize.observe(track);
  measure();document.fonts.ready.then(measure);
  window.addEventListener('scroll',schedule,{passive:true,signal});
  document.addEventListener('visibilitychange',schedule,{signal});
  return ()=>{
    controller.abort();resize.disconnect();cancelAnimationFrame(raf);
    delete strip.dataset.pinned;track.style.removeProperty('transform');
    cards.forEach(card=>card.removeAttribute('style'));
    pieces.forEach(piece=>{piece.style.removeProperty('--rx');piece.style.removeProperty('--ry');});
    counters.forEach(n=>n.textContent=format.format(Number(n.dataset.total)));
  };
}
