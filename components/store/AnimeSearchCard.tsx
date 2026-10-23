import {animeProductHref} from '@/lib/anime-routes';
import Image from 'next/image';
import AnimeProductLink from '@/components/anime/AnimeProductLink';
import {ArrowUpRight} from 'lucide-react';
import type {AnimeProduct} from '@/lib/anime-catalog-core';
import {animeCommercial} from '@/lib/anime-commercial';
import {money} from '@/lib/config';

export default function AnimeSearchCard({product,priority=false}:{product:AnimeProduct;priority?:boolean}){
  const href=animeProductHref(product.id);
  return <article className="product-card">
    <AnimeProductLink productId={product.id} href={href} className="card-image">
      <Image src={product.thumbnail} alt={product.name} width={480} height={640} sizes="(max-width: 600px) 48vw, (max-width: 1000px) 32vw, 25vw" style={{objectFit:'contain'}} preload={priority} unoptimized/>
      <span className="card-label">CAMISETA · {product.line.toUpperCase()}</span>
      <span className="card-arrow"><ArrowUpRight size={19}/></span>
    </AnimeProductLink>
    <div className="card-info">
      <p>{product.category}</p><AnimeProductLink productId={product.id} href={href}><h3>{product.name}</h3></AnimeProductLink>
      <div className="price-stack"><strong>{money(product.price)} <small>COP</small></strong></div>
      <p className="product-benefits">{product.position===undefined?animeCommercial.promoLabel:product.offer?`${product.offer.quantity} por ${money(product.offer.total)}`:''}</p>
      <p className="product-benefits">{animeCommercial.conditions}</p>
      <span className="card-sizes">{product.sizes.join(' / ')}</span>
    </div>
  </article>;
}
