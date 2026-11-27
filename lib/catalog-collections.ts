import type {Product} from './types';

export const catalogCollections = {
  nacionales: {
    name: 'Zapatillas nacionales',
    label: 'LÍNEA NACIONAL',
    path: '/zapatillas-nacionales',
    search: 'zapatillas nacionales calzado nacional',
  },
  importadas: {
    name: 'Zapatillas importadas',
    label: 'LÍNEA IMPORTADA',
    path: '/zapatillas-importadas',
    search: 'zapatillas importadas calzado importado',
  },
  'conjuntos-buzos': {
    name: 'Buzos y sudaderas',
    label: 'BUZOS Y SUDADERAS',
    path: '/buzos-y-sudaderas',
    search: 'buzos sudaderas conjuntos de buzos y sudaderas hoodies',
  },
  oversize: {
    name: 'Camisetas Oversize',
    label: 'OVERSIZE · 270G',
    path: '/camisetas-oversize',
    search: 'camisetas oversize camisetas urbanas 270g 270 g',
  },
  'conjuntos-cortos': {
    name: 'Camiseta + pantaloneta',
    label: 'CAMISETA + PANTALONETA',
    path: '/conjuntos-camiseta-pantaloneta',
    search: 'conjuntos camiseta pantaloneta',
  },
} as const;

export const catalogSections = {
  oversize: {
    ...catalogCollections.oversize,
    shortName: 'Oversize',
    image: '/media/categorias/categoria_camisetas_img1.webp',
    imagePosition: '78% 45%',
    badge: 'Corte amplio',
  },
  nacionales: {
    ...catalogCollections.nacionales,
    shortName: 'Nacionales',
    image: '/media/categorias/categoria_zapatillas_img1.webp',
    imagePosition: '76% 42%',
  },
  importadas: {
    ...catalogCollections.importadas,
    shortName: 'Importadas',
    image: '/media/collections/importadas-editorial.webp',
    imagePosition: '76% center',
  },
  'conjuntos-cortos': {
    ...catalogCollections['conjuntos-cortos'],
    shortName: 'Conjuntos',
    image: '/media/categorias/categoria_conjunto_cp_img1.webp',
    imagePosition: '75% 38%',
  },
  'conjuntos-buzos': {
    ...catalogCollections['conjuntos-buzos'],
    shortName: 'Buzos',
    image: '/media/collections/conjuntos-editorial.webp',
    imagePosition: '78% center',
  },
  anime: {
    name: 'Anime Shop',
    shortName: 'Anime Shop',
    path: '/anime',
    image: '/anime/universe/anime.webp',
    imagePosition: '62% center',
  },
} as const;

export type CatalogCollection = keyof typeof catalogCollections;
export type CatalogSection = keyof typeof catalogSections;
export const catalogSearchPath = '/catalogo/buscar';
export const collectionSearchText = (p: Product) => p.collection ? catalogCollections[p.collection].search : '';
const categoryPaths: Record<string, string> = {
  camisetas: catalogCollections.oversize.path,
  zapatillas: catalogCollections.nacionales.path,
  conjuntos: catalogCollections['conjuntos-cortos'].path,
};
export const productCollectionPath = (p: Product) => p.collection
  ? catalogCollections[p.collection].path
  : categoryPaths[p.category] ?? '/catalogo';

// Keep the existing product keys used by catalog publication and pricing.
export function categoryProducts(products: Product[], category: string) {
  return products.filter(p => p.category === category &&
    (category !== 'zapatillas' || p.collection === 'nacionales') &&
    (category !== 'conjuntos' || p.collection !== 'conjuntos-buzos'));
}
