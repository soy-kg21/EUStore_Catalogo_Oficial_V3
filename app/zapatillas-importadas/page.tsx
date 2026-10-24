import ImportedCatalog from '@/components/store/ImportedCatalog';
import {getLiveCatalog} from '@/lib/live-catalog';
import {toLiveGeneral} from '@/lib/live-products';
import type {Params} from '@/lib/products';
import {metadata as meta} from '@/lib/seo';
export const metadata=meta('Zapatillas importadas | Evolución Urbana','Explora modelos, colores, tallas y precios de zapatillas importadas. Elige tu próximo par con asesoría de Evolución Urbana.','/zapatillas-importadas');
export default async function Page({searchParams}:{searchParams:Promise<Params>}){
 const live=await getLiveCatalog();
 const products=(live?.products.filter(p=>p.section==='importadas')||[]).sort((a,b)=>a.position-b.position).map(toLiveGeneral);
 return <ImportedCatalog products={products} params={await searchParams}/>;
}
