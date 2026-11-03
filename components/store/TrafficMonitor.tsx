'use client';
import {useEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';
export default function TrafficMonitor(){
 const pathname=usePathname();
 const lastViewedPath=useRef<string|null>(null);
 useEffect(()=>{
  if(navigator.doNotTrack==='1'||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl)return;
  let session:string;try{session=sessionStorage.getItem('eu-traffic-session')||crypto.randomUUID();sessionStorage.setItem('eu-traffic-session',session);}catch{return;}
  let campaign='';try{const current=new URLSearchParams(location.search).get('utm_campaign');if(current&&/^[a-zA-Z0-9 _.-]{1,80}$/.test(current))sessionStorage.setItem('eu-traffic-campaign',current);campaign=sessionStorage.getItem('eu-traffic-campaign')||'';}catch{}
  let referrer='';try{referrer=new URL(document.referrer).origin;}catch{}
  let stopped=false,lastContact=0;
  const send=(kind:'view'|'heartbeat'|'whatsapp')=>{
   if(stopped||document.visibilityState!=='visible')return false;
   const path=location.pathname;
   // No query strings, WhatsApp message, customer data, IP, or persistent visitor cookie.
   void fetch('/api/traffic',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',keepalive:true,body:JSON.stringify({session,event:crypto.randomUUID(),kind,path,referrer,campaign})}).then(r=>{if(!r.ok)stopped=true;}).catch(()=>{stopped=true;});
   if(kind==='view')lastViewedPath.current=path;
   return true;
  };
  const visit=()=>{
   if(lastViewedPath.current===location.pathname)return false;
   stopped=false;
   return send('view');
  };
  visit();
  const heartbeat=()=>{if(!visit())send('heartbeat');},timer=window.setInterval(heartbeat,45000);
  const contact=(event:MouseEvent)=>{const a=event.target instanceof Element?event.target.closest('a[href]'):null;if(!a)return;try{const u=new URL(a.getAttribute('href')||'',location.origin);if(['wa.me','api.whatsapp.com','web.whatsapp.com'].includes(u.hostname)&&Date.now()-lastContact>1000){lastContact=Date.now();send('whatsapp');}}catch{}};
  document.addEventListener('click',contact,{capture:true});document.addEventListener('visibilitychange',heartbeat);
  window.addEventListener('eu-anime-filters',visit);window.addEventListener('popstate',visit);window.addEventListener('pageshow',visit);
  return()=>{clearInterval(timer);document.removeEventListener('click',contact,{capture:true});document.removeEventListener('visibilitychange',heartbeat);window.removeEventListener('eu-anime-filters',visit);window.removeEventListener('popstate',visit);window.removeEventListener('pageshow',visit);};
 },[pathname]);
 return null;
}
