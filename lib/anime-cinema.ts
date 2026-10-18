/** One reversible composition, driven exclusively by native scroll position. */
export const CINEMA_SCROLL_RESISTANCE=1.08*1.13;
export const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const smooth=(a:number,b:number,x:number)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const bell=(a:number,b:number,c:number,d:number,p:number)=>smooth(a,b,p)*(1-smooth(c,d,p));
export function cinemaFrame(progress:number){
 const p=clamp(progress),a=smooth(.18,.29,p),b=smooth(.4,.51,p),c=smooth(.66,.79,p);
 return {p,weights:[1-a,a*(1-b),b*(1-c),c],local:[smooth(0,.26,p),smooth(.2,.5,p),smooth(.42,.76,p),smooth(.68,1,p)],exit:smooth(.065,.29,p),brand:1-smooth(.18,.29,p),copy:1-smooth(.12,.27,p),labelA:1-smooth(.21,.35,p),labelB:1-smooth(.18,.33,p),selection:1-smooth(.25,.39,p),awake:bell(.23,.31,.39,.47,p),power:bell(.43,.52,.62,.7,p),collection:smooth(.74,.86,p),discover:smooth(.79,.93,p),finish:smooth(.78,1,p),energy:bell(.26,.44,.69,.91,p),bloom:bell(.52,.65,.68,.82,p),caption:p<.23?'ENTRA EN TU UNIVERSO':p<.44?'DESPIERTA TU ESTILO':p<.66?'EL PODER DE ELEGIR':p<.81?'ABRE TU UNIVERSO':'TU PRÓXIMA FAVORITA EMPIEZA AQUÍ'};
}
/** No clock, queue or inertia of its own: the page position is the playhead. */
export const cinemaScrollProgress=(scroll:number,start:number,end:number)=>end>start?clamp((scroll-start)/(end-start)):0;
export function cinemaGeometry({width,viewport,header,commerceTop,commerceHeight,panelHeight,rootTop}:{width:number;viewport:number;header:number;commerceTop:number;commerceHeight:number;panelHeight:number;rootTop:number}){
 const mobile=width<=700,available=Math.max(280,viewport-header),base=mobile?Math.max(760,commerceTop+commerceHeight+65):Math.max(640,Math.min(width>=1800?1200:900,available));
 const lead=Math.max(0,base-available),collapsed=mobile?260:width>=1800?340:270;
 // A bounded manual journey: deliberate gestures, without an overlong pinned section.
 const distance=Math.min(3200,Math.max(2400,available*4))*CINEMA_SCROLL_RESISTANCE;
 // A short native scroll interval keeps the finished composition visible as
 // the sticky hero hands off to products; it never consumes or counts gestures.
 const settle=Math.min(72,Math.max(40,available*.06));
 return {mobile,available,base,lead,collapsed,distance,settle,start:rootTop-header+lead,end:rootTop-header+lead+distance,height:lead+distance+settle+Math.min(collapsed+panelHeight,available)};
}
export function cinemaPageProgress(scroll:number,max:number,start:number,end:number,rendered?:number){
 if(end<=start||max<=end)return max>0?clamp(scroll/max):0;
 if(scroll<=end)return .16*(rendered===undefined?clamp((scroll-start)/(end-start)):clamp(rendered));
 return .16+.84*clamp((scroll-end)/(max-end));
}
