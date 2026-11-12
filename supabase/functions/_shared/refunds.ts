/**
 * Refund / dispute credit reversal policy:
 * - Credits removed are proportional to money returned: floor(granted * refunded / paid), never more than granted.
 * - Repeated/partial refunds only remove the difference from what was already reversed (idempotent, cumulative).
 * - Reversals never push a balance below zero; any unrecovered credits are reported as a shortfall for admin review.
 */
export function reversalFor(o: { granted: number; paid: number; returned: number; alreadyReversed: number; balance: number }) {
  if (o.granted <= 0 || o.paid <= 0 || o.returned <= 0) return { reverse: 0, shortfall: 0 };
  const target = Math.min(o.granted, Math.floor((o.granted * Math.min(o.returned, o.paid)) / o.paid));
  const need = Math.max(0, target - Math.max(0, o.alreadyReversed));
  const reverse = Math.min(need, Math.max(0, o.balance));
  return { reverse, shortfall: need - reverse };
}
