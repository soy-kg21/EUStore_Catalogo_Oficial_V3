import Link from 'next/link';
const links=[['todo','Todo','/catalogo'],['camisetas','Camisetas','/categoria/camisetas'],['zapatillas','Nacionales','/categoria/zapatillas'],['conjuntos','Conjuntos','/categoria/conjuntos'],['importadas','Importadas','/zapatillas-importadas'],['conjuntos-buzos','Buzos y sudaderas','/conjuntos-buzos'],['anime','Anime Shop','/anime']];
export default function CatalogNavigation({active}:{active:string}){
 return <nav className="category-tabs" aria-label="Categorías del catálogo">{links.map(([key,label,href])=><Link key={key} className={active===key?'active':''} aria-current={active===key?'page':undefined} href={href}>{label}</Link>)}</nav>;
}
