import Catalog from '@/components/store/Catalog';
import {catalogCollections} from '@/lib/catalog-collections';
import {generalCatalogCategories} from '@/lib/config';
import type {Params} from '@/lib/products';
import {metadata as meta} from '@/lib/seo';

const category = generalCatalogCategories.conjuntos;
export const metadata = meta(catalogCollections[category.collection].name + ' | Evolución Urbana Store', category.detail, category.path);

export default async function Page({searchParams}: {searchParams: Promise<Params>}) {
  return <Catalog category={category} params={await searchParams}/>;
}
