import type {AnimeFilters} from './anime-catalog-core';

/** Only explicit in-page links request a scroll. Native Back/Forward stays native. */
export const ANIME_REMEMBER_EVENT='eu-anime-remember-list';
const PREFIX='eu-anime-navigation-v2:';
const MAX_AGE=24*60*60*1000;
export type AnimeListSnapshot={
 version:1;url:string;key:string;count:number;scroll:number;productId?:string;cardTop?:number;
 filterOffset?:number;filterFloor?:number;
 width:number;filterOpen:boolean;gridFilterOpen:boolean;savedAt:number;
};
export type AnimeReturnIntent={mode:'resume'|'categories';url:string;key:string;createdAt:number};
export function animeNavigationKey(filters:AnimeFilters){
 return JSON.stringify({linea:filters.linea,categoria:filters.categoria,q:filters.q,doble:!!filters.doble});
}
export function safeAnimeListUrl(value:unknown):string|null{
 if(typeof value!=='string'||!/^\/(?:shop|anime|cartoon|rock|urbanas|urbanos)(?:\/[a-z0-9-]+)?(?:\?[^#]*)?$/.test(value))return null;
 try{const url=new URL(value,'https://catalog.local');return url.origin==='https://catalog.local'?url.pathname+url.search:null;}catch{return null;}
}
function read(key:string):unknown{try{return JSON.parse(sessionStorage.getItem(PREFIX+key)||'null');}catch{return null;}}
function write(key:string,value:unknown){try{sessionStorage.setItem(PREFIX+key,JSON.stringify(value));}catch{/* Storage can be disabled; normal links remain functional. */}}
function remove(key:string){try{sessionStorage.removeItem(PREFIX+key);}catch{}}
export function parseAnimeSnapshot(value:unknown,now=Date.now()):AnimeListSnapshot|null{
 if(!value||typeof value!=='object')return null;
 const s=value as AnimeListSnapshot;
 if(s.version!==1||!safeAnimeListUrl(s.url)||typeof s.key!=='string'||!Number.isInteger(s.count)||s.count<24||s.count>2000||!Number.isFinite(s.scroll)||s.scroll<0||!Number.isFinite(s.width)||s.width<=0||!Number.isFinite(s.savedAt)||now-s.savedAt>MAX_AGE||s.savedAt>now+60000)return null;
 if(s.productId!==undefined&&!/^EU-ANIME-\d{3,4}$/.test(s.productId))return null;
 if(s.cardTop!==undefined&&!Number.isFinite(s.cardTop))return null;
 if([s.filterOffset,s.filterFloor].some(value=>value!==undefined&&(!Number.isFinite(value)||value<0)))return null;
 return s;
}
export function saveAnimeList(snapshot:AnimeListSnapshot){
 if(!parseAnimeSnapshot(snapshot))return;
 write('list:'+snapshot.key,snapshot);write('latest',snapshot);
}
export function readAnimeList(key?:string){return parseAnimeSnapshot(read(key?'list:'+key:'latest'));}
export function requestAnimeReturn(mode:'resume'|'categories',url:string,key:string){
 const safe=safeAnimeListUrl(url);if(safe)write('return',{mode,url:safe,key,createdAt:Date.now()});
}
export function consumeAnimeReturn(key:string):AnimeReturnIntent|null{
 const value=read('return') as AnimeReturnIntent|null;
 if(!value)return null;
 if(!['resume','categories'].includes(value.mode)||!safeAnimeListUrl(value.url)||!Number.isFinite(value.createdAt)||Date.now()-value.createdAt>60000){remove('return');return null;}
 // A cached collection can briefly observe another route's filters during navigation.
 // Only the intended collection may consume its still-valid return request.
 if(value.key!==key)return null;
 remove('return');
 return value;
}
export function requestAnimeProduct(id:string){write('product',{id,createdAt:Date.now()});}
export function consumeAnimeProduct(id:string){
 const value=read('product') as {id?:string;createdAt?:number}|null;remove('product');
 return value?.id===id&&typeof value.createdAt==='number'&&Date.now()-value.createdAt<60000;
}
/** Anchor positioning survives a changed header or screen width after returning. */
export function animeResumeTarget(snapshot:AnimeListSnapshot,layout:{scroll:number;cardTop?:number;width:number;header:number}){
 if(Number.isFinite(layout.cardTop)){
  const offset=Math.abs(layout.width-snapshot.width)>80?layout.header+20:snapshot.cardTop??layout.header+20;
  return Math.max(0,layout.scroll+layout.cardTop!-offset);
 }
 return snapshot.scroll;
}
