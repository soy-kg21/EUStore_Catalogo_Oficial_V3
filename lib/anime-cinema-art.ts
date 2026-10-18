/** Approved artwork only. Scroll distances, titles and product selection live elsewhere. */
const portrait=(file:string,edition:string,center=.71)=>({
 src:`/anime/cinema/${file}.webp`,edition,format:'portrait' as const,center,focusMobile:.70,focusDesktop:.72,
});
export const cinemaArtwork={
 gojo:{src:'/anime/cinema/gojo-atlas.webp',edition:'ANIME SHOP / GOJO SATORU',format:'atlas' as const},
 naruto:{src:'/anime/cinema/naruto-cinema.webp',edition:'ANIME SHOP / NARUTO',format:'anime' as const},
 goku:{src:'/anime/cinema/goku-cinema.webp',edition:'ANIME SHOP / GOKU',format:'anime' as const},
 luffy:{src:'/anime/cinema/luffy-cinema.webp',edition:'ANIME SHOP / LUFFY',format:'anime' as const},
 popeye:portrait('cartoon-popeye','CARTOON / POPEYE'),
 johnny:portrait('cartoon-johnny-bravo','CARTOON / JOHNNY BRAVO'),
 scooby:portrait('cartoon-scooby-doo','CARTOON / SCOOBY-DOO',.73),
 panther:portrait('cartoon-pink-panther','CARTOON / PANTERA ROSA',.72),
 slash:portrait('rock-slash','ROCK / SLASH',.72),
 freddie:portrait('rock-freddie-mercury','ROCK / FREDDIE MERCURY'),
 kurt:portrait('rock-kurt-cobain','ROCK / KURT COBAIN'),
 ozzy:portrait('rock-ozzy-osbourne','ROCK / OZZY OSBOURNE'),
 jordan:portrait('jordan-cinema-v2','URBANAS / MICHAEL JORDAN',.70),
 ghostface:portrait('urbanas-ghostface','URBANAS / GHOSTFACE'),
 canserbero:portrait('urbanas-canserbero','URBANAS / CANSERBERO',.70),
 snoop:portrait('urbanas-snoop-dogg','URBANAS / SNOOP DOGG',.70),
};
export type CinemaArtId=keyof typeof cinemaArtwork;
/** Visible subject bounds in the approved source frame, including hands and props. */
export const cinemaMobileBounds:Record<CinemaArtId,readonly [number,number,number,number]>={
 gojo:[.46,0,1,1],naruto:[.29,0,1,1],goku:[.38,.015,1,1],luffy:[.43,0,1,1],
 popeye:[.60,.015,.88,.98],johnny:[.59,0,.83,.98],scooby:[.60,.025,.89,.98],panther:[.54,.015,.93,.98],
 slash:[.59,.10,.92,1],freddie:[.58,.04,.95,1],kurt:[.51,.015,.90,1],ozzy:[.55,.01,.94,1],
 jordan:[.55,.11,.85,.97],ghostface:[.51,.015,.88,1],canserbero:[.55,.01,.80,1],snoop:[.54,.01,.86,1],
};
/** A soft background edge with an opaque guard around the character and props. */
export const cinemaMobileMasks=Object.fromEntries(Object.entries(cinemaMobileBounds).map(([key,b])=>{
 const id=key as CinemaArtId,center=id==='scooby'?.81:id==='naruto'||id==='luffy'?.74:.71;
 const radius=id==='naruto'?.27:id==='luffy'?.18:id==='gojo'?.13:.11;
 const headLeft=Math.max(b[0],center-radius),headRight=id==='ozzy'?b[2]:Math.min(b[2],center+radius);
 const shoulder=Math.min(b[3],b[1]+.32),bottomLeft=id==='luffy'?.55:b[0],bottomRight=id==='luffy'?.88:b[2];
 const points=[[headLeft,b[1]],[headRight,b[1]],[b[2],shoulder],[b[2],b[3]-.15],[bottomRight,b[3]],[bottomLeft,b[3]],[b[0],b[3]-.15],[b[0],shoulder]].map(([x,y])=>`${x*1000},${y*500}`).join(' ');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500"><defs><linearGradient id="v" x2="0" y2="1"><stop stop-color="white" stop-opacity="0"/><stop offset=".14" stop-color="white"/><stop offset=".86" stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient><linearGradient id="h"><stop stop-color="white" stop-opacity="0"/><stop offset=".12" stop-color="white"/><stop offset=".88" stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient><mask id="edge"><rect width="1000" height="500" fill="url(#h)"/></mask><filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter></defs><rect width="1000" height="500" fill="url(#v)" mask="url(#edge)"/><polygon points="${points}" fill="white" stroke="white" stroke-width="24" stroke-linejoin="round" filter="url(#soft)"/><polygon points="${points}" fill="white"/></svg>`;
 return [id,`url("data:image/svg+xml,${encodeURIComponent(svg)}")`];
})) as Record<CinemaArtId,string>;
/** Fit the subject, rather than the empty landscape, inside the visible mobile stage.
 * Includes the scroll camera's zoom/rotation and room for the existing ambient motion.
 * Desktop cameras and the scroll timeline do not use this function. */
export function mobileCinemaCamera(id:CinemaArtId,{width,top,bottom,maxWidth,scale,rotation,px=0,py=0}:{width:number;top:number;bottom:number;maxWidth:number;scale:number;rotation:number;px?:number;py?:number}){
 const bounds=cinemaMobileBounds[id],ambient=cinemaArtwork[id].format==='portrait'?1.02:1;
 const angle=rotation*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
 const points=[1,ambient].flatMap(breath=>[bounds[0],bounds[2]].flatMap(u=>[bounds[1],bounds[3]].map(v=>{
  const x=.70+(u-.70)*breath-.60,y=(.42+(v-.42)*breath-.42)/2;
  return {x:.60+scale*(x*c-y*s),y:.21+scale*(x*s+y*c)};
 })));
 const left=Math.min(...points.map(p=>p.x)),right=Math.max(...points.map(p=>p.x)),upper=Math.min(...points.map(p=>p.y)),lower=Math.max(...points.map(p=>p.y));
 const inset=Math.min(24,Math.max(12,width*.045)),motionRoom=8;
 const start=top+Math.min(28,Math.max(12,(bottom-top)*.045)),end=Math.max(start+1,bottom-26);
 const imageWidth=Math.max(1,Math.min(maxWidth,(width-inset*2-motionRoom*2)/(right-left),(end-start-motionRoom*2)/(lower-upper)));
 const minX=inset+motionRoom-left*imageWidth,maxX=width-inset-motionRoom-right*imageWidth;
 const minY=start+motionRoom-upper*imageWidth,maxY=end-motionRoom-lower*imageWidth;
 const x=Math.max(minX,Math.min(maxX,width*.70-(left+right)*imageWidth/2+px*8));
 const y=Math.max(minY,Math.min(maxY,minY+(maxY-minY)*.10+py*3));
 return {width:imageWidth,height:imageWidth/2,x,y};
}
type Sequence=readonly [CinemaArtId,CinemaArtId,CinemaArtId,CinemaArtId];
export const cinemaSequences:Record<'anime'|'cartoon'|'rock'|'urbanos'|'shop',Sequence>={
 anime:['gojo','naruto','goku','luffy'],
 cartoon:['popeye','johnny','scooby','panther'],
 rock:['slash','freddie','kurt','ozzy'],
 urbanos:['jordan','ghostface','canserbero','snoop'],
 shop:['gojo','popeye','slash','jordan'],
};
export function cinemaArtForLine(line:string){
 const key=line==='anime'||line==='cartoon'||line==='rock'||line==='urbanos'?line:'shop';
 return cinemaSequences[key].map(id=>({id,...cinemaArtwork[id]}));
}
