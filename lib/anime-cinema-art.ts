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
/** Cinematic focal points in the approved source frames. */
export const cinemaPortraitFocus:Partial<Record<CinemaArtId,number>>={popeye:.75,johnny:.71,scooby:.815,panther:.66,slash:.71,freddie:.75,kurt:.70,ozzy:.67,jordan:.69,ghostface:.72,canserbero:.70,snoop:.70};
export function portraitCinemaCamera(id:CinemaArtId,{width,height,mobile,scale,rotation,px=0,py=0,local=0,closing=0}:{width:number;height:number;mobile:boolean;scale:number;rotation:number;px?:number;py?:number;local?:number;closing?:number}){
 const b=cinemaMobileBounds[id],angle=rotation*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
 const project=(u:number,v:number)=>{const x=u-.60,y=(v-.42)/2;return{x:.60+scale*(x*c-y*s),y:.21+scale*(x*s+y*c)}};
 // Cover the stage instead of fitting the entire body into a floating landscape.
 // At the closing pose keep enough scale for a readable face above categories.
 const sceneHeight=height+(mobile?width*.42*closing:0);
 const tl=project(0,0),tr=project(1,0),bl=project(0,1),br=project(1,1);
 // Cover every corner, including rotation and the small breathing movement.
 const left=Math.max(tl.x,bl.x),right=Math.min(tr.x,br.x),top=Math.max(tl.y,tr.y),bottom=Math.min(bl.y,br.y);
 const imageWidth=Math.max((width+16)/(right-left),(height+16)/(bottom-top),sceneHeight*2/(1-b[1]))*(1+.015*local);
 const head=project(cinemaPortraitFocus[id]||.72,b[1]),headCenter=project(cinemaPortraitFocus[id]||.72,b[1]+.08);
 const minX=width+8-right*imageWidth,maxX=-8-left*imageWidth;
 const half=id==='scooby'?.06:id==='panther'?.045:.035;
 const faceRight=Math.max(...[b[1],b[1]+.18].map(v=>project((cinemaPortraitFocus[id]||.72)+half,v).x));
 const x=Math.max(minX,Math.min(maxX,width-16-faceRight*imageWidth,width*(mobile?.79:.74)-headCenter.x*imageWidth+px*6));
 const y=Math.max(height+8-bottom*imageWidth,Math.min(24-head.y*imageWidth+py*2,-4-top*imageWidth));
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
