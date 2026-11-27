import {quoteLive} from './live-pricing';
import type {CartLine, Product} from './types';
import {ruleOf, withCommercial} from './commercial';

const buckets: Record<string, string> = {
  B1:'ac2c5a647314030aca259625', B2:'b59911216dae93e2b58ad8f1', B3:'39ee572347a7732f37ac5f40',
  B4:'2620dd993a9eaa70a3c90fe0', B5:'05174c6880fa3ccb9b1991ea', B6:'17025e42553b9818edde10de',
  B7:'fac51e9dcf81cf856afda292',
};

export function quote(lines: CartLine[], products: Product[]) {
  const selected = new Set(lines.map(line => line.id));
  const eligible = products.filter(product => selected.has(product.id) && product.state !== 'inactive');
  return quoteLive(lines, eligible.map(product => {
    if (product._live) return product;
    const current = withCommercial(product);
    const rule = ruleOf(current);
    const warehouse = current.warehouse ?? '';
    return {...current, variants: current.variants ?? current.sizes.map(size => ({size, quantity: null})),
      _live: {bucket: buckets[warehouse] ?? 'legacy-' + warehouse,
        rule: rule ? {kind: 'unit' as const, retail: rule.retail, wholesale: rule.wholesale ?? [],
          mixed: rule.mixed, mixedScope: rule.mixedScope === 'warehouse' ? 'bucket' : 'cart'} : null,
        quoteFrom: ['B1', 'B2', 'B3', 'B4'].includes(warehouse) ? 6 : null,
        shippingFrom: warehouse === 'B3' ? 4 : 6, advance: warehouse === 'B4',
        retailShipping: warehouse === 'B4' ? 'importadas' as const
          : warehouse === 'B5' && current.category === 'conjuntos' ? 'conjuntos-cortos' as const : undefined}};
  }));
}
