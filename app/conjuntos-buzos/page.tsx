import {permanentRedirect} from 'next/navigation';
import {catalogCollections} from '@/lib/catalog-collections';
import {catalogQueryString, type Params} from '@/lib/product-query';

export default async function Page({searchParams}: {searchParams: Promise<Params>}) {
  permanentRedirect(catalogCollections['conjuntos-buzos'].path + catalogQueryString(await searchParams));
}
