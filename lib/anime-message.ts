import type {AnimeSelection} from './anime-selection-core';
import type {AnimeClientProduct} from './anime-catalog-core';
import {animeQuote} from './anime-commercial';
import {animeProductHref} from './anime-routes';
import {money} from './config';
import {productReference} from './product-content';
export function animeSelectionMessage(rows:AnimeSelection[],products:AnimeClientProduct[],origin:string,confirmedQuote?:ReturnType<typeof animeQuote>|null){
 const byId=new Map(products.map(p=>[p.id,p])),quantity=rows.reduce((n,row)=>n+row.quantity,0);if(!quantity)return '';
 const quote=confirmedQuote||animeQuote(quantity);
 const lines=rows.map((row,n)=>{const product=byId.get(row.id);return `${n+1}. ${product?productReference(product)||'Referencia por confirmar':row.id} — ${product?.name||'Camiseta'}\nTalla: ${row.size||'por confirmar'} · Cantidad: ${row.quantity}\n${new URL(animeProductHref(product||row.id),origin).href}`;});
 return ['Hola Evolución Urbana 👕','Quiero confirmar este combo de Anime Shop:',lines.join('\n\n'),`${quantity} ${quantity===1?'camiseta':'camisetas'}\n${quote.merchandise===null?'Total: cotización personalizada':`Total camisetas: ${money(quote.merchandise)} COP`}`,quote.shippingPending?'Pago anticipado. Transporte separado por cotizar.':'Envío estándar incluido y contraentrega sujetos a cobertura y validación.','Quiero confirmar disponibilidad, tallas y entrega en mi ciudad.'].join('\n\n');
}
