'use client';
import Link from 'next/link';
import Image from 'next/image';
import {useDeferredValue,useEffect,useMemo,useRef,useState,type MouseEvent} from 'react';
import {ArrowDown,ArrowUpRight,Check,Home,Layers,Search,SlidersHorizontal,X} from 'lucide-react';
import {animeLines,animeCategorySlug,filterAnimeProducts,type AnimeClientProduct,type AnimeLine} from '@/lib/anime-catalog-core';
import {animeExperience} from '@/lib/anime-experience';
import {animeLinePath} from '@/lib/anime-routes';
import {orderAnimeShopProducts,isDoublePrint} from '@/lib/anime-merchandising';
import {useAnimeSelection} from '@/lib/anime-selection';
import {trackAnimeEvent} from '@/lib/anime-events';
import {useAnimeFilters} from './useAnimeFilters';
import AnimeUniverseHero from './AnimeUniverseHero';
import AnimeProductCard from './AnimeProductCard';
import AnimeQuickView from './AnimeQuickView';
import styles from './shop-premium.module.css';
export default function AnimeShopClient({products,initialSearch,counts,hero}:{products:AnimeClientProduct[];initialSearch:string;counts:Record<AnimeLine,number>;hero:Omit<Parameters<typeof AnimeUniverseHero>[0],'navigation'>}){
 const {filters,update}=useAnimeFilters(initialSearch),selection=useAnimeSelection();
 const [quick,setQuick]=useState<AnimeClientProduct|null>(null),[filterOpen,setFilterOpen]=useState(false),[gridFilterOpen,setGridFilterOpen]=useState(false);
 const deferredQuery=useDeferredValue(filters.q),filterKey=JSON.stringify(filters),[pagination,setPagination]=useState({key:filterKey,count:24});
 const visible=pagination.key===filterKey?pagination.count:24;
 const categories=useMemo(()=>[...new Set(products.filter(product=>!filters.linea||product.line===filters.linea).map(product=>product.category))].sort((a,b)=>a.localeCompare(b,'es')),[products,filters.linea]);
 const restoreOnMount=useRef(true);
 const railDrag=useRef<{pointer:number;x:number;scroll:number;moved:boolean}|null>(null),suppressRailClick=useRef(false);
 useEffect(()=>{const open=()=>setFilterOpen(true);window.addEventListener('eu-open-anime-filters',open);return()=>window.removeEventListener('eu-open-anime-filters',open);},[]);
 const filtered=useMemo(()=>orderAnimeShopProducts(filterAnimeProducts(products,{...filters,q:deferredQuery}).filter(product=>!filters.doble||isDoublePrint(product.id)),filters),[products,filters,deferredQuery]);
 const remember=()=>{try{sessionStorage.setItem('eu-anime-grid:'+filterKey,JSON.stringify({count:visible,scroll:window.scrollY,restore:true}));}catch{}};
 useEffect(()=>{
  if(!restoreOnMount.current)return;restoreOnMount.current=false;
  let frame=0;try{const raw=sessionStorage.getItem('eu-anime-grid:'+filterKey);if(raw){const saved=JSON.parse(raw);if(Number.isInteger(saved.count)&&saved.count>24&&saved.count<=2000)setPagination({key:filterKey,count:saved.count});if(saved.restore&&Number.isFinite(saved.scroll)){sessionStorage.setItem('eu-anime-grid:'+filterKey,JSON.stringify({...saved,restore:false}));frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>window.scrollTo({top:saved.scroll,behavior:'instant'}));});}}}catch{}
  return ()=>cancelAnimationFrame(frame);
 },[filterKey]);
 const items=filtered.slice(0,visible),line=animeLines.find(item=>item.id===filters.linea),experience=animeExperience[line?.id||'shop'];
 const currentCategory=categories.find(category=>animeCategorySlug(category)===filters.categoria);
 const popular=experience.categories.filter(category=>categories.includes(category));
 const chips=popular.length?popular.slice(0,6):categories.slice(0,6);
 const activeCount=Number(!!filters.categoria)+Number(!!filters.doble),reset=()=>update({categoria:'',q:'',doble:false});
 const choose=(product:AnimeClientProduct)=>{setQuick(product);trackAnimeEvent('view_product',{id:product.id,line:product.line,source:'quick_view'});};
 const chooseLine=(id:string)=>{const categoria=products.some(p=>(!id||p.line===id)&&animeCategorySlug(p.category)===filters.categoria)?filters.categoria:'';update({linea:id,categoria});};
 const lineChoices=[{id:'',name:'Todas'},...animeLines];
 const countLine=(id:string)=>id?counts[id as AnimeLine]:Object.values(counts).reduce((a,b)=>a+b,0);
 const changeLine=(id:string,event:MouseEvent<HTMLAnchorElement>)=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();chooseLine(id);};
 useEffect(()=>{trackAnimeEvent('view_collection',{line:filters.linea||'todas'});},[filters.linea]);
 const controls=(suffix:string)=><div className={styles.filterControls}>
  <label className={styles.categoryField} htmlFor={`anime-franchise-${suffix}`}><span>Universo o franquicia</span><select id={`anime-franchise-${suffix}`} value={filters.categoria} onChange={event=>update({categoria:event.target.value})}><option value="">Todas las franquicias</option>{categories.map(category=><option key={category} value={animeCategorySlug(category)}>{category}</option>)}</select></label>
  <label className={styles.doubleFilter}><input type="checkbox" checked={!!filters.doble} onChange={event=>update({doble:event.target.checked})}/><span><Layers size={16}/> Solo doble estampado</span></label>
  {activeCount>0&&<button className={styles.resetFilters} type="button" onClick={reset}>Limpiar filtros <X size={14}/></button>}
 </div>;
 const navigation=<div className={styles.journeyControls}>
  <div className={styles.collectionLead}><div><p className={styles.kicker}>Sigue en tu universo</p><h2>¿QUÉ TE REPRESENTA?</h2></div><button type="button" className={styles.journeyFilterButton} aria-expanded={filterOpen} aria-controls="anime-inline-filters" onClick={()=>setFilterOpen(value=>!value)}><SlidersHorizontal size={17}/> Filtros{activeCount>0&&<b>{activeCount}</b>}</button></div>
  <nav className={styles.lineNav} aria-label="Líneas de Anime Shop" onDragStart={event=>event.preventDefault()} onPointerDown={event=>{if(event.pointerType==='mouse'&&event.button===0){railDrag.current={pointer:event.pointerId,x:event.clientX,scroll:event.currentTarget.scrollLeft,moved:false};suppressRailClick.current=false;}}} onPointerMove={event=>{const drag=railDrag.current;if(!drag||drag.pointer!==event.pointerId)return;const delta=event.clientX-drag.x;if(Math.abs(delta)>8){drag.moved=true;suppressRailClick.current=true;event.currentTarget.setPointerCapture(event.pointerId);}if(drag.moved){event.currentTarget.scrollLeft=drag.scroll-delta;event.preventDefault();}}} onPointerUp={()=>{railDrag.current=null;setTimeout(()=>{suppressRailClick.current=false;},0);}} onPointerCancel={()=>{railDrag.current=null;suppressRailClick.current=false;}} onClickCapture={event=>{if(suppressRailClick.current){event.preventDefault();event.stopPropagation();}}}>{[{id:'',name:'Todas'},...animeLines].map(item=>{
   const id=item.id as AnimeLine,tagline={anime:'Historias que te representan',cartoon:'Personajes de siempre',rock:'Tu música. Tu actitud.',urbanos:'Hechas para la calle'}[id]||'Todos tus universos';
   const count=item.id?counts[id]:Object.values(counts).reduce((a,b)=>a+b,0);
   return <Link key={item.id} href={item.id?animeLinePath[id]:'/shop'} scroll={false} onClick={event=>changeLine(item.id,event)} className={filters.linea===item.id?styles.lineActive:undefined} aria-current={filters.linea===item.id?'page':undefined}>
    <span className={styles.lineNumber}>{count.toLocaleString('es-CO')} diseños</span><span className={styles.lineText}><strong>{item.name}</strong><small>{tagline}</small></span><span className={styles.lineArt}><Image src={`/anime/universe/${!item.id?'all':id==='urbanos'?'urbanas':id}.webp`} alt="" fill sizes="(max-width:700px) 260px, 350px" quality={85}/></span><ArrowUpRight size={16}/>
   </Link>;
  })}</nav>
  <div className={styles.journeyLine}><span>{line?.name||'Todas las líneas'} · {filtered.length} diseños</span><span>Elige tu línea. Sigue explorando.</span></div>
  <div id="anime-inline-filters" className={styles.inlineFilters} hidden={!filterOpen}><div className={styles.toolbar}><div className={styles.search}><Search size={20}/><input type="search" value={filters.q} onChange={event=>update({q:event.target.value},true)} placeholder="Busca un personaje, banda o diseño" aria-label="Buscar diseños" maxLength={100}/>{filters.q&&<button type="button" onClick={()=>update({q:''},true)} aria-label="Limpiar búsqueda"><X size={18}/></button>}</div></div>
  <div className={styles.desktopFilters}>{controls('desktop')}</div>
  <div className={styles.categoryChips} aria-label="Franquicias para descubrir"><button type="button" aria-pressed={!filters.categoria} onClick={()=>update({categoria:''})}>Todos los diseños</button>{chips.map(category=><button type="button" key={category} aria-pressed={filters.categoria===animeCategorySlug(category)} onClick={()=>update({categoria:animeCategorySlug(category)})}>{category}</button>)}</div></div>
 </div>;
 return <><AnimeUniverseHero {...hero} navigation={navigation}/><section className={styles.shop} id="coleccion" aria-labelledby="anime-collection-title">
  <div className={styles.sectionHeading}><div><p className={styles.kicker}>Encuentra lo que te representa</p><h2 id="anime-collection-title">{currentCategory|| (line?`Camisetas ${line.name}.`:'Encuentra tu próxima camiseta.')}</h2></div><p><span className={styles.resultCount} aria-live="polite">{filtered.length} diseños</span><br/>Combina referencias de cualquier línea.</p></div>
  <div className={styles.catalogDock}>
   <a href="#anime-inicio" data-cinema-home className={styles.catalogHome} aria-label="Volver al inicio de Anime Shop"><Home size={16}/><span>Inicio</span></a>
   <nav className={styles.catalogLines} aria-label="Cambiar línea entre los productos">{lineChoices.map(item=><Link key={item.id} href={item.id?animeLinePath[item.id as AnimeLine]:'/shop'} scroll={false} onClick={event=>changeLine(item.id,event)} aria-current={filters.linea===item.id?'page':undefined}>{item.name}<small>{countLine(item.id).toLocaleString('es-CO')}</small></Link>)}</nav>
   <button type="button" className={styles.catalogFilter} aria-label="Filtrar productos" aria-expanded={gridFilterOpen} aria-controls="anime-grid-filters" onClick={()=>setGridFilterOpen(value=>!value)}><SlidersHorizontal size={16}/><span>Filtros</span>{activeCount>0&&<b>{activeCount}</b>}</button>
  </div>
  <div id="anime-grid-filters" className={`${styles.gridFilters} ${styles.inlineFilters}`} hidden={!gridFilterOpen}>
   <div className={styles.search}><Search size={18}/><input type="search" value={filters.q} onChange={event=>update({q:event.target.value},true)} placeholder="Personaje, franquicia o referencia" aria-label="Buscar entre los productos" maxLength={100}/>{filters.q&&<button type="button" onClick={()=>update({q:''},true)} aria-label="Limpiar búsqueda"><X size={16}/></button>}</div>
   {controls('grid')}
  </div>
  {(filters.q||currentCategory||filters.doble)&&<div className={styles.activeFilters}>{filters.q&&<button onClick={()=>update({q:''},true)}>“{filters.q}” <X size={13}/></button>}{currentCategory&&<button onClick={()=>update({categoria:''})}>{currentCategory} <X size={13}/></button>}{filters.doble&&<button onClick={()=>update({doble:false})}>Doble estampado <X size={13}/></button>}</div>}
  <div className={styles.grid} aria-busy={deferredQuery!==filters.q}>{items.map(product=><AnimeProductCard key={product.id} product={product} onChoose={choose} onNavigate={remember} quantity={selection.rows.filter(row=>row.id===product.id).reduce((n,row)=>n+row.quantity,0)}/>)}</div>
  {filtered.length===0&&<div className={styles.empty}><Search size={30}/><h3>No encontramos ese diseño.</h3><p>Prueba con otro personaje, franquicia o referencia.</p><button type="button" className={styles.primary} onClick={reset}>Ver todos los diseños <ArrowUpRight size={17}/></button></div>}
  {visible<filtered.length&&<div className={styles.loadMore}><p>Has visto {Math.min(visible,filtered.length)} de {filtered.length} diseños</p><span className={styles.loadTrack}><span style={{width:`${100*Math.min(visible,filtered.length)/filtered.length}%`}}/></span><button type="button" className={styles.secondary} onClick={()=>setPagination({key:filterKey,count:visible+24})}>Mostrar más diseños <ArrowDown size={17}/></button></div>}
  {filtered.length>0&&visible>=filtered.length&&<p className={styles.endMessage}><Check size={15}/> Ya viste todos los diseños de esta selección.</p>}
  <AnimeQuickView product={quick} onClose={()=>setQuick(null)} onNavigate={remember}/>
 </section><div className={styles.benefits}><span><Check size={15}/> Tú eliges diseños y tallas</span><span><Check size={15}/> Combina las cuatro líneas</span><span><Check size={15}/> Confirmamos contigo por WhatsApp</span></div></>;
}
