'use client';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import {isAnimeShopPath} from '@/lib/anime-routes';
import Image from 'next/image';
import {productReference} from '@/lib/product-content';
import Link from 'next/link';
import AnimeProductLink from './AnimeProductLink';
import {ArrowUpRight,Check,LoaderCircle,Minus,Plus,ShoppingBag,Trash2,Truck} from 'lucide-react';
import {Sheet,SheetContent,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {useAnimeSelection} from '@/lib/anime-selection';
import {animeSelectionLineKey} from '@/lib/anime-selection-core';
import {animeProductHref} from '@/lib/anime-routes';
import {animeQuote} from '@/lib/anime-commercial';
import type {LiveRule} from '@/lib/live-types';
import {animeSelectionMessage} from '@/lib/anime-message';
import {trackAnimeEvent} from '@/lib/anime-events';
import {ORIGIN,money,wa} from '@/lib/config';
import type {AnimeClientProduct} from '@/lib/anime-catalog-core';
import styles from './shop-premium.module.css';
export default function AnimeComboDrawer(){
 const selection=useAnimeSelection(),[open,setOpen]=useState(false),[products,setProducts]=useState<AnimeClientProduct[]>([]),[loading,setLoading]=useState(false),[error,setError]=useState(false),[attempt,setAttempt]=useState(0);
 const [pricing,setPricing]=useState<LiveRule|null>(null),[confirmed,setConfirmed]=useState<{key:string;quote:ReturnType<typeof animeQuote>}|null>(null),[quoteError,setQuoteError]=useState('');
 const selectionKey=JSON.stringify(selection.rows);
 const path=usePathname();
 useEffect(()=>{const refresh=()=>{setAttempt(n=>n+1);setConfirmed(null);};window.addEventListener('eu-catalog-updated',refresh);window.addEventListener('focus',refresh);return()=>{window.removeEventListener('eu-catalog-updated',refresh);window.removeEventListener('focus',refresh);};},[]);
 const ids=[...new Set(selection.rows.map(row=>row.id))].sort().join(',');
 useEffect(()=>{const show=()=>{setOpen(true);trackAnimeEvent('view_combo');};window.addEventListener('eu-open-anime-combo',show);return ()=>window.removeEventListener('eu-open-anime-combo',show);},[]);
 useEffect(()=>{
  if(!ids)return;const controller=new AbortController();setLoading(true);setError(false);
  fetch(`/api/anime-selection?ids=${encodeURIComponent(ids)}`,{signal:controller.signal}).then(response=>{if(!response.ok)throw new Error();return response.json() as Promise<{items:AnimeClientProduct[];pricing:LiveRule|null}>;}).then(data=>{if(!controller.signal.aborted){setProducts(data.items);setPricing(data.pricing);setLoading(false);}}).catch(err=>{if(err.name!=='AbortError'){setError(true);setLoading(false);}});
  return ()=>controller.abort();
 },[open,ids,attempt]);
 useEffect(()=>{setConfirmed(null);setQuoteError('');if(!selection.rows.length||selection.rows.some(r=>!r.size))return;const controller=new AbortController();fetch('/api/anime-quote',{method:'POST',headers:{'Content-Type':'application/json'},body:selectionKey,signal:controller.signal}).then(async response=>{const data=await response.json() as {quote:ReturnType<typeof animeQuote>;error?:string};if(!response.ok)throw Error(data.error||'No se pudo actualizar el precio.');if(!controller.signal.aborted)setConfirmed({key:selectionKey,quote:data.quote});}).catch(error=>{if(error.name!=='AbortError')setQuoteError(error.message);});return()=>controller.abort();},[selectionKey,attempt]);
 const currentQuote=confirmed?.key===selectionKey?confirmed.quote:null;
 const quote=currentQuote||(selection.count?animeQuote(selection.count,'public',pricing):null),byId=new Map(products.map(product=>[product.id,product]));
 const complete=selection.rows.length>0&&!loading&&!error&&!quoteError&&!!currentQuote&&selection.rows.every(row=>row.size&&byId.has(row.id));
 const message=animeSelectionMessage(selection.rows,products,typeof window==='undefined'?ORIGIN:window.location.origin,currentQuote);
 return <>
  {selection.count>0&&isAnimeShopPath(path)&&<div className={styles.selectionBar}><div><span><Check size={14}/>{selection.count} {selection.count===1?'camiseta elegida':'camisetas elegidas'}</span><strong>{quote?.merchandise===null?'Cotización personalizada':money(quote!.merchandise!)} <small>{quote?.merchandise===null?'':'COP · camisetas'}</small></strong></div><button type="button" onClick={()=>setOpen(true)}>Revisar combo <ArrowUpRight size={18}/></button></div>}
  <Sheet open={open} onOpenChange={setOpen}><SheetContent className={styles.comboDrawer}>
   <div className={styles.comboHeader}><p className={styles.kicker}>Tu selección / Anime Shop</p><SheetTitle>Tu próximo combo.</SheetTitle><SheetDescription>{selection.count?`${selection.count} ${selection.count===1?'camiseta':'camisetas'}. Tú eliges cómo combinarlas.`:'Elige tus diseños favoritos para empezar.'}</SheetDescription></div>
   {!selection.count?<div className={styles.comboEmpty}><ShoppingBag size={40}/><h3>Le falta tu estilo.</h3><p>Explora las colecciones y añade tu primera camiseta.</p><Link href="/shop#coleccion" className={styles.primary} onClick={()=>setOpen(false)}>Elegir diseños <ArrowUpRight size={18}/></Link></div>:<>
    <div className={styles.comboLines} aria-busy={loading}><button type="button" className={styles.generalCartLink} onClick={()=>{setOpen(false);window.dispatchEvent(new Event('eu-open-cart'));}}>Ver mi selección del catálogo general <ArrowUpRight size={15}/></button>
     {loading&&!products.length&&<p className={styles.comboStatus}><LoaderCircle className={styles.spinner} size={18}/> Cargando tu selección…</p>}
     {error&&<div className={styles.comboStatus}><p>No pudimos cargar los diseños.</p><button type="button" onClick={()=>setAttempt(n=>n+1)}>Volver a intentar</button></div>}
     {selection.rows.map(row=>{const product=byId.get(row.id);return <article className={styles.comboLine} key={animeSelectionLineKey(row)}>
      {product?<AnimeProductLink productId={row.id} className={styles.comboPhoto} href={animeProductHref(row.id)} onClick={()=>setOpen(false)}><Image quality={85} src={product.thumbnail} alt={product.name} fill sizes="80px"/></AnimeProductLink>:<div className={styles.comboPhoto}/>}
      <div className={styles.comboLineInfo}><span>{product?productReference(product)||'Referencia por confirmar':row.id}</span><h3>{product?.name||'Cargando diseño…'}</h3><label>Talla <select aria-label={`Talla de ${product?.name||row.id}`} value={row.size||''} onChange={event=>selection.setSize(row.id,row.size,event.target.value)}><option value="" disabled>Elegir</option>{(product?.sizes||[]).map(size=><option key={size} disabled={product?.variants?.find(v=>v.size===size)?.quantity===0}>{size}</option>)}</select></label><div className={styles.comboLineActions}><div className={styles.quantity}><button type="button" aria-label={`Reducir cantidad de ${product?.name||row.id}`} disabled={row.quantity<=1} onClick={()=>selection.setQuantity(row.id,row.size,row.quantity-1)}><Minus size={14}/></button><output>{row.quantity}</output><button type="button" aria-label={`Aumentar cantidad de ${product?.name||row.id}`} disabled={row.quantity>=99} onClick={()=>selection.setQuantity(row.id,row.size,row.quantity+1)}><Plus size={14}/></button></div><button type="button" className={styles.removeLine} aria-label={`Quitar ${product?.name||row.id}, talla ${row.size||'sin elegir'}`} onClick={()=>selection.remove(row.id,row.size)}><Trash2 size={17}/></button></div></div>
     </article>;})}
     <Link href="/shop#coleccion" className={styles.addAnother} onClick={()=>setOpen(false)}><Plus size={16}/> Añadir otro diseño</Link>
    </div>
    <div className={styles.comboSummary}>{quoteError&&<p role="alert">{quoteError}</p>}
     {selection.count===1&&<p className={styles.comboHint}>Añade una segunda camiseta: el combo de 2 cuesta {money(pricing?.retail[1]||93000)}.</p>}
     <div className={styles.comboTotal}><span>Total camisetas</span><strong>{quote?.merchandise===null?'Por cotizar':money(quote!.merchandise!)}<small>{quote?.merchandise===null?'':' COP'}</small></strong></div>
     <p className={styles.shippingNote}><Truck size={17}/>{quote?.shippingPending?'Pago anticipado. Transporte separado por cotizar.':'Envío estándar incluido. Contraentrega sujeta a cobertura.'}</p>
     {complete?<a href={wa(message)} className={styles.primary} target="_blank" rel="noopener noreferrer" onClick={()=>trackAnimeEvent('click_whatsapp',{quantity:selection.count,total:quote?.merchandise,source:'combo'})}>Continuar por WhatsApp <ArrowUpRight size={18}/></a>:<button type="button" className={styles.primary} disabled>{loading?'Cargando selección…':error?'Reintenta cargar tu selección':quoteError?'Revisa las cantidades disponibles':selection.rows.every(r=>r.size)?'Actualizando precios…':'Elige las tallas para continuar'}</button>}
     <p className={styles.comboDisclaimer}>Confirmamos disponibilidad y condiciones antes de cerrar tu pedido. Podrás revisar el mensaje en WhatsApp.</p>
    </div>
   </>}
  </SheetContent></Sheet>
 </>;
}
