import {animeQuote} from './anime-commercial';
import {getLiveAnimePricing} from './live-products';
import {money, wa} from './config';
import {getProducts} from './products';
import {quote} from './pricing';
import {importedReductions, retailShipping} from './retail-shipping.mjs';
import type {CartLine, Product} from './types';

const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const basicWords = new Set('de del los las el la es que quiero quisiera cuanto cuesta valen vale precio para con por llevo cuales cual puedo una unos unas dos tres cuatro cinco seis par pares camiseta camisetas conjuntos conjunto zapatos zapatillas oversize importadas nacionales comprar envio envios combo combos descuento descuentos hola puedo voy tengo mi carrito armar'.split(' '));
const quantities: Record<string, number> = {un:1, uno:1, una:1, dos:2, tres:3, cuatro:4, cinco:5, seis:6, siete:7, ocho:8, nueve:9, diez:10};

export type KeiProduct = {id: string; name: string; href: string; price: number; sharedDispatch: boolean};
export type KeiResponse = {text: string; products: KeiProduct[]; productId?: string; human?: string; opening?: string};

function asProduct(product: Product, anchor: Product | undefined): KeiProduct {
  return {id: product.id, name: product.name, href: '/producto/'+product.slug, price: product.price,
    sharedDispatch: Boolean(anchor?._live && product._live?.bucket===anchor._live.bucket)};
}

