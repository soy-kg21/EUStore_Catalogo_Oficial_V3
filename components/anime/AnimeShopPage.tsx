import {animeProducts,toAnimeClientProduct,animeLines,type AnimeFilters,type AnimeLine} from '@/data/anime-products';
import {getAnimeProducts,getLiveAnimePricing} from '@/lib/live-products';
import {animeCommercialFor} from '@/lib/anime-commercial';
import {animeExperience} from '@/lib/anime-experience';
import AnimeShopClient from './AnimeShopClient';
import AnimePrices from './AnimePrices';
import AnimeSocialLinks from './AnimeSocialLinks';
import styles from './shop-premium.module.css';
import socialStyles from './anime-social.module.css';
export default async function AnimeShopPage({filters}:{filters:AnimeFilters}){
 const animeProducts=await getAnimeProducts(),promo=animeCommercialFor(await getLiveAnimePricing());
 const line=animeLines.find(item=>item.id===filters.linea),experience=animeExperience[line?.id||'shop'];
 const products=animeProducts,heroProducts=experience.heroIds.flatMap(id=>{const p=animeProducts.find(p=>p.id===id);return p?[toAnimeClientProduct(p)]:[];});
 const counts=Object.fromEntries(animeLines.map(item=>[item.id,animeProducts.filter(p=>p.line===item.id).length])) as Record<AnimeLine,number>;
 const search=new URLSearchParams({linea:filters.linea,categoria:filters.categoria,q:filters.q});if(filters.doble)search.set('estampado','doble');
 // Appending cards must push the button down, rather than anchor the viewport to it.
 return <main id="contenido" style={{overflowAnchor:'none'}} className={`${styles.shell} ${socialStyles.page}`}>
  <AnimeShopClient products={products.map(toAnimeClientProduct)} initialSearch={`?${search}`} counts={counts} hero={{promoLabel:promo.promoLabel,products:heroProducts,division:experience.eyebrow,title:experience.title,description:experience.description}}/>
  <AnimePrices/>
  <AnimeSocialLinks/>
 </main>;
}
