import {cinemaFrame} from './anime-cinema';
const particles=Array.from({length:75},(_,i)=>({a:i*2.39996323,r:.14+((i*43)%101)/150,z:((i*31)%97)/97,lime:i%3===0}));
export function createCinemaEffects(canvas:HTMLCanvasElement){
 const ctx=canvas.getContext('2d');let cw=0,ch=0;
 return (p:number,w:number,h:number,mobile:boolean,px:number,py:number)=>{
  if(!ctx)return;const dpr=Math.min(window.devicePixelRatio||1,1.6,Math.sqrt(4000000/Math.max(1,w*h))),nw=Math.round(w*dpr),nh=Math.round(h*dpr);
  if(cw!==nw||ch!==nh){cw=nw;ch=nh;canvas.width=cw;canvas.height=ch;}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  const {energy,bloom}=cinemaFrame(p),travel=p*8,cx=w*(mobile?.61:.67)+px*9,cy=h*(mobile?.4:.43)+py*2,radius=Math.min(w,h)*(.14+energy*.23);
  ctx.save();ctx.globalCompositeOperation='screen';
  for(let i=0;i<3;i++){const rr=radius*(.7+i*.38);ctx.save();ctx.translate(cx,cy);ctx.rotate(p*(2+i)+i*.8);ctx.scale(1,.28+energy*.25);ctx.beginPath();ctx.ellipse(0,0,rr,rr,0,p*3.1+i*.7,p*3.1+i*.7+Math.PI*1.25);ctx.strokeStyle=i===1?`rgba(204,255,0,${.17+energy*.25})`:`rgba(151,127,255,${.08+energy*.22})`;ctx.lineWidth=i===1?1:1.5;ctx.stroke();ctx.restore();}
  particles.forEach((s,i)=>{const a=s.a+travel*(.15+s.z*.15),r=radius*(s.r+.3),x=cx+Math.cos(a)*r*(1+s.z)+px*s.z*13,y=cy+Math.sin(a)*r*.65+(s.z-.5)*h*.5-p*h*.2,alpha=(.12+energy*.5)*(s.z*.5+.5);ctx.fillStyle=s.lime?`rgba(204,255,0,${alpha})`:`rgba(172,174,255,${alpha})`;if(i%5===0){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillRect(-1,-1,2+s.z*2,2+s.z*2);ctx.restore();}else{ctx.beginPath();ctx.arc(x,y,.65+s.z*1.3,0,Math.PI*2);ctx.fill();}});
  if(bloom>0){const g=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*.72);g.addColorStop(0,`rgba(185,162,255,${bloom*.3})`);g.addColorStop(.2,`rgba(204,255,0,${bloom*.08})`);g.addColorStop(1,'rgba(70,20,160,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}ctx.restore();
 };
}
