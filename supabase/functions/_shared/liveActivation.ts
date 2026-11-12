/** Pure rules for the one-time Live activation. Never includes secret values in output. */
export const CONFIRM_PHRASE = "ACTIVATE LIVE";
export const EXPECTED_PRICES = { creator: 1900, pro: 4900 } as const;

// deno-lint-ignore no-explicit-any
export function priceProblem(label: string, p: any, pence: number): string | null {
  if (!p) return `${label} Live price not found`;
  if (p.livemode !== true) return `${label} price is not a Live price`;
  if (p.active !== true) return `${label} price is archived`;
  if (p.currency !== "gbp") return `${label} price is not in GBP`;
  if (p.unit_amount !== pence) return `${label} price should be £${pence / 100}/month`;
  if (p.recurring?.interval !== "month" || (p.recurring?.interval_count ?? 1) !== 1) return `${label} price must bill monthly`;
  return null;
}

/** Stripe resources the key must be able to use, with the dashboard permission name to grant. */
export const PERMISSIONS: { name: string; grant: string }[] = [
  { name: "customers", grant: "Customers: Write" },
  { name: "checkout", grant: "Checkout Sessions: Write" },
  { name: "prices", grant: "Prices: Read" },
  { name: "subscriptions", grant: "Subscriptions: Write" },
  { name: "invoices", grant: "Invoices: Read" },
  { name: "portal", grant: "Customer portal: Write" },
];

export function confirmationOk(text: unknown): boolean {
  return typeof text === "string" && text.trim() === CONFIRM_PHRASE;
}
