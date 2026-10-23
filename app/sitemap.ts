import {getAnimeProducts} from '@/lib/live-products';
import {getProducts} from '@/lib/products';
import {ORIGIN,categories} from '@/lib/config';
import {animeProducts,animeCategorySlug} from '@/data/anime-products';
import {animeProductHref,animeLinePath} from '@/lib/anime-routes';

export default async function sitemap(){
  const animeProducts=await getAnimeProducts();
  return [
    ...['','/catalogo','/anime','/ofertas','/nosotros','/contacto','/zapatillas-importadas','/conjuntos-buzos'].map(path=>({url:ORIGIN+path})),
    ...categories.map(c=>({url:ORIGIN+'/categoria/'+c.slug})),
    ...(await getProducts()).map(p=>({url:ORIGIN+'/producto/'+p.slug})),
    ...['/shop','/cartoon','/rock','/urbanas'].map(path=>({url:ORIGIN+path})),
    ...[...new Set(animeProducts.map(p=>animeLinePath[p.line]+'/'+animeCategorySlug(p.category)))].map(path=>({url:ORIGIN+path})),
    ...animeProducts.map(p=>({url:ORIGIN+animeProductHref(p.id)}))
  ];
}
