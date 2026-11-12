/** Estimated £ value of a paid ledger line (credits → price). */
const SUB_PRICES: Record<number, number> = { 600: 19, 2000: 49, 1400: 30 }; // 1400 = Creator→Pro upgrade difference
export function poundsFor(reason: string, credits: number): number {
  if (credits <= 0) return 0;
  if (reason === "subscription") return SUB_PRICES[credits] ?? Math.round((credits / 2000) * 49 * 100) / 100;
  if (reason === "topup" || reason === "purchase") return credits / 25;
  return 0;
}
export const gbp = (n: number) => `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
