'use client';
import Link from 'next/link';
import Image from 'next/image';
import {useCallback,useDeferredValue,useEffect,useLayoutEffect,useMemo,useRef,useState,type MouseEvent} from 'react';
import {ArrowDown,ArrowUpRight,Check,Layers,Search,SlidersHorizontal,X} from 'lucide-react';
import {animeLines,animeCategorySlug,filterAnimeProducts,type AnimeClientProduct,type AnimeFilters,type AnimeLine} from '@/lib/anime-catalog-core';
import {animeExperience} from '@/lib/anime-experience';
import {animeLinePath} from '@/lib/anime-routes';
import {orderAnimeShopProducts} from '@/lib/anime-merchandising';
import {useAnimeSelection} from '@/lib/anime-selection';
import {trackAnimeEvent} from '@/lib/anime-events';
import {warmAnimeImages} from '@/lib/anime-image';
import {useAnimeFilters} from './useAnimeFilters';
import {useAnimeListNavigation} from './useAnimeListNavigation';
import AnimeUniverseHero from './AnimeUniverseHero';
import AnimeProductCard from './AnimeProductCard';
import CatalogDock, {catalogDockStart} from '../store/CatalogDock';
import CatalogFilterPanel from '../store/CatalogFilterPanel';
import styles from './shop-premium.module.css';
import dockStyles from '../store/catalog-dock.module.css';
import filterStyles from '../store/catalog-filter.module.css';

type DesignFilters = Pick<AnimeFilters, 'q' | 'categoria' | 'doble'>;

function AnimeFilterForm({filters, categories, chips, apply}: {
 filters: DesignFilters;
 categories: string[];
 chips: string[];
 apply: (values: DesignFilters) => void;
}){
 const [franchise, setFranchise] = useState(filters.categoria);
 return <form className={filterStyles.form} onSubmit={event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  apply({q: String(data.get('q') ?? '').trim(), categoria: franchise, doble: data.has('doble')});
 }}>
  <label className={filterStyles.field}>
   <span>Buscar diseños</span>
   <div className={filterStyles.search}>
    <Search size={16} aria-hidden="true"/>
    <input type="search" name="q" defaultValue={filters.q} enterKeyHint="search" autoComplete="off"
      placeholder="Personaje, banda o diseño" maxLength={100}/>
   </div>
  </label>
  <div className={filterStyles.fields}>
   <label className={`${filterStyles.field} ${filterStyles.wide}`}>
    <span>Universo o franquicia</span>
    <select value={franchise} onChange={event => setFranchise(event.target.value)}>
     <option value="">Todas las franquicias</option>
     {categories.map(category => <option key={category} value={animeCategorySlug(category)}>{category}</option>)}
    </select>
   </label>
   <label className={`${filterStyles.optionToggle} ${filterStyles.wide}`}>
    <input type="checkbox" name="doble" defaultChecked={Boolean(filters.doble)}/>
    <Layers size={16} aria-hidden="true"/> Solo doble estampado
   </label>
   {chips.length > 0 && <div className={`${filterStyles.chips} ${filterStyles.wide}`} aria-label="Franquicias para descubrir">
    {chips.map(category => {
     const slug = animeCategorySlug(category);
     return <button type="button" key={slug} aria-pressed={franchise === slug}
      onClick={() => setFranchise(franchise === slug ? '' : slug)}>{category}</button>;
    })}
   </div>}
  </div>
  <div className={filterStyles.actions}>
   <button type="submit" className="button">Ver resultados</button>
   <button type="button" className={filterStyles.reset}
    onClick={() => apply({q: '', categoria: '', doble: false})}>Limpiar filtros</button>
  </div>
 </form>;
}

