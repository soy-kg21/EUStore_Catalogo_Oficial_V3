import {getLiveCatalog} from '@/lib/live-catalog';
import {toLiveGeneral} from '@/lib/live-products';
import ProductCard from '@/components/store/ProductCard';
import CollectionComingSoon from '@/components/store/CollectionComingSoon';
import {metadata as meta} from '@/lib/seo';
export const metadata=meta('Zapatillas importadas | Evolución Urbana','Explora modelos, colores, tallas y precios de zapatillas importadas. Elige tu próximo par con asesoría de Evolución Urbana.','/zapatillas-importadas');
export default async function Page(){
 const live=await getLiveCatalog();
 const products=(live?.products.filter(p=>p.section==='importadas')||[]).sort((a,b)=>a.position-b.position).map(toLiveGeneral);
 return products.length?<main id="contenido" className="page-main"><div className="section-heading"><h1>Zapatillas importadas</h1><p>Explora modelos, colores y tallas. Confirma la disponibilidad de tu favorito.</p></div><div className="product-grid">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div></main>:<CollectionComingSoon category="zapatillas"/>;
}
