import Catalog from '@/components/store/Catalog';import {metadata as meta} from '@/lib/seo';import type {Params} from '@/lib/products';
export const metadata=meta('Catálogo | Evolución Urbana Store','Explora camisetas, zapatillas y conjuntos. Filtra por talla, color, marca y precio.','/catalogo');
export default async function Page({searchParams}:{searchParams:Promise<Params>}){return <Catalog params={await searchParams}/>}
