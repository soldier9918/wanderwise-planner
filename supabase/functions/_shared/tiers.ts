/** Free vs Pro limits. Pro = any paid ledger row, or admin. */
export const FREE_VOICES = ["Kore", "Aoede", "Puck", "Charon"] as const;
export const FREE_MAX_SECONDS = 120;
export const FREE_MAX_SCENES = 6;
export const voiceAllowed = (voice: string, pro: boolean) => pro || (FREE_VOICES as readonly string[]).includes(voice);
export const lengthAllowedForTier = (seconds: number, pro: boolean) => pro || seconds <= FREE_MAX_SECONDS;
export const scenesAllowedForTier = (scenes: number, pro: boolean) => pro || scenes <= FREE_MAX_SCENES;
export const qualityAllowedForTier = (quality: string, pro: boolean) => pro || quality !== "1080p";

/** Mirrors the DB `has_active_subscription`: only active/trialing Creator or Pro rows count. Overdue (past_due/unpaid) do not. */
export const subscriptionUnlocksPaid = (status: string | null | undefined, planTier: string | null | undefined) =>
  ["active", "trialing"].includes(String(status)) && ["creator", "pro"].includes(String(planTier));
/** Paid tier comes only from server lookups (RPC results), never from the request body. */
export const resolvePaidTier = (hasActiveSub: unknown, isAdmin: unknown) => isAdmin === true || hasActiveSub === true;
/** Adding scenes must respect the tier cap; shrinking is always allowed. */
export const sceneChangeAllowed = (current: number, target: number, paid: boolean) =>
  target <= current || scenesAllowedForTier(target, paid);
/** Mirrors DB `can_mutate_project`: Free accounts with no credits have read-only projects. */
export const canMutateProject = (isAdmin: unknown, hasActiveSub: unknown, balance: number) =>
  resolvePaidTier(hasActiveSub, isAdmin) || balance > 0;
export const READ_ONLY_MESSAGE = "You've used all your credits, but your video is still available to preview and download. Add credits to unlock editing and continue creating.";

/** Plan tiers: Free (2 min, 720p), Creator (20 min, 720p), Pro (60 min, 720p/1080p). Admins count as Pro. */
export type PlanTier = "free" | "creator" | "pro";
export const MAX_SECONDS_BY_TIER: Record<PlanTier, number> = { free: 120, creator: 1200, pro: 3600 };
export const planTierOf = (isAdmin: unknown, hasActiveSub: unknown, planTier: unknown): PlanTier =>
  isAdmin === true ? "pro" : hasActiveSub === true ? (planTier === "pro" ? "pro" : "creator") : "free";
export const lengthAllowedForPlan = (seconds: number, tier: PlanTier) => seconds <= MAX_SECONDS_BY_TIER[tier];
export const qualityAllowedForPlan = (quality: string, tier: PlanTier) => quality !== "1080p" || tier === "pro";
