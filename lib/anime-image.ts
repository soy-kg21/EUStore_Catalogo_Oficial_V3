import dimensions from '@/data/anime-image-dimensions.json';
import type {AnimeClientProduct} from './anime-catalog-core';
import {getImageProps} from 'next/image';

type ImageProduct=Pick<AnimeClientProduct,'id'|'image'|'thumbnail'>;
const records:Record<string,readonly number[]>=dimensions;
export const animeCardImageSizes='(max-width:700px) 48vw, (max-width:900px) 47vw, (max-width:1100px) 31vw, (max-width:1800px) 23vw, 500px';

/** Keep prepared thumbnails; resize published originals through the store's existing image optimizer. */
export function animeImageProps(product:ImageProduct,sizes=animeCardImageSizes){
 const record=records[product.id];
 const source=product.thumbnail||product.image;
 if((!product.thumbnail||product.thumbnail===product.image)&&/^\/(?!\/)/.test(source)){
  const {props}=getImageProps({src:source,alt:'',width:record?.[0]||800,height:record?.[1]||1000,sizes,quality:85});
  return {src:props.src,srcSet:props.srcSet,width:props.width,height:props.height};
 }
 if(!record)return {src:product.image,srcSet:undefined,width:undefined,height:undefined};
 const [width,height,thumbnailWidth]=record;
 const hasSmallerThumbnail=Boolean(product.thumbnail)&&thumbnailWidth<width;
 return {
  src:hasSmallerThumbnail?product.thumbnail:product.image,width,height,
  srcSet:hasSmallerThumbnail?`${product.thumbnail} ${thumbnailWidth}w, ${product.image} ${width}w`:undefined,
 };
}

/** Warm only an explicitly approached line, never every product detail route. */
export function warmAnimeImages(products:readonly ImageProduct[],sizes=animeCardImageSizes){
 if(typeof window==='undefined')return;
 const connection=(navigator as Navigator&{connection?:{saveData?:boolean;effectiveType?:string}}).connection;
 if(connection?.saveData||['slow-2g','2g'].includes(connection?.effectiveType||''))return;
 for(const product of products.slice(0,4)){
  const props=animeImageProps(product,sizes),image=new window.Image();
  image.decoding='async';image.fetchPriority='low';image.sizes=sizes;
  if(props.srcSet)image.srcset=props.srcSet;
  image.src=props.src;
 }
}
