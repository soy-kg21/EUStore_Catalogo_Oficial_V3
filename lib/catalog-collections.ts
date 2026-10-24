import type {Product} from './types';

export const catalogCollections={
  nacionales:{name:'Zapatillas nacionales',label:'LÍNEA NACIONAL',path:'/categoria/zapatillas#catalogo-zapatillas',search:'zapatillas nacionales calzado nacional'},
  importadas:{name:'Zapatillas importadas',label:'LÍNEA IMPORTADA',path:'/zapatillas-importadas',search:'zapatillas importadas calzado importado'},
  'conjuntos-buzos':{name:'Buzos y sudaderas',label:'BUZOS Y SUDADERAS',path:'/conjuntos-buzos',search:'buzos sudaderas conjuntos de buzos y sudaderas hoodies'},
  oversize:{name:'Camisetas oversize',label:'OVERSIZE · 270G',path:'/categoria/camisetas',search:'camisetas oversize 270g 270 g'},
  'conjuntos-cortos':{name:'Camiseta + pantaloneta',label:'CAMISETA + PANTALONETA',path:'/categoria/conjuntos#catalogo-conjuntos',search:'conjuntos camiseta pantaloneta'},
} as const;
export type CatalogCollection=keyof typeof catalogCollections;
export const collectionSearchText=(p:Product)=>p.collection?catalogCollections[p.collection].search:'';
export const productCollectionPath=(p:Product)=>p.collection?catalogCollections[p.collection].path:'/categoria/'+p.category;

/** Category entry points keep each retail line separate; /catalogo still shows all. */
export function categoryProducts(products:Product[],category:string){
  return products.filter(p=>p.category===category&&
    (category!=='zapatillas'||p.collection==='nacionales')&&
    (category!=='conjuntos'||p.collection!=='conjuntos-buzos'));
}