export async function keiAnswer(message: string, lines: CartLine[], pathname: string, previousId?: string): Promise<KeiResponse> {
  const all = await getProducts();
  const eligible = all.filter(product => product.stock !== 0);
  const text = normalize(message);
  const quantityMatch = /\b(\d{1,2}|un[ao]?|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+(?:cartas|pares?|camisetas?|conjuntos?|unidades?|prendas?|zapatillas?)/.exec(text)
    ?? /^\s*(?:y\s+)?(\d{1,2}|uno|dos|tres|cuatro|cinco|seis)\s*[?!.]*$/.exec(text);
  const quantity = quantityMatch ? quantities[quantityMatch[1]] ?? Number(quantityMatch[1]) : undefined;
  const collection = /importad/.test(text) ? 'importadas' : /nacional/.test(text) ? 'nacionales'
    : /oversize/.test(text) ? 'oversize' : /buzo|sudadera/.test(text) ? 'conjuntos-buzos'
    : /conjunto|pantaloneta/.test(text) ? 'conjuntos-cortos' : undefined;
  const contact = wa('Hola, vengo del chat de KEI y quisiera confirmar precios, tallas y entrega.');
  const selection = lines.flatMap(line => eligible.find(product => product.id === line.id) ?? []);
  const current = eligible.find(product => '/producto/'+product.slug === pathname)
    ?? eligible.find(product => product.id === previousId);
  const anchor = current ?? selection[0];
  const sameDispatch = /mism[oa]|despacho|bodega|combin|beneficio|ahorr/.test(text);
  const checkout = /carrito|seleccion|mi pedido/.test(text);
  const candidates = eligible.filter(product => !collection || product.collection === collection);
  const terms = text.split(/[^a-z0-9]+/).filter(word => word.length > 1 && !basicWords.has(word) && !/^\d+$/.test(word));
  const matches = candidates.map(product => {
    const description = normalize([product.name, product.brand, product.color, product.reference].join(' '));
    const score = terms.filter(term => description.includes(term)).length;
    return {product, score};
  }).filter(item=>item.score).sort((a,b)=>b.score-a.score);
  const named = matches[0]?.product;
  const peers = (base: Product | undefined) => candidates
    .filter(product => !selection.includes(product) && product.id!==base?.id
      && (!base?._live || base._live.bucket===product._live?.bucket))
    .slice(0,4).map(product=>asProduct(product,base));

  if (/\b(asesor|humano|whatsapp)\b/.test(text) && !checkout) {
    return {text:'Claro. Te paso con el equipo para confirmar talla, cobertura y entrega.',products:[],human:contact};
  }
  if (checkout && lines.length) {
    try {
      const result = quote(lines,all);
      const split = result.dispatches.length>1;
      const products = [...new Map(selection.map(product=>[product._live?.bucket,product])).values()]
        .flatMap(product=>peers(product).slice(0,2)).slice(0,4);
      const dispatches = result.dispatches.map(group =>
        `Despacho ${group.id} · ${group.quantity} und. · ${group.shipping===null?'envío por confirmar':group.shipping===0?'envío incluido':'envío '+money(group.shipping)} · ${group.advance?'pago anticipado':'contraentrega según cobertura'}`);
      return {text:[
        split?'Tu selección tiene despachos separados. Cada uno conserva su propio descuento y envío.':'Veamos tu selección y los beneficios que ya tienes.',
        result.subtotal===null?'Hay productos por cotizar.':'Productos: '+money(result.subtotal),
        ...dispatches,
        result.total===null?'Te ayudo a continuar con un asesor para cerrar la cotización.':'Total: '+money(result.total),
        products.length?'Te dejo opciones que comparten despacho con alguna de tus referencias.':'',
      ].filter(Boolean).join('\n'),products,human:result.requiresQuote?contact:undefined};
    } catch {
      return {text:'Alguna referencia de la selección necesita revisión de talla o cantidad. Abre el carrito para ajustar esos datos.',products:[],human:contact};
    }
  }
  if (/anime|cartoon|manga/.test(text) || /^\/(anime|shop)(\/|$)/.test(pathname) && quantity && !collection && !named) {
    const pricing = await getLiveAnimePricing();
    const count = quantity && quantity>0 ? quantity : 2;
    const result = animeQuote(count,'public',pricing);
    return {text:result.merchandise===null?'Para esa cantidad, un asesor te confirma el precio de Anime Shop.'
      : `${count} ${count===1?'camiseta':'camisetas'} de Anime Shop por ${money(result.merchandise)}. Puedes combinar diseños de la colección. ${result.shippingPending?'El envío se cotiza y el pago es anticipado.':'Envío estándar incluido y contraentrega sujetos a cobertura.'}`,
      products:[],human:result.requiresHuman||result.shippingPending?contact:undefined};
  }
  if (collection==='importadas' && /envio|entrega|pago|contraentrega/.test(text) && !quantity && !named) {
    const tiers = [2,3,4,5].map(n=>`${n} pares · ${money(importedReductions[n-1])} menos por par · ${n===2?'envío incluido':'envío '+money(retailShipping(n,true,false,false)!)}`);
    return {text:['Todas las importadas se pagan por anticipado. Un par tiene envío incluido, sujeto a cobertura.',...tiers,
      'Puedes combinar modelos importados. Desde 6 pares el equipo cotiza precio y envío.'].join('\n'),products:peers(undefined)};
  }
  const product = named ?? (anchor && (!collection || anchor.collection===collection) ? anchor : undefined) ?? (collection ? candidates[0] : undefined);
  if (quantity && quantity>0 && product) {
    const variant = product.variants?.find(item => item.quantity===null || item.quantity>=quantity);
    if (variant) {
      const result = quote([{id:product.id,size:variant.size,quantity}],all);
      const row = result.rows[0];
      return {text:row.unit===null?`Para ${quantity} unidades de ${product.name}, te acompaño con un asesor para confirmar la tarifa.`
        : `${product.name} · ${quantity} und. a ${money(row.unit)} c/u.\nProductos: ${money(result.subtotal!)}. ${result.shipping===null?'Envío por confirmar.':result.shipping===0?'Envío incluido según cobertura.':'Envío: '+money(result.shipping)+'.'} ${result.total===null?'':'Total: '+money(result.total)+'.'} ${result.advance?'Pago anticipado.':''}`,
        products:[asProduct(product,anchor)],productId:product.id,human:result.requiresQuote?contact:undefined};
    }
  }
  if (sameDispatch && anchor) {
    const products = peers(anchor);
    return {text:products.length?`Para aprovechar la cantidad de tu despacho, puedes combinar ${anchor.name} con estas referencias. El carrito aplica la tarifa de cada una y el envío correspondiente.`
      :'Cuéntame cuál referencia quieres combinar y reviso qué modelos comparten despacho.',products,productId:anchor.id};
  }
  if (/combo/.test(text) && !product) {
    return {text:'Podemos armar un combo de zapatillas nacionales, importadas, Oversize o conjuntos. Dime qué te gustaría combinar o agrega un producto y te busco opciones del mismo despacho.',products:[]};
  }
  if (product && (collection || named || current)) {
    const options = (sameDispatch ? peers(product) : matches.length ? matches.slice(0,4).map(item=>asProduct(item.product,anchor))
      : candidates.filter(item=>item.collection===product.collection).slice(0,4).map(item=>asProduct(item,anchor)));
    return {text:`Te muestro opciones para tu look. ${product.name} está a ${money(product.price)} por unidad. Dime cuántas quieres y revisamos el total y el envío.`,
      products:options,productId:product.id};
  }
  return {text:checkout?'Todavía no veo productos en tu carrito. Puedo ayudarte a encontrar un par o a armar un combo que comparta despacho.'
    :'Soy KEI. Cuéntame qué quieres armar: unas zapatillas, una Oversize o un conjunto. Si ya tienes un modelo en mente, dime el nombre o la referencia y cuántas unidades quieres.',products:[]};
}
