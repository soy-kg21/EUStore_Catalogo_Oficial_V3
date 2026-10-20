import type {AnimeClientProduct} from '@/lib/anime-catalog-core';
import {animeImageProps,animeCardImageSizes} from '@/lib/anime-image';

type Props={product:Pick<AnimeClientProduct,'id'|'image'|'thumbnail'>;alt:string;sizes?:string;eager?:boolean;priority?:boolean;className?:string};
export default function AnimeCatalogImage({product,alt,sizes=animeCardImageSizes,eager=false,priority=false,className}:Props){
 return <img {...animeImageProps(product)} alt={alt} sizes={sizes} className={className}
  loading={eager||priority?'eager':'lazy'} decoding="async" fetchPriority={priority?'high':'auto'}
  style={{position:'absolute',inset:0,width:'100%',height:'100%'}}/>;
}
