import {toAnimeClientProduct,animeLines,type AnimeFilters,type AnimeLine} from '@/data/anime-products';
import {getAnimeProducts} from '@/lib/live-products';
import AnimeShopClient from './AnimeShopClient';
import AnimePrices from './AnimePrices';
import AnimeSocialLinks from './AnimeSocialLinks';
import styles from './shop-premium.module.css';
import socialStyles from './anime-social.module.css';
export default async function AnimeShopPage({filters}:{filters:AnimeFilters}){
 const products=await getAnimeProducts();
 const counts=Object.fromEntries(animeLines.map(item=>[item.id,products.filter(p=>p.line===item.id).length])) as Record<AnimeLine,number>;
 const search=new URLSearchParams({linea:filters.linea,categoria:filters.categoria,q:filters.q});if(filters.doble)search.set('estampado','doble');
 // Appending cards must push the button down, rather than anchor the viewport to it.
 return <main id="contenido" style={{overflowAnchor:'none'}} className={`${styles.shell} ${socialStyles.page}`}>
  <AnimeShopClient products={products.map(toAnimeClientProduct)} initialSearch={`?${search}`} counts={counts}/>
  <AnimePrices/>
  <AnimeSocialLinks/>
 </main>;
}
