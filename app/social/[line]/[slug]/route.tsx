import {ImageResponse} from 'next/og';
import {resolveAnimeProduct} from '@/lib/anime-product-lookup';
import {animePublicRoutes} from '@/lib/anime-routes';
import {animeLines,type AnimeLine} from '@/lib/anime-catalog-core';
import {ORIGIN} from '@/lib/config';
export const runtime='nodejs';
export async function GET(_request:Request,{params}:{params:Promise<{line:string;slug:string}>}){
 const {line,slug}=await params;
 if(!animeLines.some(item=>item.id===line))return new Response('Referencia no encontrada',{status:404});
 const product=resolveAnimeProduct(slug,line as AnimeLine);
 if(!product||animePublicRoutes[product.id]?.slug!==slug||product.line!==line)return new Response('Referencia no encontrada',{status:404});
 // Only the configured site origin is fetched, never a URL provided by a visitor.
 const socialAsset=product.image.toLowerCase().endsWith('.webp')?`/anime/social/${product.id}.jpg`:product.image;
 let image:string|undefined;
 try{const response=await fetch(new URL(socialAsset,ORIGIN),{cache:'force-cache',signal:AbortSignal.timeout(8000)});if(response.ok&&response.headers.get('content-type')?.startsWith('image/'))image=`data:${response.headers.get('content-type')};base64,${Buffer.from(await response.arrayBuffer()).toString('base64')}`;}catch{/* A branded, accurate text card remains available if the asset is temporarily unreachable. */}
 const lineName=animeLines.find(item=>item.id===product.line)!.name;
 return new ImageResponse(<div style={{display:'flex',width:'100%',height:'100%',background:'#101610',color:'#f3f5eb',padding:40,fontFamily:'sans-serif'}}>
  <div style={{display:'flex',flexDirection:'column',width:580,padding:'16px 34px 14px 10px',justifyContent:'space-between'}}>
   <div style={{display:'flex',flexDirection:'column',gap:8}}><span style={{fontSize:18,letterSpacing:4,color:'#d1f649'}}>EVOLUCIÓN URBANA</span><span style={{fontSize:13,color:'#acbba1',letterSpacing:3}}>{lineName.toUpperCase()} / ANIME SHOP</span></div>
   <div style={{display:'flex',flexDirection:'column',gap:18}}><span style={{fontSize:17,color:'#b0c698'}}>{product.category}</span><span style={{fontSize:product.name.length>48?39:49,lineHeight:1.08,fontWeight:700}}>{product.name}</span></div>
   <div style={{display:'flex',flexDirection:'column',gap:14}}><span style={{fontSize:23,color:'#d1f649'}}>ELIGE LO QUE TE REPRESENTA.</span><span style={{fontSize:14,color:'#a7b39e'}}>evolucionurbana.store</span></div>
  </div>
  <div style={{display:'flex',width:530,height:550,background:'#e9ece2',borderRadius:5,alignItems:'center',justifyContent:'center',padding:12}}>{image?<img src={image} alt={product.name} width={506} height={526} style={{objectFit:'contain'}}/>:<span style={{fontSize:36,color:'#172414',padding:30}}>{product.name}</span>}</div>
 </div>,{width:1200,height:630,headers:{'Cache-Control':image?'public, max-age=3600, stale-while-revalidate=86400':'public, max-age=30','X-Content-Type-Options':'nosniff'}});
}
