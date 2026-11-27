import {redirect} from 'next/navigation';
import CatalogCategoryGrid from '@/components/store/CatalogCategoryGrid';
import CatalogHeading from '@/components/store/CatalogHeading';
import {catalogSearchPath, categoryProducts} from '@/lib/catalog-collections';
import {getAnimeProducts} from '@/lib/live-products';
import {catalogQueryString} from '@/lib/product-query';
import {getImportedProducts, getProducts, type Params} from '@/lib/products';
import {metadata as meta} from '@/lib/seo';

export const metadata = meta(
  'Catálogo | Evolución Urbana Store',
  'Explora las colecciones de camisetas Oversize, zapatillas, conjuntos y Anime Shop de Evolución Urbana.',
  '/catalogo',
);

const filterKeys = ['q', 'size', 'color', 'brand', 'max', 'availability', 'sort'];

export default async function Page({searchParams}: {searchParams: Promise<Params>}) {
  const params = await searchParams;
  if (filterKeys.some(key => {
    const value = params[key];
    return typeof value === 'string' && value.trim() && value !== 'all';
  })) {
    redirect(catalogSearchPath + catalogQueryString(params));
  }

  const [products, imported, anime] = await Promise.all([getProducts(), getImportedProducts(), getAnimeProducts()]);
  return <main id="contenido" className="page-main">
    <CatalogHeading/>
    <CatalogCategoryGrid counts={{
      oversize: categoryProducts(products, 'camisetas').length,
      nacionales: categoryProducts(products, 'zapatillas').length,
      importadas: imported.length,
      'conjuntos-cortos': categoryProducts(products, 'conjuntos').length,
      'conjuntos-buzos': products.filter(product => product.collection === 'conjuntos-buzos').length,
      anime: anime.length,
    }}/>
  </main>;
}
