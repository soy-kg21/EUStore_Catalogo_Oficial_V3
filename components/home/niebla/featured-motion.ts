const clamp = (value:number) => Math.max(0,Math.min(1,value));
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function watchFeaturedPiece(piece:HTMLElement, fine:boolean, signal:AbortSignal) {
  const card = piece.querySelector<HTMLElement>('.product-card')!;
  const title = card.querySelector<HTMLElement>('h3')!;
  const name = title.textContent ?? '';
  const positions = Array.from(name);
  const scrambled = document.createElement('span');
  scrambled.className = 'eu-scrambled-title';
  scrambled.setAttribute('aria-hidden','true');
  title.appendChild(scrambled);
  let timer = 0;
  let entry:Animation | undefined;
  let visible = false;

  function stopText() {
    window.clearInterval(timer);
    timer = 0;
    scrambled.textContent = '';
    delete title.dataset.scrambling;
  }
  function scramble() {
    if (timer || document.hidden) return;
    const start = performance.now();
    title.dataset.scrambling = '';
    const draw = () => {
      const progress = clamp((performance.now()-start)/490);
      if (progress === 1) {stopText();return;}
      scrambled.textContent = positions.map((char,index)=>
        /[^\p{L}\p{N}]/u.test(char) || index<positions.length*progress ? char : letters[Math.floor(Math.random()*letters.length)]
      ).join('');
    };
    draw();
    timer = window.setInterval(draw,58);
  }
  function tilt(x:number,y:number,isTouch:boolean) {
    piece.dataset.tilt = isTouch ? 'touch' : 'pointer';
    piece.style.setProperty('--rx',((.5-y)*(isTouch ? 16 : 28))+'deg');
    piece.style.setProperty('--ry',((x-.5)*(isTouch ? 14 : 36))+'deg');
    if (!isTouch) {
      piece.style.setProperty('--spot-x',x*100+'%');
      piece.style.setProperty('--spot-y',y*100+'%');
    }
  }
  function resetTilt() {
    delete piece.dataset.tilt;
    for (const property of ['--rx','--ry','--spot-x','--spot-y']) piece.style.removeProperty(property);
  }
  function leave() {
    entry?.cancel();
    stopText();
    resetTilt();
    visible = false;
  }
  piece.addEventListener('focusin',scramble,{signal});
  if (fine) {
    piece.addEventListener('pointerenter',scramble,{signal});
    piece.addEventListener('pointerleave',resetTilt,{signal});
    piece.addEventListener('pointermove',event=>{
      if (event.pointerType==='touch') return;
      const rect=piece.getBoundingClientRect();
      tilt(clamp((event.clientX-rect.left)/rect.width),clamp((event.clientY-rect.top)/rect.height),false);
    },{passive:true,signal});
  }
  signal.addEventListener('abort',()=>{
    leave();
    scrambled.remove();
  },{once:true});

  return {
    suspend:leave,
    update(rect:DOMRect, top:number, bottom:number, direction:number) {
      const inside = rect.top<bottom-9 && rect.bottom>top+9;
      if (!inside) {
        if (visible) leave();
        return;
      }
      if (!visible && direction) {
        visible = true;
        const from = direction>0 ? 23 : -23;
        entry = card.animate(
          [{opacity:.52,transform:'translate3d(0,'+from+'px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],
          {duration:370,easing:'cubic-bezier(.22,.7,.2,1)'},
        );
        scramble();
      }
      if (!fine && direction) {
        const center=clamp((rect.top+rect.height*.5-top)/(bottom-top));
        tilt(.5+((rect.left+rect.width*.5)/innerWidth-.5)*.55,center,true);
      }
    },
  };
}
