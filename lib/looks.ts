import definitions from '@/data/looks.json';
import type {Product} from './types';

export type LookPiece = Pick<Product, 'name' | 'slug' | 'images' | 'price' | 'pricingPending'>;
export type EditorialLook = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  image: string;
  note: string;
  pieces: LookPiece[];
};

// Resolve against the same live catalog as the product pages. No alternative
// product is silently substituted when an editorial reference is unavailable.
export function resolveLooks(products: Product[]): EditorialLook[] {
  return definitions.flatMap(({productIds, ...look}) => {
    const pieces = productIds.map(id => products.find(p => p.id === id && p.state !== 'inactive' && p.stock !== 0));
    if (pieces.some(piece => !piece)) return [];
    return [{...look, pieces: pieces.map(piece => {
      const {name, slug, images, price, pricingPending} = piece!;
      return {name, slug, images, price, pricingPending};
    })}];
  });
}
