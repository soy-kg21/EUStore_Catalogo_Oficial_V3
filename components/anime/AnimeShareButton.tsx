'use client';
import {useState} from 'react';
import {Check,Share2} from 'lucide-react';
import styles from './shop-premium.module.css';
export default function AnimeShareButton({name,path}:{name:string;path:string}){
 const [status,setStatus]=useState(''),[busy,setBusy]=useState(false);
 async function share(){
  const url=new URL(path,window.location.origin).href;setBusy(true);setStatus('');
  try{
   if(navigator.share){await navigator.share({title:`${name} | Evolución Urbana`,text:`Mira esta camiseta: ${name}`,url});setStatus('Enlace compartido.');}
   else if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(url);setStatus('Enlace copiado. Puedes pegarlo en tu conversación.');}
   else setStatus(`Copia este enlace: ${url}`);
  }catch(error){if(!(error instanceof DOMException&&error.name==='AbortError'))setStatus(`Copia este enlace: ${url}`);}
  finally{setBusy(false);}
 }
 return <div className={styles.shareRow}><button type="button" onClick={share} disabled={busy} className={styles.shareButton}>{status.startsWith('Enlace')?<Check size={16}/>:<Share2 size={16}/>} Compartir camiseta</button><span className={styles.shareStatus} role="status">{status}</span></div>;
}
