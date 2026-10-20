'use client';
import Link from 'next/link';
import Image from 'next/image';
import {createPortal} from 'react-dom';
import {useCallback,useDeferredValue,useEffect,useLayoutEffect,useMemo,useRef,useState,type MouseEvent} from 'react';
import {ArrowDown,ArrowUpRight,Check,Layers,Search,SlidersHorizontal,X} from 'lucide-react';
import {animeLines,animeCategorySlug,filterAnimeProducts,type AnimeClientProduct,type AnimeLine} from '@/lib/anime-catalog-core';
import {animeExperience} from '@/lib/anime-experience';
import {animeLinePath} from '@/lib/anime-routes';
import {orderAnimeShopProducts,isDoublePrint} from '@/lib/anime-merchandising';
import {useAnimeSelection} from '@/lib/anime-selection';
import {trackAnimeEvent} from '@/lib/anime-events';
import {warmAnimeImages} from '@/lib/anime-image';
import {useAnimeFilters} from './useAnimeFilters';
import {useAnimeListNavigation} from './useAnimeListNavigation';
import AnimeUniverseHero from './AnimeUniverseHero';
import AnimeProductCard from './AnimeProductCard';
import styles from './shop-premium.module.css';
export default function AnimeShopClient({products,initialSearch,counts,hero}:{products:AnimeClientProduct[];initialSearch:string;counts:Record<AnimeLine,number>;hero:Omit<Parameters<typeof AnimeUniverseHero>[0],'navigation'>}){
 const {filters,update}=useAnimeFilters(initialSearch),selection=useAnimeSelection();
 const [filterOpen,setFilterOpen]=useState(false);
 const filterPanel=useRef<HTMLDivElement>(null),filterTrigger=useRef<HTMLButtonElement|null>(null),dock=useRef<HTMLDivElement>(null),grid=useRef<HTMLDivElement>(null),shop=useRef<HTMLElement>(null);
 const filterTarget=useRef(false);
 const closeFilters=useCallback(()=>setFilterOpen(false),[]);
 const warmedLines=useRef(new Set<string>());
 const warmLine=(id:string)=>{
  if(warmedLines.current.has(id))return;
  warmedLines.current.add(id);
  const rows=orderAnimeShopProducts(filterAnimeProducts(products,{linea:id,categoria:'',q:''}),{linea:id});
  warmAnimeImages(rows);
 };
 const updateHere:typeof update=(patch,replace=false)=>{
  const changed=(['linea','categoria','q'] as const).some(key=>patch[key]!==undefined&&patch[key]!==filters[key])||patch.doble!==undefined&&!!patch.doble!==!!filters.doble;
  if(changed){
   const top=grid.current?.getBoundingClientRect().top??Infinity;
   const header=document.querySelector('header.header')?.getBoundingClientRect().height||82;
   filterTarget.current=top<header+(dock.current?.offsetHeight||60)+25;
   prepareFilterUpdate();
  }
  update(patch,replace);
 };
 const toggleFilters=(event:MouseEvent<HTMLButtonElement>)=>{filterTrigger.current=event.currentTarget;if(filterOpen)closeFilters();else setFilterOpen(true);};
 useEffect(()=>{
  if(!filterOpen)return;
  const panel=filterPanel.current;if(!panel)return;
  const position=()=>{
   const viewport=window.visualViewport,offset=viewport?.offsetTop||0,height=viewport?.height||window.innerHeight;
   const header=document.querySelector('header.header')?.getBoundingClientRect().bottom||82;
   const minTop=Math.max(offset+10,header+8),maxBottom=offset+height-12;
   let anchor=filterTrigger.current?.getBoundingClientRect();
   if(!anchor||anchor.bottom<minTop)anchor=dock.current?.getBoundingClientRect();
   const below=(anchor?.bottom||minTop)+8,available=maxBottom-below;
   const top=available>=230?below:Math.max(minTop,(anchor?.top||minTop)-Math.min(panel.scrollHeight,maxBottom-minTop)-8);
   panel.style.top=`${Math.min(top,Math.max(minTop,maxBottom-140))}px`;
   panel.style.right=`${Math.max(12,Math.min(window.innerWidth-(anchor?.right||window.innerWidth-16),window.innerWidth-Math.min(420,window.innerWidth-24)-12))}px`;
   panel.style.maxHeight=`${Math.max(120,maxBottom-parseFloat(panel.style.top))}px`;
  };
  let positionFrame=0;
  const schedulePosition=()=>{if(!positionFrame)positionFrame=requestAnimationFrame(()=>{positionFrame=0;position();});};
  position();panel.querySelector<HTMLInputElement>('input[type="search"]')?.focus({preventScroll:true});
  const outside=(event:PointerEvent)=>{if(event.target instanceof Node&&!panel.contains(event.target)&&!filterTrigger.current?.contains(event.target))closeFilters();};
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();closeFilters();filterTrigger.current?.focus({preventScroll:true});}};
  window.addEventListener('scroll',schedulePosition,{passive:true});window.addEventListener('resize',schedulePosition,{passive:true});
  window.visualViewport?.addEventListener('resize',schedulePosition);window.visualViewport?.addEventListener('scroll',schedulePosition);
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  return()=>{cancelAnimationFrame(positionFrame);window.removeEventListener('scroll',schedulePosition);window.removeEventListener('resize',schedulePosition);window.visualViewport?.removeEventListener('resize',schedulePosition);window.visualViewport?.removeEventListener('scroll',schedulePosition);document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
 },[filterOpen,closeFilters]);
 const deferredQuery=useDeferredValue(filters.q),filterKey=JSON.stringify(filters),[pagination,setPagination]=useState({key:filterKey,count:24});
 const visible=pagination.key===filterKey?pagination.count:24;
 const categories=useMemo(()=>[...new Set(products.filter(product=>!filters.linea||product.line===filters.linea).map(product=>product.category))].sort((a,b)=>a.localeCompare(b,'es')),[products,filters.linea]);
 const railDrag=useRef<{pointer:number;x:number;scroll:number;moved:boolean}|null>(null),suppressRailClick=useRef(false);
 useEffect(()=>{const open=()=>setFilterOpen(true);window.addEventListener('eu-open-anime-filters',open);return()=>window.removeEventListener('eu-open-anime-filters',open);},[]);
 const filtered=useMemo(()=>orderAnimeShopProducts(filterAnimeProducts(products,{...filters,q:deferredQuery}).filter(product=>!filters.doble||isDoublePrint(product.id)),filters),[products,filters,deferredQuery]);
 const prepareFilterUpdate=useAnimeListNavigation({filters,count:visible,filterOpen,gridFilterOpen:false,restore:saved=>{
  setPagination({key:filterKey,count:saved.count});setFilterOpen(saved.filterOpen||saved.gridFilterOpen);
 }});
 // A new, shorter line starts at its first row. Never pad an empty list to
 // retain the previous line's bottom position.
 useLayoutEffect(()=>{
  if(!filterTarget.current)return;
  filterTarget.current=false;
  const list=grid.current;if(!list)return;
  const header=document.querySelector('header.header')?.getBoundingClientRect().height||82;
  const top=window.scrollY+list.getBoundingClientRect().top-header-(dock.current?.offsetHeight||60)-24;
  window.scrollTo({top:Math.max(0,top),behavior:'instant'});
  window.dispatchEvent(new Event('eu-anime-place-list'));
 },[filterKey]);
 const items=filtered.slice(0,visible),line=animeLines.find(item=>item.id===filters.linea),experience=animeExperience[line?.id||'shop'];
 const currentCategory=categories.find(category=>animeCategorySlug(category)===filters.categoria);
 const popular=experience.categories.filter(category=>categories.includes(category));
 const chips=popular.length?popular.slice(0,6):categories.slice(0,6);
 const activeCount=Number(!!filters.q)+Number(!!filters.categoria)+Number(!!filters.doble),reset=()=>updateHere({categoria:'',q:'',doble:false});
 const chooseLine=(id:string)=>{const categoria=products.some(p=>(!id||p.line===id)&&animeCategorySlug(p.category)===filters.categoria)?filters.categoria:'';updateHere({linea:id,categoria});};
 const lineChoices=[{id:'',name:'Todas'},...animeLines];
 const countLine=(id:string)=>id?counts[id as AnimeLine]:Object.values(counts).reduce((a,b)=>a+b,0);
 const changeLine=(id:string,event:MouseEvent<HTMLAnchorElement>)=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();chooseLine(id);};
 useEffect(()=>{trackAnimeEvent('view_collection',{line:filters.linea||'todas'});},[filters.linea]);
 const controls=(suffix:string)=><div className={styles.filterControls}>
  <label className={styles.categoryField} htmlFor={`anime-franchise-${suffix}`}><span>Universo o franquicia</span><select id={`anime-franchise-${suffix}`} value={filters.categoria} onChange={event=>updateHere({categoria:event.target.value})}><option value="">Todas las franquicias</option>{categories.map(category=><option key={category} value={animeCategorySlug(category)}>{category}</option>)}</select></label>
  <label className={styles.doubleFilter}><input type="checkbox" checked={!!filters.doble} onChange={event=>updateHere({doble:event.target.checked})}/><span><Layers size={16}/> Solo doble estampado</span></label>
  {activeCount>0&&<button className={styles.resetFilters} type="button" onClick={reset}>Limpiar filtros <X size={14}/></button>}
 </div>;
 const navigation=<div className={styles.journeyControls}>
  <div className={styles.collectionLead}><div><p className={styles.kicker}>Sigue en tu universo</p><h2>¿QUÉ TE REPRESENTA?</h2></div><button type="button" className={styles.journeyFilterButton} aria-expanded={filterOpen} aria-controls="anime-inline-filters" onClick={toggleFilters}><SlidersHorizontal size={17}/> Filtros{activeCount>0&&<b>{activeCount}</b>}</button></div>
  <nav className={styles.lineNav} aria-label="Líneas de Anime Shop" onDragStart={event=>event.preventDefault()} onPointerDown={event=>{if(event.pointerType==='mouse'&&event.button===0){railDrag.current={pointer:event.pointerId,x:event.clientX,scroll:event.currentTarget.scrollLeft,moved:false};suppressRailClick.current=false;}}} onPointerMove={event=>{const drag=railDrag.current;if(!drag||drag.pointer!==event.pointerId)return;const delta=event.clientX-drag.x;if(Math.abs(delta)>8){drag.moved=true;suppressRailClick.current=true;event.currentTarget.setPointerCapture(event.pointerId);}if(drag.moved){event.currentTarget.scrollLeft=drag.scroll-delta;event.preventDefault();}}} onPointerUp={()=>{railDrag.current=null;setTimeout(()=>{suppressRailClick.current=false;},0);}} onPointerCancel={()=>{railDrag.current=null;suppressRailClick.current=false;}} onClickCapture={event=>{if(suppressRailClick.current){event.preventDefault();event.stopPropagation();}}}>{[{id:'',name:'Todas'},...animeLines].map(item=>{
   const id=item.id as AnimeLine,tagline={anime:'Historias que te representan',cartoon:'Personajes de siempre',rock:'Tu música. Tu actitud.',urbanos:'Hechas para la calle'}[id]||'Todos tus universos';
   const count=item.id?counts[id]:Object.values(counts).reduce((a,b)=>a+b,0);
   return <Link prefetch={false} key={item.id} href={item.id?animeLinePath[id]:'/shop'} scroll={false} onPointerEnter={()=>warmLine(item.id)} onFocus={()=>warmLine(item.id)} onPointerDown={()=>warmLine(item.id)} onClick={event=>changeLine(item.id,event)} className={filters.linea===item.id?styles.lineActive:undefined} aria-current={filters.linea===item.id?'page':undefined}>
    <span className={styles.lineNumber}>{count.toLocaleString('es-CO')} diseños</span><span className={styles.lineText}><strong>{item.name}</strong><small>{tagline}</small></span><span className={styles.lineArt}><Image unoptimized src={`/anime/universe/${!item.id?'all':id==='urbanos'?'urbanas':id}.webp`} alt="" fill sizes="(max-width:700px) 260px, 350px" quality={85}/></span><ArrowUpRight size={16}/>
   </Link>;
  })}</nav>
  <div className={styles.journeyLine}><span>{line?.name||'Todas las líneas'} · {filtered.length} diseños</span><span>Elige tu línea. Sigue explorando.</span></div>

 </div>;
 return <><AnimeUniverseHero {...hero} line={filters.linea} navigation={navigation}/>{filterOpen&&createPortal(<div id="anime-inline-filters" ref={filterPanel} role="region" aria-label="Filtros de Anime Shop" data-cinema-native-scroll className={styles.filterPopover} hidden={!filterOpen}><div className={styles.toolbar}><div className={styles.search}><Search size={20}/><input type="search" value={filters.q} onChange={event=>updateHere({q:event.target.value},true)} placeholder="Busca un personaje, banda o diseño" aria-label="Buscar diseños" maxLength={100}/>{filters.q&&<button type="button" onClick={()=>updateHere({q:''},true)} aria-label="Limpiar búsqueda"><X size={18}/></button>}</div></div>
  <div className={styles.desktopFilters}>{controls('desktop')}</div>
  <div className={styles.categoryChips} aria-label="Franquicias para descubrir"><button type="button" aria-pressed={!filters.categoria} onClick={()=>updateHere({categoria:''})}>Todos los diseños</button>{chips.map(category=><button type="button" key={category} aria-pressed={filters.categoria===animeCategorySlug(category)} onClick={()=>updateHere({categoria:animeCategorySlug(category)})}>{category}</button>)}</div></div>,document.body)}<section ref={shop}  className={styles.shop} id="coleccion" aria-labelledby="anime-collection-title">
  <div className={styles.sectionHeading}><div><p className={styles.kicker}>Encuentra lo que te representa</p><h2 id="anime-collection-title">{currentCategory|| (line?`Camisetas ${line.name}.`:'Encuentra tu próxima camiseta.')}</h2></div><p><span className={styles.resultCount} aria-live="polite">{filtered.length} diseños</span><br/>Combina referencias de cualquier línea.</p></div>
  <div ref={dock} className={styles.catalogDock}>
   <nav className={styles.catalogLines} aria-label="Cambiar línea entre los productos">{lineChoices.map(item=><Link prefetch={false} key={item.id} href={item.id?animeLinePath[item.id as AnimeLine]:'/shop'} scroll={false} onPointerEnter={()=>warmLine(item.id)} onFocus={()=>warmLine(item.id)} onPointerDown={()=>warmLine(item.id)} onClick={event=>changeLine(item.id,event)} aria-current={filters.linea===item.id?'page':undefined}>{item.name}<small>{countLine(item.id).toLocaleString('es-CO')}</small></Link>)}</nav>
   <button type="button" className={styles.catalogFilter} aria-label="Filtros de productos" aria-expanded={filterOpen} aria-controls="anime-inline-filters" onClick={toggleFilters}><SlidersHorizontal size={18}/>{activeCount>0&&<b>{activeCount}</b>}</button>
  </div>
  {(filters.q||currentCategory||filters.doble)&&<div className={styles.activeFilters}>{filters.q&&<button onClick={()=>updateHere({q:''},true)}>“{filters.q}” <X size={13}/></button>}{currentCategory&&<button onClick={()=>updateHere({categoria:''})}>{currentCategory} <X size={13}/></button>}{filters.doble&&<button onClick={()=>updateHere({doble:false})}>Doble estampado <X size={13}/></button>}</div>}
  <div ref={grid} className={styles.grid} style={{overflowAnchor:'none'}} aria-busy={deferredQuery!==filters.q}>{items.map((product,index)=><AnimeProductCard eager={index<4} key={product.id} product={product} quantity={selection.rows.filter(row=>row.id===product.id).reduce((n,row)=>n+row.quantity,0)}/>)}</div>
  {filtered.length===0&&<div className={styles.empty}><Search size={30}/><h3>No encontramos ese diseño.</h3><p>Prueba con otro personaje, franquicia o referencia.</p><button type="button" className={styles.primary} onClick={reset}>Ver todos los diseños <ArrowUpRight size={17}/></button></div>}
  {visible<filtered.length&&<div className={styles.loadMore}><p>Has visto {Math.min(visible,filtered.length)} de {filtered.length} diseños</p><span className={styles.loadTrack}><span style={{width:`${100*Math.min(visible,filtered.length)/filtered.length}%`}}/></span><button type="button" className={styles.secondary} onClick={()=>setPagination({key:filterKey,count:visible+24})}>Mostrar más diseños <ArrowDown size={17}/></button></div>}
  {filtered.length>0&&visible>=filtered.length&&<p className={styles.endMessage}><Check size={15}/> Ya viste todos los diseños de esta selección.</p>}
 </section><div className={styles.benefits}><span><Check size={15}/> Tú eliges diseños y tallas</span><span><Check size={15}/> Combina las cuatro líneas</span><span><Check size={15}/> Confirmamos contigo por WhatsApp</span></div></>;
}
