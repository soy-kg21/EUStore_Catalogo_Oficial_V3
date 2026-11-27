import {catalogCollections} from './catalog-collections';

export const ORIGIN=(process.env.NEXT_PUBLIC_SITE_URL||'https://www.evolucionurbana.store').replace(/\/$/,'');
export const WHATSAPP='573112231940';
export const generalCatalogCategories = {
  camisetas: {slug: 'camisetas', name: catalogCollections.oversize.name, collection: 'oversize', path: catalogCollections.oversize.path, detail: 'Siluetas amplias. Actitud propia.'},
  zapatillas: {slug: 'zapatillas', name: 'Zapatillas', collection: 'nacionales', path: catalogCollections.nacionales.path, detail: 'Tu próximo paso empieza aquí.'},
  conjuntos: {slug: 'conjuntos', name: 'Conjuntos', collection: 'conjuntos-cortos', path: catalogCollections['conjuntos-cortos'].path, detail: 'Un look completo, a tu manera.'},
} as const;
export const categories = Object.values(generalCatalogCategories);

export type GeneralCatalogCategory = (typeof categories)[number];
export const money=(n:number)=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
export const wa=(message:string)=>`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
