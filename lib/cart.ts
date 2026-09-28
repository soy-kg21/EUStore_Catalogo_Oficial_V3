import type { CartLine } from './types';

const CART_KEY = 'eu-cart-v2';
const EMPTY_CART = '[]';

export function parseCart(snapshot: string): CartLine[] {
  try {
    const value: unknown = JSON.parse(snapshot || EMPTY_CART);

    return Array.isArray(value)
      ? value.filter(
          (line): line is CartLine =>
            typeof line?.id === 'string' &&
            typeof line?.size === 'string' &&
            Number.isInteger(line?.quantity) &&
            line.quantity > 0 &&
            line.quantity <= 100,
        )
      : [];
  } catch {
    return [];
  }
}

export const getCartSnapshot = () => {
  try { return localStorage.getItem(CART_KEY) ?? EMPTY_CART; }
  catch { return EMPTY_CART; }
};

export const getServerCartSnapshot = () => '';

export function subscribeCart(onChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === CART_KEY) onChange();
  };

  window.addEventListener('eu-cart', onChange);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('eu-cart', onChange);
    window.removeEventListener('storage', handleStorage);
  };
}

export const readCart = (): CartLine[] => parseCart(getCartSnapshot());

export function saveCart(rows: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event('eu-cart'));
}
