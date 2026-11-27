import {getAnimeProducts} from '@/lib/live-products';
import {getProducts} from '@/lib/products';
import {ORIGIN} from '@/lib/config';
import {catalogSections} from '@/lib/catalog-collections';
import {animeCategorySlug} from '@/data/anime-products';
import {animeProductHref,animeLinePath} from '@/lib/anime-routes';

export default async function sitemap(){
  const animeProducts=await getAnimeProducts();
  return [
    ...['','/catalogo','/ofertas','/nosotros','/contacto'].map(path=>({url:ORIGIN+path})),
    ...Object.values(catalogSections).map(section=>({url:ORIGIN+section.path})),
    ...(await getProducts()).map(p=>({url:ORIGIN+'/producto/'+p.slug})),
    ...['/shop','/cartoon','/rock','/urbanas'].map(path=>({url:ORIGIN+path})),
    ...[...new Set(animeProducts.map(p=>animeLinePath[p.line]+'/'+animeCategorySlug(p.category)))].map(path=>({url:ORIGIN+path})),
    ...animeProducts.map(p=>({url:ORIGIN+animeProductHref(p)}))
  ];
}
