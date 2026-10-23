import {notFound,permanentRedirect} from 'next/navigation';
import {resolveLiveAnimeProduct} from '@/lib/live-products';
import {animeProductHref} from '@/lib/anime-routes';
// Compatibility only: no product, sitemap or share button publishes this path.
export default async function PreviousLink({params}:{params:Promise<{id:string}>}){const product=await resolveLiveAnimeProduct((await params).id);if(!product)notFound();permanentRedirect(animeProductHref(product.id));}