export default function AnimeShopClient({products,initialSearch,counts}:{products:AnimeClientProduct[];initialSearch:string;counts:Record<AnimeLine,number>}){
 const {filters,update}=useAnimeFilters(initialSearch),selection=useAnimeSelection();
 const [filterOpen,setFilterOpen]=useState(false);
 const filterTrigger=useRef<HTMLButtonElement>(null),dockTrigger=useRef<HTMLButtonElement>(null);
 const dock=useRef<HTMLDivElement>(null),grid=useRef<HTMLDivElement>(null);
 const filterTarget=useRef<'results'|'visible'|null>(null);
 const placeResults=useCallback((alignToDock: boolean)=>{
  const list=grid.current;
  const bar=dock.current;
  if(!list||!bar)return;
  const header=document.querySelector('header.header')?.getBoundingClientRect().height||82;
  const top=alignToDock||bar.hasAttribute('data-current-docked')
   ? catalogDockStart(bar)
   : window.scrollY+list.getBoundingClientRect().top-header-bar.offsetHeight-24;
  window.scrollTo({top:Math.max(0,top),behavior:'instant'});
  window.dispatchEvent(new Event('eu-anime-place-list'));
 },[]);
 const warmedLines=useRef(new Set<string>());
 const warmLine=(id:string)=>{
  if(warmedLines.current.has(id))return;
  warmedLines.current.add(id);
  const rows=orderAnimeShopProducts(filterAnimeProducts(products,{linea:id,categoria:'',q:''}),{linea:id});
  warmAnimeImages(rows);
 };
 const updateHere=(patch: Partial<AnimeFilters>,replace=false,revealResults=false)=>{
  const changed=(['linea','categoria','q'] as const).some(key=>patch[key]!==undefined&&patch[key]!==filters[key])||patch.doble!==undefined&&!!patch.doble!==!!filters.doble;
  if(!changed){
   if(revealResults)placeResults(true);
   return;
  }
  const top=grid.current?.getBoundingClientRect().top??Infinity;
  const header=document.querySelector('header.header')?.getBoundingClientRect().height||82;
  filterTarget.current=revealResults?'results':top<header+(dock.current?.offsetHeight||60)+25?'visible':null;
  prepareFilterUpdate();
  update(patch,replace);
 };
 const toggleFilters=(event:MouseEvent<HTMLButtonElement>)=>{
  filterTrigger.current=event.currentTarget;
  setFilterOpen(!filterOpen);
 };
 const deferredQuery=useDeferredValue(filters.q),filterKey=JSON.stringify(filters),[pagination,setPagination]=useState({key:filterKey,count:24});
 const visible=pagination.key===filterKey?pagination.count:24;
 const categories=useMemo(()=>[...new Set(products.filter(product=>!filters.linea||product.line===filters.linea).map(product=>product.category))].sort((a,b)=>a.localeCompare(b,'es')),[products,filters.linea]);
 const railDrag=useRef<{pointer:number;x:number;scroll:number;moved:boolean}|null>(null),suppressRailClick=useRef(false);
 const filtered=useMemo(()=>orderAnimeShopProducts(filterAnimeProducts(products,{...filters,q:deferredQuery}),filters),[products,filters,deferredQuery]);
 const prepareFilterUpdate=useAnimeListNavigation({filters,count:visible,filterOpen,gridFilterOpen:false,restore:saved=>{
  filterTrigger.current??=dockTrigger.current;
  setPagination({key:filterKey,count:saved.count});setFilterOpen(saved.filterOpen||saved.gridFilterOpen);
 }});
 // A new, shorter line starts at its first row. Never pad an empty list to
 // retain the previous line's bottom position.
 useLayoutEffect(()=>{
  const target=filterTarget.current;
  filterTarget.current=null;
  if(target)placeResults(target==='results');
 },[filterKey,placeResults]);
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
 const navigation=<div className={styles.journeyControls}>
  <div className={styles.collectionLead}><div><p className={styles.kicker}>Sigue en tu universo</p><h2>¿QUÉ TE REPRESENTA?</h2></div><button type="button" className={styles.journeyFilterButton} aria-haspopup="dialog" aria-expanded={filterOpen} aria-controls={filterOpen?'anime-inline-filters':undefined} onClick={toggleFilters}><SlidersHorizontal size={17}/> Filtros{activeCount>0&&<b>{activeCount}</b>}</button></div>
  <nav className={styles.lineNav} aria-label="Líneas de Anime Shop" onDragStart={event=>event.preventDefault()} onPointerDown={event=>{if(event.pointerType==='mouse'&&event.button===0){railDrag.current={pointer:event.pointerId,x:event.clientX,scroll:event.currentTarget.scrollLeft,moved:false};suppressRailClick.current=false;}}} onPointerMove={event=>{const drag=railDrag.current;if(!drag||drag.pointer!==event.pointerId)return;const delta=event.clientX-drag.x;if(Math.abs(delta)>8){drag.moved=true;suppressRailClick.current=true;event.currentTarget.setPointerCapture(event.pointerId);}if(drag.moved){event.currentTarget.scrollLeft=drag.scroll-delta;event.preventDefault();}}} onPointerUp={()=>{railDrag.current=null;setTimeout(()=>{suppressRailClick.current=false;},0);}} onPointerCancel={()=>{railDrag.current=null;suppressRailClick.current=false;}} onClickCapture={event=>{if(suppressRailClick.current){event.preventDefault();event.stopPropagation();}}}>{[{id:'',name:'Todas'},...animeLines].map(item=>{
   const id=item.id as AnimeLine,tagline={anime:'Historias que te representan',cartoon:'Personajes de siempre',rock:'Tu música. Tu actitud.',urbanos:'Hechas para la calle'}[id]||'Todos tus universos';
   const count=item.id?counts[id]:Object.values(counts).reduce((a,b)=>a+b,0);
   return <Link prefetch={false} key={item.id} href={item.id?animeLinePath[id]:'/shop'} scroll={false} onPointerEnter={()=>warmLine(item.id)} onFocus={()=>warmLine(item.id)} onPointerDown={()=>warmLine(item.id)} onClick={event=>changeLine(item.id,event)} className={filters.linea===item.id?styles.lineActive:undefined} aria-current={filters.linea===item.id?'page':undefined}>
    <span className={styles.lineNumber}>{count.toLocaleString('es-CO')} diseños</span><span className={styles.lineText}><strong>{item.name}</strong><small>{tagline}</small></span><span className={styles.lineArt}><Image unoptimized src={`/anime/universe/${!item.id?'all':id==='urbanos'?'urbanas':id}.webp`} alt="" fill sizes="(max-width:700px) 260px, 350px" quality={85}/></span><ArrowUpRight size={16}/>
   </Link>;
  })}</nav>
  <div className={styles.journeyLine}><span>{line?.name||'Todas las líneas'} · {filtered.length} diseños</span><span>Elige tu línea. Sigue explorando.</span></div>

 </div>;
 return <><AnimeUniverseHero line={filters.linea} navigation={navigation}/>
  <CatalogFilterPanel open={filterOpen} onOpenChange={setFilterOpen} trigger={filterTrigger}
   id="anime-inline-filters" title="Filtros de Anime Shop">
   {()=> <AnimeFilterForm key={filterKey} filters={filters} categories={categories} chips={chips} apply={values=>{
    setFilterOpen(false);
    updateHere(values,false,true);
   }}/>}
  </CatalogFilterPanel>
  <section className={styles.shop} id="coleccion" aria-labelledby="anime-collection-title">
  <div className={styles.sectionHeading}><div><p className={styles.kicker}>Encuentra lo que te representa</p><h2 id="anime-collection-title">{currentCategory|| (line?`Camisetas ${line.name}.`:'Encuentra tu próxima camiseta.')}</h2></div><p><span className={styles.resultCount} aria-live="polite">{filtered.length} diseños</span><br/>Combina referencias de cualquier línea.</p></div>
  <CatalogDock dockRef={dock} navLabel="Cambiar línea entre los productos" activeLabel={line?.name ?? 'Todas'} actions={
   <button ref={dockTrigger} type="button" className={dockStyles.filter} aria-label="Filtros de productos" aria-haspopup="dialog" aria-expanded={filterOpen} aria-controls={filterOpen?'anime-inline-filters':undefined} onClick={toggleFilters}><SlidersHorizontal size={18} aria-hidden="true"/>{activeCount>0&&<b aria-hidden="true">{activeCount}</b>}</button>
  }>
   {lineChoices.map(item=><Link prefetch={false} key={item.id} href={item.id?animeLinePath[item.id as AnimeLine]:'/shop'} scroll={false} onPointerEnter={()=>warmLine(item.id)} onFocus={()=>warmLine(item.id)} onPointerDown={()=>warmLine(item.id)} onClick={event=>changeLine(item.id,event)} aria-current={filters.linea===item.id?'page':undefined}>{item.name}<small>{countLine(item.id).toLocaleString('es-CO')}</small></Link>)}
  </CatalogDock>
  {(filters.q||currentCategory||filters.doble)&&<div className={styles.activeFilters}>{filters.q&&<button onClick={()=>updateHere({q:''},true)}>“{filters.q}” <X size={13}/></button>}{currentCategory&&<button onClick={()=>updateHere({categoria:''})}>{currentCategory} <X size={13}/></button>}{filters.doble&&<button onClick={()=>updateHere({doble:false})}>Doble estampado <X size={13}/></button>}</div>}
  <div ref={grid} className={styles.grid} style={{overflowAnchor:'none'}} aria-busy={deferredQuery!==filters.q}>{items.map((product,index)=><AnimeProductCard eager={index<4} key={product.id} product={product} quantity={selection.rows.filter(row=>row.id===product.id).reduce((n,row)=>n+row.quantity,0)}/>)}</div>
  {filtered.length===0&&<div className={styles.empty}><Search size={30}/><h3>No encontramos ese diseño.</h3><p>Prueba con otro personaje, franquicia o referencia.</p><button type="button" className={styles.primary} onClick={reset}>Ver todos los diseños <ArrowUpRight size={17}/></button></div>}
  {visible<filtered.length&&<div className={styles.loadMore}><p>Has visto {Math.min(visible,filtered.length)} de {filtered.length} diseños</p><span className={styles.loadTrack}><span style={{width:`${100*Math.min(visible,filtered.length)/filtered.length}%`}}/></span><button type="button" className={styles.secondary} onClick={()=>setPagination({key:filterKey,count:visible+24})}>Mostrar más diseños <ArrowDown size={17}/></button></div>}
  {filtered.length>0&&visible>=filtered.length&&<p className={styles.endMessage}><Check size={15}/> Ya viste todos los diseños de esta selección.</p>}
 </section><div className={styles.benefits}><span><Check size={15}/> Tú eliges diseños y tallas</span><span><Check size={15}/> Combina las cuatro líneas</span><span><Check size={15}/> Confirmamos contigo por WhatsApp</span></div></>;
}
