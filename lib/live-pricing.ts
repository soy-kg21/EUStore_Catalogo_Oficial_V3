import {importedUnit, retailShipping} from './retail-shipping.mjs';
import {catalogSizeVariant} from './shoe-sizes';
import type {CartLine, Product} from './types';

type PricingProduct = Pick<Product, 'id' | 'price' | 'variants' | '_live' | 'collection' | 'sizeSystem'>;
const oversized = /^(XXL|[2-9]XL|XXX+L)$/i;

export function quoteLive<T extends PricingProduct>(lines: CartLine[], products: T[], options: {specialSizes?: boolean} = {}) {
  const byId = new Map(products.map(product => [product.id, product]));
  const seen = new Set<string>();
  const dispatchIds = new Map<string, number>();
  const rows = lines.map(line => {
    const product = byId.get(line.id);
    const variant = catalogSizeVariant(product?.variants??[],line.size,product?.collection==='importadas'?product.sizeSystem:undefined);
    const key = JSON.stringify([line.id,variant?.size]);
    if (!product?._live || !variant || seen.has(key) || !Number.isInteger(line.quantity)
      || line.quantity < 1 || line.quantity > 100 || (variant.quantity !== null && line.quantity > variant.quantity)) {
      throw Error('Revisa referencia, talla y cantidad disponible.');
    }
    seen.add(key);
    const bucket = product._live.bucket;
    if (!dispatchIds.has(bucket)) dispatchIds.set(bucket, dispatchIds.size + 1);
    return {...line, product, dispatch: dispatchIds.get(bucket)!, unit: product.price as number | null,
      total: null as number | null, reason: ''};
  });
  const count = rows.reduce((sum, row) => sum + row.quantity, 0);
  const special = options.specialSizes && rows.some(row => oversized.test(row.size.trim()));
  const reasons = new Set<string>();
  const dispatches = [...dispatchIds].map(([bucket, id]) => {
    const group = rows.filter(row => row.dispatch === id);
    const quantity = group.reduce((sum, row) => sum + row.quantity, 0);
    const imported = group.some(row => row.product._live!.retailShipping === 'importadas');
    const sets = group.some(row => row.product._live!.retailShipping === 'conjuntos-cortos');
    const other = sets && group.some(row => row.product._live!.retailShipping !== 'conjuntos-cortos');
    const totalRules = new Map<string, typeof rows>();
    for (const row of group) {
      const policy = row.product._live!;
      const rule = policy.rule;
      if (special) row.unit = null;
      else if (imported) row.unit = importedUnit(row.product.price, quantity);
      else if (rule?.kind === 'total') {
        const key = JSON.stringify(rule);
        const sameRule = totalRules.get(key) ?? [];
        sameRule.push(row);
        totalRules.set(key, sameRule);
        continue;
      } else if (!policy.perUnit) {
        if (policy.quoteFrom !== null && quantity >= policy.quoteFrom) row.unit = null;
        else if (quantity >= 6) row.unit = rule?.wholesale.find(([min, max]) => quantity >= min && quantity <= max)?.[2] ?? null;
        else if (rule) row.unit = rule.mixed && (rule.mixedScope === 'bucket' ? quantity : count) >= 2
          ? rule.mixed : rule.retail[quantity - 1];
      }
      row.total = row.unit === null ? null : row.unit * row.quantity;
    }
    for (const group of totalRules.values()) {
      const rule = group[0].product._live!.rule!;
      const n = group.reduce((sum, row) => sum + row.quantity, 0);
      const tier = rule.wholesale.find(([min, max]) => n >= min && n <= max);
      const total = n <= 5 ? rule.retail[n - 1] : tier ? n * tier[2] : null;
      let assigned = 0;
      group.forEach((row, index) => {
        row.total = total === null ? null : index === group.length - 1 ? total - assigned : Math.floor(total * row.quantity / n);
        assigned += row.total ?? 0;
        row.unit = row.total === null ? null : row.total / row.quantity;
      });
    }
    if (group.some(row => row.total === null)) {
      reasons.add(special ? 'Desde XXL: encargo con recargo por confirmar y pago anticipado.'
        : 'Esta cantidad requiere una cotización personalizada.');
    }
    const shipping = imported || sets ? retailShipping(quantity, imported, sets, other)
      : group.some(row => quantity >= row.product._live!.shippingFrom) ? null : 0;
    if (bucket === '39ee572347a7732f37ac5f40' && quantity >= 4 && quantity <= 5) {
      reasons.add('El asesor confirmará el recargo logístico de $16.000 a $20.000 para este despacho.');
    }
    return {id, quantity, shipping, advance: Boolean(special || imported || quantity >= 6
      || group.some(row => row.product._live!.advance))};
  });

  const shippingPending = dispatches.some(dispatch => dispatch.shipping === null);
  const shipping = shippingPending ? null : dispatches.reduce((sum, dispatch) => sum + (dispatch.shipping ?? 0), 0);
  const subtotal = rows.some(row => row.total === null) ? null : rows.reduce((sum, row) => sum + (row.total ?? 0), 0);
  const total = subtotal === null || shipping === null ? null : subtotal + shipping;
  return {rows, dispatches, subtotal, shipping, total, requiresQuote: total === null,
    pricePending: subtotal === null, shippingPending, reasons: [...reasons],
    advance: dispatches.some(dispatch => dispatch.advance), warehouses: [...dispatchIds.keys()], b1: 0, b2: 0, b5: 0};
}
