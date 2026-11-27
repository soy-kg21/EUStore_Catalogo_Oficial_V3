import ImportedCatalog from '@/components/store/ImportedCatalog';
import {getImportedProducts,type Params} from '@/lib/products';
import {metadata as meta} from '@/lib/seo';
export const metadata=meta('Zapatillas importadas | Evolución Urbana','Explora modelos, colores, tallas y precios de zapatillas importadas. Elige tu próximo par con asesoría de Evolución Urbana.','/zapatillas-importadas');
export default async function Page({searchParams}:{searchParams:Promise<Params>}){
 const [products,params]=await Promise.all([getImportedProducts(),searchParams]);
 return <ImportedCatalog products={products} params={params}/>;
}
