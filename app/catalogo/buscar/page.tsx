import Catalog from '@/components/store/Catalog';
import {catalogSearchPath} from '@/lib/catalog-collections';
import type {Params} from '@/lib/products';
import {metadata as meta} from '@/lib/seo';

export const metadata = {
  ...meta('Buscar en el catálogo | Evolución Urbana', 'Busca por nombre, marca o referencia.', catalogSearchPath),
  robots: {index: false, follow: true},
};

export default async function Page({searchParams}: {searchParams: Promise<Params>}) {
  return <Catalog params={await searchParams}/>;
}
