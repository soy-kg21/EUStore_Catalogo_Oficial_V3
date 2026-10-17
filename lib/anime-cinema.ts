/** The approved Gojo prototype's single, reversible composition timeline. */
// Pause only at stable compositions, never halfway through a camera dissolve.
export const CINEMA_STOPS=[0,.39,.62,1] as const;
export const CINEMA_SECONDS=23;
export const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const smooth=(a:number,b:number,x:number)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const bell=(a:number,b:number,c:number,d:number,p:number)=>smooth(a,b,p)*(1-smooth(c,d,p));
export function cinemaFrame(progress:number){
 const p=clamp(progress),a=smooth(.18,.29,p),b=smooth(.4,.51,p),c=smooth(.66,.79,p);
 return {p,weights:[1-a,a*(1-b),b*(1-c),c],local:[smooth(0,.26,p),smooth(.2,.5,p),smooth(.42,.76,p),smooth(.68,1,p)],exit:smooth(.065,.29,p),brand:1-smooth(.18,.29,p),copy:1-smooth(.12,.27,p),labelA:1-smooth(.21,.35,p),labelB:1-smooth(.18,.33,p),selection:1-smooth(.25,.39,p),awake:bell(.23,.31,.39,.47,p),power:bell(.43,.52,.62,.7,p),collection:smooth(.74,.86,p),discover:smooth(.79,.93,p),finish:smooth(.78,1,p),energy:bell(.26,.44,.69,.91,p),bloom:bell(.52,.65,.68,.82,p),caption:p<.23?'ENTRA EN TU UNIVERSO':p<.44?'DESPIERTA TU ESTILO':p<.66?'EL PODER DE ELEGIR':p<.81?'ABRE TU UNIVERSO':'TU PRÓXIMA FAVORITA EMPIEZA AQUÍ'};
}
/** Automatic playback has a 23-second full journey, independent of input bursts. */
export function createCinemaPlayback(initial=0){
 let position=clamp(initial),target=position;
 return {
  get position(){return position;},get target(){return target;},
  seek(value:number){position=target=clamp(value);},
  request(direction:number,all=false){
   if(direction>0)target=all?1:(CINEMA_STOPS.find(stop=>stop>Math.max(position,target)+.0001)??1);
   else target=all?0:([...CINEMA_STOPS].reverse().find(stop=>stop<Math.min(position,target)-.0001)??0);
  },
  advance(seconds:number){const step=Math.max(0,seconds)/CINEMA_SECONDS;position+=Math.sign(target-position)*Math.min(Math.abs(target-position),step);position=clamp(position);if(Math.abs(target-position)<.000001)position=target;return position;},
  get moving(){return Math.abs(target-position)>.000001;}
 };
}
export function cinemaGeometry({width,viewport,header,commerceTop,commerceHeight,panelHeight,rootTop,scale=1,phoneDesktop=false}:{width:number;viewport:number;header:number;commerceTop:number;commerceHeight:number;panelHeight:number;rootTop:number;scale?:number;phoneDesktop?:boolean}){
 const mobile=width<=700,available=Math.max(280*scale,viewport-header),base=mobile?Math.max(760*scale,commerceTop+commerceHeight+65*scale):Math.max(640*scale,phoneDesktop?available:Math.min(900*scale,available));
 const lead=Math.max(0,base-available),collapsed=Math.min((mobile?310:285)*scale,Math.max(160*scale,available-panelHeight));
 const distance=Math.max(mobile?5300:4800,viewport*(mobile?7:6.5));
 return {mobile,scale,available,base,lead,collapsed,distance,start:rootTop-header+lead,end:rootTop-header+lead+distance,height:lead+distance+collapsed+panelHeight};
}
export function cinemaPageProgress(scroll:number,max:number,start:number,end:number,rendered?:number){
 if(end<=start||max<=end)return max>0?clamp(scroll/max):0;
 if(scroll<=end)return .16*(rendered===undefined?clamp((scroll-start)/(end-start)):clamp(rendered));
 return .16+.84*clamp((scroll-end)/(max-end));
}
