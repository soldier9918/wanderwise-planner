/** Free vs Pro limits. Pro = any paid ledger row, or admin. */
export const FREE_VOICES = ["Kore", "Aoede", "Puck", "Charon"] as const;
export const FREE_MAX_SECONDS = 120;
export const FREE_MAX_SCENES = 6;
export const voiceAllowed = (voice: string, pro: boolean) => pro || (FREE_VOICES as readonly string[]).includes(voice);
export const lengthAllowedForTier = (seconds: number, pro: boolean) => pro || seconds <= FREE_MAX_SECONDS;
export const scenesAllowedForTier = (scenes: number, pro: boolean) => pro || scenes <= FREE_MAX_SCENES;
export const qualityAllowedForTier = (quality: string, pro: boolean) => pro || quality !== "1080p";

/** Plan tiers: Free (2 min, 720p), Creator (20 min, 720p), Pro (60 min, 720p/1080p). Admins count as Pro. */
export type PlanTier = "free" | "creator" | "pro";
export const MAX_SECONDS_BY_TIER: Record<PlanTier, number> = { free: 120, creator: 1200, pro: 3600 };
export const planTierOf = (isAdmin: unknown, hasActiveSub: unknown, planTier: unknown): PlanTier =>
  isAdmin === true ? "pro" : hasActiveSub === true ? (planTier === "pro" ? "pro" : "creator") : "free";
export const lengthAllowedForPlan = (seconds: number, tier: PlanTier) => seconds <= MAX_SECONDS_BY_TIER[tier];
export const qualityAllowedForPlan = (quality: string, tier: PlanTier) => quality !== "1080p" || tier === "pro";
