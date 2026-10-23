import {getLiveCatalog} from '@/lib/live-catalog';
import {toLiveGeneral} from '@/lib/live-products';
import ProductCard from '@/components/store/ProductCard';
import CollectionComingSoon from '@/components/store/CollectionComingSoon';
import {metadata as meta} from '@/lib/seo';
export const metadata=meta('Zapatillas importadas | Evolución Urbana','Conoce nuestra línea de zapatillas importadas. Consulta modelos, tallas y precios por WhatsApp mientras preparamos el catálogo web.','/zapatillas-importadas');
export default async function Page(){const live=await getLiveCatalog(),products=live?.products.filter(p=>p.section==="importadas").map(toLiveGeneral)||[];return products.length?<main id="contenido" className="page-main"><div className="section-heading"><h1>Zapatillas importadas</h1><p>Elige tu referencia y consulta sus condiciones de entrega.</p></div><div className="product-grid">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div></main>:<CollectionComingSoon category="zapatillas"/>;}
