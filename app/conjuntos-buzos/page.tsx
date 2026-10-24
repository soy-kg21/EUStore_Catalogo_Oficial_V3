import BuzosCatalog from '@/components/store/BuzosCatalog';
import {getProducts,type Params} from '@/lib/products';
import {metadata as meta} from '@/lib/seo';
export const metadata=meta('Conjuntos de buzos y sudaderas | Evolución Urbana','Explora buzos y sudaderas de Evolución Urbana. Encuentra referencias, tallas, colores y precios publicados. Elige tu conjunto con asesoría.','/conjuntos-buzos');
export default async function Page({searchParams}:{searchParams:Promise<Params>}){
  const products=(await getProducts()).filter(p=>p.collection==='conjuntos-buzos');
  return <BuzosCatalog products={products} params={await searchParams}/>;
}
