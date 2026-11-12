/** Pure Stripe mode resolution. Live needs an explicit STRIPE_MODE=live AND all four valid Live settings. */
export type StripeEnv = Record<string, string | undefined>;
export type StripeConfig =
  | { mode: "test"; secretKey?: string; webhookSecret?: string; creatorPrice: string; proPrice: string }
  | { mode: "live"; secretKey: string; webhookSecret: string; creatorPrice: string; proPrice: string }
  | { mode: "misconfigured"; problems: string[] };

export const TEST_CREATOR = "price_1UaDVw9wksHmZlqMObItDTFY";
export const TEST_PRO = "price_1UaDWp9wksHmZlqMSo0QbIH6";

const CHECKS: [string, RegExp][] = [
  ["STRIPE_LIVE_SECRET_KEY", /^(sk|rk)_live_\w+$/],
  ["STRIPE_LIVE_WEBHOOK_SECRET", /^whsec_\w+$/],
  ["STRIPE_LIVE_PRICE_CREATOR", /^price_\w+$/],
  ["STRIPE_LIVE_PRICE_PRO", /^price_\w+$/],
];

/** Problems list only names settings, never their values. */
export function resolveStripeConfig(env: StripeEnv): StripeConfig {
  const wantLive = (env.STRIPE_MODE ?? "").trim().toLowerCase() === "live";
  if (!wantLive) {
    return { mode: "test", secretKey: env.STRIPE_TEST_SECRET_KEY, webhookSecret: env.STRIPE_WEBHOOK_SECRET, creatorPrice: TEST_CREATOR, proPrice: TEST_PRO };
  }
  const problems = CHECKS.filter(([k, re]) => !re.test((env[k] ?? "").trim())).map(([k]) => `${k} missing or invalid`);
  if (env.STRIPE_LIVE_PRICE_CREATOR && env.STRIPE_LIVE_PRICE_CREATOR === env.STRIPE_LIVE_PRICE_PRO) problems.push("Live Creator and Pro prices are identical");
  if ([TEST_CREATOR, TEST_PRO].some((p) => p === env.STRIPE_LIVE_PRICE_CREATOR || p === env.STRIPE_LIVE_PRICE_PRO)) problems.push("Live price is a Sandbox price");
  if (problems.length) return { mode: "misconfigured", problems };
  return {
    mode: "live", secretKey: env.STRIPE_LIVE_SECRET_KEY!.trim(), webhookSecret: env.STRIPE_LIVE_WEBHOOK_SECRET!.trim(),
    creatorPrice: env.STRIPE_LIVE_PRICE_CREATOR!.trim(), proPrice: env.STRIPE_LIVE_PRICE_PRO!.trim(),
  };
}

/** Billing runs only when the server config is complete AND the database switch agrees with it. */
export function billingBlockReason(cfg: StripeConfig, dbLive: boolean | null | undefined): string | null {
  if (cfg.mode === "misconfigured") return "Live Stripe configuration incomplete";
  if ((cfg.mode === "live") !== (dbLive === true)) return "Stripe mode and database billing switch disagree";
  return null;
}

/** Plans for the running mode only: Sandbox prices never map to a plan in Live, and vice versa. */
export function plansFor(cfg: StripeConfig): Record<string, { tier: "creator" | "pro"; credits: number }> {
  if (cfg.mode === "misconfigured") return {};
  return { [cfg.creatorPrice]: { tier: "creator", credits: 600 }, [cfg.proPrice]: { tier: "pro", credits: 2000 } };
}
