'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
export default function TrafficMonitor(){
 const pathname=usePathname();
 useEffect(()=>{
  if(navigator.doNotTrack==='1'||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl)return;
  let session:string;try{session=sessionStorage.getItem('eu-traffic-session')||crypto.randomUUID();sessionStorage.setItem('eu-traffic-session',session);}catch{return;}
  let campaign='';try{const current=new URLSearchParams(location.search).get('utm_campaign');if(current&&/^[a-zA-Z0-9 _.-]{1,80}$/.test(current))sessionStorage.setItem('eu-traffic-campaign',current);campaign=sessionStorage.getItem('eu-traffic-campaign')||'';}catch{}
  let referrer='';try{referrer=new URL(document.referrer).origin;}catch{}
  let stopped=false,lastContact=0;
  const send=(kind:'view'|'heartbeat'|'whatsapp')=>{
   if(stopped||document.visibilityState!=='visible')return;
   // No query strings, WhatsApp message, customer data, IP, or persistent visitor cookie.
   void fetch('/api/traffic',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',keepalive:true,body:JSON.stringify({session,event:crypto.randomUUID(),kind,path:pathname,referrer,campaign})}).then(r=>{if(!r.ok)stopped=true;}).catch(()=>{stopped=true;});
  };
  send('view');
  const heartbeat=()=>send('heartbeat'),timer=window.setInterval(heartbeat,45000);
  const contact=(event:MouseEvent)=>{const a=event.target instanceof Element?event.target.closest('a[href]'):null;if(!a)return;try{const u=new URL(a.getAttribute('href')||'',location.origin);if(['wa.me','api.whatsapp.com','web.whatsapp.com'].includes(u.hostname)&&Date.now()-lastContact>1000){lastContact=Date.now();send('whatsapp');}}catch{}};
  document.addEventListener('click',contact,{capture:true});document.addEventListener('visibilitychange',heartbeat);
  return()=>{clearInterval(timer);document.removeEventListener('click',contact,{capture:true});document.removeEventListener('visibilitychange',heartbeat);};
 },[pathname]);
 return null;
}
