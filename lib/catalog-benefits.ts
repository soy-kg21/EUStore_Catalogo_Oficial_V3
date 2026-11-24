export const SOCKS_GIFT_BENEFIT = 'Medias de obsequio';

export function withSocksGift(benefits: string[], eligible: boolean): string[] {
  const otherBenefits = benefits.filter(benefit =>
    !/^(?:incluye\s+)?medias\s+de\s+(?:obsequio|regalo)[.!]?$/i.test(benefit.trim()),
  );
  return eligible ? [SOCKS_GIFT_BENEFIT, ...otherBenefits] : otherBenefits;
}
