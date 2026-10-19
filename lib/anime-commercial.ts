// Precios confirmados por el propietario. La selección Anime Shop se cotiza aparte.
export const animePublicTotals = [68000, 93000, 126000, 152000, 180000] as const;
// Compatibilidad con consumidores anteriores: todos reciben la tarifa vigente.
export const animeRegularTotals = animePublicTotals;
export const animeWholesaleTiers = [
  {from:6,to:11,unit:32000},
  {from:12,to:23,unit:29000},
  {from:24,to:48,unit:26000},
] as const;
export const animeCommercial = {
  unitPrice:68000, promoQuantity:2, promoTotal:93000, currency:'COP',
  promoLabel:'2 POR $93.000', unitLabel:'1 und. $68.000',
  conditions:'Promoción pública vigente de Anime Shop. Envío estándar incluido de 1 a 5 camisetas y contraentrega sujetos a cobertura y validación.',
} as const;
export function animeQuote(quantity:number, _channel:'public'|'regular'='public') {
  if(!Number.isSafeInteger(quantity)||quantity<1)throw new Error('Cantidad inválida');
  if(quantity<=5){const merchandise=animePublicTotals[quantity-1];return {quantity,merchandise,unit:merchandise/quantity,advance:false,shippingPending:false,requiresHuman:false};}
  const tier=animeWholesaleTiers.find(({from,to})=>quantity>=from&&quantity<=to);
  if(tier)return {quantity,merchandise:quantity*tier.unit,unit:tier.unit,advance:true,shippingPending:true,requiresHuman:false};
  return {quantity,merchandise:null,unit:null,advance:true,shippingPending:true,requiresHuman:true};
}
