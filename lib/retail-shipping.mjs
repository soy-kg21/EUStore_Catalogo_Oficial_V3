// Keep this policy identical in V4 and BackOffice. Prices remain in their product or group records.
export const importedReductions = [0, 11000, 14000, 16000, 16000];
const importedShipping = [0, 0, 12000, 15000, 16000];
const setsShipping = [6000, 0, 0, 12600, 12600];

/** @param {number} price @param {number} quantity */
export function importedUnit(price, quantity) {
  const reduction = importedReductions[quantity - 1];
  return reduction === undefined || price <= reduction ? null : price - reduction;
}

/** @param {number} quantity @param {boolean} imported @param {boolean} sets @param {boolean} other */
export function retailShipping(quantity, imported, sets, other) {
  if (quantity > 5) return null;
  if (imported) return importedShipping[quantity - 1];
  if (!sets) return 0;
  return other ? 6000 + (quantity - 2) * 2500 : setsShipping[quantity - 1];
}
