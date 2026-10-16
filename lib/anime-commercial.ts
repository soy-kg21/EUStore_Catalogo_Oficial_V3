// Fuente comercial Anime Shop confirmada por el propietario. Independiente del catálogo general.
export const animePublicTotals = [68000, 99000, 129000, 159000, 195000] as const;
export const animeRegularTotals = [68000, 108400, 146100, 169096, 211370] as const;
export const animeCommercial = {
  unitPrice:68000, promoQuantity:2, promoTotal:99000, currency:'COP',
  promoLabel:'2 POR $99.000', unitLabel:'1 und. $68.000',
  conditions:'Promoción pública vigente de Anime Shop. Envío estándar incluido de 1 a 5 camisetas y contraentrega sujetos a cobertura y validación.',
} as const;
export function animeQuote(quantity:number, channel:'public'|'regular'='public') {
  if(!Number.isInteger(quantity)||quantity<1)throw new Error('Cantidad inválida');
  if(quantity<=5)return {quantity,merchandise:(channel==='public'?animePublicTotals:animeRegularTotals)[quantity-1],unit:null,advance:false,shippingPending:false,requiresHuman:false};
  if(quantity<=23){const unit=quantity<=11?38400:33300;return {quantity,merchandise:quantity*unit,unit,advance:true,shippingPending:true,requiresHuman:false};}
  return {quantity,merchandise:null,unit:null,advance:true,shippingPending:true,requiresHuman:true};
}
