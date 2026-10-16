'use client';
export function trackAnimeEvent(name:string,detail:Record<string,unknown>={}){
 try{const campaign:Record<string,string>={};for(const [key,value] of new URLSearchParams(window.location.search))if(key.startsWith('utm_')||key==='fbclid')campaign[key]=value.slice(0,300);
 const saved=sessionStorage.getItem('eu-anime-campaign-v1');if(Object.keys(campaign).length)sessionStorage.setItem('eu-anime-campaign-v1',JSON.stringify(campaign));
 window.dispatchEvent(new CustomEvent('eu-anime-event',{detail:{event:name,...detail,campaign:Object.keys(campaign).length?campaign:saved?JSON.parse(saved):{},path:window.location.pathname}}));}catch{}
}
export function animeAbsoluteUrl(path:string){return new URL(path,window.location.origin).href;}
