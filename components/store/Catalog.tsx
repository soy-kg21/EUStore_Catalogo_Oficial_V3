import {getAnimeProducts} from '@/lib/live-products';
import Link from 'next/link';
import {getProducts,queryProducts,type Params} from '@/lib/products';
import {categories} from '@/lib/config';
import {animeProducts} from '@/data/anime-products';
import {searchCatalog,type CatalogMatch} from '@/lib/catalog-search';
import AnimeCategoryGateway from '@/components/anime/AnimeCategoryGateway';
import CollectionGateway from './CollectionGateway';
import CatalogNavigation from './CatalogNavigation';
import CatalogPageScroll from './CatalogPageScroll';
import Filters from './Filters';
import ProductCard from './ProductCard';
import AnimeSearchCard from './AnimeSearchCard';
import {categoryProducts} from '@/lib/catalog-collections';
import {orderedShoeSizes} from '@/lib/shoe-sizes';

export default async function Catalog({params,category}:{params:Params;category?:string}){
  const published=await getProducts(),all=category?categoryProducts(published,category):published,animeProducts=await getAnimeProducts();
  const values=Object.fromEntries(Object.entries(params).map(([k,v])=>[k,typeof v==='string'&&v!=='all'?v:'']));
  const globalSearch=!category&&!!values.q?.trim();
  const generalResult=queryProducts(all,values,category);
  const result=globalSearch?searchCatalog(all,animeProducts,values):{
    ...generalResult,items:generalResult.items.map(product=>({kind:'general',product} as CatalogMatch))};
  const base=category?all.filter(p=>p.category===category):all;
  const path=category?'/categoria/'+category:'/catalogo';
  const cat=categories.find(c=>c.slug===category);
  const sizes=[...new Set([...base.flatMap(p=>p.sizes),...(globalSearch?animeProducts.flatMap(p=>[...p.sizes]):[])])];
  const options={sizes:category==='zapatillas'?orderedShoeSizes(sizes):sizes,colors:[...new Set(base.map(p=>p.color))].sort(),brands:[...new Set(base.map(p=>p.brand).filter((x):x is string=>!!x))].sort()};
  const pageLink=(n:number)=>{const p=new URLSearchParams(values);p.set('page',String(n));return path+'?'+p+'#catalogo-filtros'};
  return <main className="page-main" id="contenido">
    <nav className="breadcrumb"><Link href="/">Inicio</Link><span>/</span><span>{cat?.name||'Catálogo'}</span></nav>
    <div className="catalog-head"><p className="eyebrow">ENCUENTRA LO QUE VA CONTIGO</p><h1 className="page-title">{category==='zapatillas'?'Zapatillas nacionales.':cat?.name||'Todo el catálogo.'}</h1><p className="page-intro">{cat?.detail||'Explora prendas y calzado. Combina tu estilo, elige tu talla y conversemos.'}</p></div>
    {category==='camisetas'&&<AnimeCategoryGateway/>}
    {(category==='zapatillas'||category==='conjuntos')&&<CollectionGateway category={category}/>}
    <CatalogPageScroll page={result.page}/>
    <div className="catalog-layout" data-catalog-start id={category?`catalogo-${category}`:undefined}>
      <aside id="catalogo-filtros" aria-label="Filtros del catálogo"><Filters path={path} options={options} values={values}/></aside>
      <section className="catalog-results" id="catalogo-resultados">
        <div className="catalog-toolbar"><CatalogNavigation active={category||'todo'}/><span>{result.total} referencias</span></div>
        {result.items.length?<div className="product-grid" id="catalogo-productos">{result.items.map((m,i)=>m.kind==='anime'?<AnimeSearchCard key={m.product.id} product={m.product} priority={i<3}/>:<ProductCard key={m.product.id} product={m.product} priority={i<3}/>)}</div>:<div className="empty-state" id="catalogo-productos"><h2>No encontramos coincidencias.</h2><p>Prueba otra talla, nombre o rango de precio.</p><Link className="button" href={path}>VER TODOS</Link></div>}
        {result.pages>1&&<nav className="pagination" aria-label="Páginas de productos">{result.page>1&&<Link scroll={false} href={pageLink(result.page-1)}>Anterior</Link>}<span>Página {result.page} de {result.pages}</span>{result.page<result.pages&&<Link scroll={false} href={pageLink(result.page+1)}>Siguiente</Link>}</nav>}
      </section>
    </div>
  </main>;
}
