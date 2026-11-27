import BuzosCatalog from '@/components/store/BuzosCatalog';
import {catalogCollections} from '@/lib/catalog-collections';
import {getProducts, type Params} from '@/lib/products';
import {metadata as meta} from '@/lib/seo';

const {name, path} = catalogCollections['conjuntos-buzos'];
export const metadata = meta(
  name + ' | Evolución Urbana',
  'Explora referencias, colores y tallas para armar tu conjunto.',
  path,
);

export default async function Page({searchParams}: {searchParams: Promise<Params>}) {
  const [products, params] = await Promise.all([getProducts(), searchParams]);
  return <BuzosCatalog products={products.filter(product => product.collection === 'conjuntos-buzos')} params={params}/>;
}
