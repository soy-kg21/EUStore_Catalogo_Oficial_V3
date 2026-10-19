import Link from 'next/link';
import {getProducts,queryProducts,type Params} from '@/lib/products';
import {categories} from '@/lib/config';
import {animeProducts} from '@/data/anime-products';
import {searchCatalog,type CatalogMatch} from '@/lib/catalog-search';
import AnimeCategoryGateway from '@/components/anime/AnimeCategoryGateway';
import CollectionGateway from './CollectionGateway';
import Filters from './Filters';
import ProductCard from './ProductCard';
import AnimeSearchCard from './AnimeSearchCard';

export default async function Catalog({params,category}:{params:Params;category?:string}){
  const all=await getProducts();
  const values=Object.fromEntries(Object.entries(params).map(([k,v])=>[k,typeof v==='string'&&v!=='all'?v:'']));
  const globalSearch=!category&&!!values.q?.trim();
  const generalResult=queryProducts(all,values,category);
  const result=globalSearch?searchCatalog(all,animeProducts,values):{
    ...generalResult,items:generalResult.items.map(product=>({kind:'general',product} as CatalogMatch))};
  const base=category?all.filter(p=>p.category===category):all;
  const path=category?'/categoria/'+category:'/catalogo';
  const cat=categories.find(c=>c.slug===category);
  const options={sizes:[...new Set([...base.flatMap(p=>p.sizes),...(globalSearch?animeProducts.flatMap(p=>[...p.sizes]):[])])],colors:[...new Set(base.map(p=>p.color))].sort(),brands:[...new Set(base.map(p=>p.brand).filter((x):x is string=>!!x))].sort()};
  const pageLink=(n:number)=>{const p=new URLSearchParams(values);p.set('page',String(n));return path+'?'+p};
  return <main className="page-main" id="contenido">
    <nav className="breadcrumb"><Link href="/">Inicio</Link><span>/</span><span>{cat?.name||'Catálogo'}</span></nav>
    <div className="catalog-head"><p className="eyebrow">ENCUENTRA LO QUE VA CONTIGO</p><h1 className="page-title">{cat?.name||'Todo el catálogo.'}</h1><p className="page-intro">{cat?.detail||'Explora prendas y calzado. Combina tu estilo, elige tu talla y conversemos.'}</p></div>
    {category==='camisetas'&&<AnimeCategoryGateway/>}
    {(category==='zapatillas'||category==='conjuntos')&&<CollectionGateway category={category}/>}
    <div className="catalog-layout" id={category?`catalogo-${category}`:undefined}>
      <aside aria-label="Filtros del catálogo"><Filters path={path} options={options} values={values}/></aside>
      <section className="catalog-results">
        <div className="catalog-toolbar"><nav className="category-tabs"><Link className={!category?'active':''} href="/catalogo">Todo</Link>{categories.map(c=><Link className={category===c.slug?'active':''} key={c.slug} href={'/categoria/'+c.slug}>{c.name}</Link>)}<Link href="/anime">Anime Shop</Link></nav><span>{result.total} referencias</span></div>
        {result.items.length?<div className="product-grid">{result.items.map((m,i)=>m.kind==='anime'?<AnimeSearchCard key={m.product.id} product={m.product} priority={i<3}/>:<ProductCard key={m.product.id} product={m.product} priority={i<3}/>)}</div>:<div className="empty-state"><h2>No encontramos coincidencias.</h2><p>Prueba otra talla, nombre o rango de precio.</p><Link className="button" href={path}>VER TODOS</Link></div>}
        {result.pages>1&&<nav className="pagination" aria-label="Páginas de productos">{result.page>1&&<Link href={pageLink(result.page-1)}>Anterior</Link>}<span>Página {result.page} de {result.pages}</span>{result.page<result.pages&&<Link href={pageLink(result.page+1)}>Siguiente</Link>}</nav>}
      </section>
    </div>
  </main>;
}
