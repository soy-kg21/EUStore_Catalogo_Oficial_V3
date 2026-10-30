import {getAnimeProducts} from '@/lib/live-products';
import {getLiveCatalog} from '@/lib/live-catalog';
import {toAnimeQuoteProduct} from '@/lib/anime-quote-product';
import {quoteLive} from '@/lib/live-pricing';
import {animeQuote,animePublicTotals,animeWholesaleTiers} from '@/lib/anime-commercial';
export async function POST(request:Request){try{
 const raw=await request.text();if(raw.length>24000)throw Error();const lines=JSON.parse(raw);if(!Array.isArray(lines)||!lines.length||lines.length>100)throw Error();
 const live=await getLiveCatalog();let result;
 if(live&&(!live.partial||live.products.some(p=>p.section==='anime')||(live.removedRoutes||[]).some(p=>p.section==='anime'))){const published=live.products.filter(p=>p.section==='anime').map(toAnimeQuoteProduct),baseline=live.partial?await getAnimeProducts():[],products=[...published,...baseline.filter(p=>!p._live).map(p=>({id:p.id,name:p.name,price:p.price,sizes:[...p.sizes],variants:p.variants||p.sizes.map(size=>({size,quantity:null})),_live:{bucket:'fac51e9dcf81cf856afda292',rule:{kind:'total' as const,retail:[...animePublicTotals],wholesale:animeWholesaleTiers.map(t=>[t.from,t.to,t.unit])},quoteFrom:null,shippingFrom:6,advance:false}}))],quote=quoteLive(lines,products as Parameters<typeof quoteLive>[1]);result={quantity:lines.reduce((a,r)=>a+r.quantity,0),merchandise:quote.subtotal,unit:quote.subtotal===null?null:quote.subtotal/lines.reduce((a,r)=>a+r.quantity,0),advance:quote.advance,shippingPending:quote.shippingPending,requiresHuman:quote.subtotal===null};}
 else{const products=await getAnimeProducts(),seen=new Set();for(const row of lines){const p=products.find(p=>p.id===row.id),key=row.id+':'+row.size;if(!p||!p.sizes.includes(row.size)||!Number.isInteger(row.quantity)||row.quantity<1||row.quantity>99||seen.has(key))throw Error();seen.add(key);}result=animeQuote(lines.reduce((a,r)=>a+r.quantity,0));}
 return Response.json({quote:result},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Revisa los diseños, tallas y cantidades disponibles.'},{status:400,headers:{'Cache-Control':'no-store'}});}}
