import Link from 'next/link';
import {getAnimeProducts} from '@/lib/live-products';
import {getProducts, queryProducts, type Params} from '@/lib/products';
import type {GeneralCatalogCategory} from '@/lib/config';
import {searchCatalog, type CatalogMatch} from '@/lib/catalog-search';
import {catalogCollections, catalogSearchPath, categoryProducts} from '@/lib/catalog-collections';
import {orderedShoeSizes} from '@/lib/shoe-sizes';
import CatalogHeading from './CatalogHeading';
import CatalogNavigation from './CatalogNavigation';
import CatalogPageScroll from './CatalogPageScroll';
import CatalogLoadMore from './CatalogLoadMore';
import ProductCard from './ProductCard';
import AnimeSearchCard from './AnimeSearchCard';
import dockStyles from './catalog-dock.module.css';

export default async function Catalog({params, category}: {params: Params; category?: GeneralCatalogCategory}) {
  const values = Object.fromEntries(Object.entries(params).map(([key, value]) => [key, typeof value === 'string' && value !== 'all' ? value : '']));
  const globalSearch = !category && Boolean(values.q?.trim());
  const [published, animeProducts] = await Promise.all([getProducts(), globalSearch ? getAnimeProducts() : []]);
  const all = category ? categoryProducts(published, category.slug) : published;
  const path = category?.path ?? catalogSearchPath;
  const categoryName = category && catalogCollections[category.collection].name;

  let result;
  if (globalSearch) {
    result = searchCatalog(all, animeProducts, values, values.hasta);
  } else {
    const general = queryProducts(all, values, category?.slug, values.hasta);
    const items = general.items.map(product => ({kind: 'general', product}) as CatalogMatch);
    result = {...general, items};
  }

  const sizes = [...new Set([...all.flatMap(product => product.sizes), ...animeProducts.flatMap(product => [...product.sizes])])];
  const options = {
    sizes: category?.slug === 'zapatillas' ? orderedShoeSizes(sizes) : sizes,
    colors: [...new Set(all.map(product => product.color))].sort(),
    brands: [...new Set(all.map(product => product.brand).filter((brand): brand is string => Boolean(brand)))].sort(),
  };

  return <main className="page-main" id="contenido">
    <CatalogHeading title={categoryName ?? 'Resultados de búsqueda.'} section={categoryName ?? 'Búsqueda'}
      detail={category?.detail ?? 'Encuentra tu referencia por nombre, marca o talla.'}/>
    <CatalogPageScroll page={result.page}/>
    <div className={`catalog-results ${dockStyles.results}`} data-catalog-start id={category ? 'catalogo-' + category.slug : undefined}>
      <section id="catalogo-resultados" aria-label="Productos del catálogo">
        <CatalogNavigation active={category?.collection} total={result.total} path={path} options={options} values={values}/>
        {result.items.length > 0
          ? <div className="product-grid" id="catalogo-productos">
            {result.items.map((match, index) => match.kind === 'anime'
              ? <AnimeSearchCard key={match.product.id} product={match.product} priority={index < 3}/>
              : <ProductCard key={match.product.id} product={match.product} priority={index < 3}/>)}
          </div>
          : <div className="empty-state" id="catalogo-productos">
            <h2>No encontramos coincidencias.</h2>
            <p>Prueba otra talla, nombre o rango de precio.</p>
            <Link className="button" href={category?.path ?? '/catalogo'}>{category ? 'VER TODOS' : 'EXPLORAR CATEGORÍAS'}</Link>
          </div>}
        <CatalogLoadMore path={path} values={values} shown={result.items.length} total={result.total} page={result.page} pages={result.pages}/>
      </section>
    </div>
  </main>;
}
