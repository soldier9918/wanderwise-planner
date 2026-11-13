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
/** Spoken characters per second, used to turn seconds into a per-scene text limit. */
export const CHARS_PER_SECOND = 11.5;
/** Whole video may run up to 20 seconds over the chosen length (3:00 → 3:20). Total characters across all scenes. Mirrors DB `narration_total_char_limit`. */
export const narrationTotalCharLimit = (targetSeconds: number | null | undefined, tier: PlanTier, isAdmin = false) =>
  isAdmin ? null : Math.floor((Math.min(targetSeconds || 120, MAX_SECONDS_BY_TIER[tier]) + 20) * CHARS_PER_SECOND);
/** Minimum total characters: chosen length minus 10 seconds (2:00 → 1:50). Mirrors DB `enforce_narration_length`. */
export const narrationTotalCharMin = (targetSeconds: number | null | undefined, tier: PlanTier, isAdmin = false) => {
  const max = narrationTotalCharLimit(targetSeconds, tier, isAdmin);
  return max === null ? null : Math.max(max - 30 * CHARS_PER_SECOND, CHARS_PER_SECOND);
};
/** True once any scene's text differs from what the AI first wrote (restoring it exactly undoes this). */
export const narrationEdited = (scenes: { narration: string; initial_narration?: string | null }[]) =>
  scenes.some((s) => s.narration.trim() !== (s.initial_narration ?? s.narration).trim());
/** Longest allowed video. Unedited AI videos get a hidden 20s buffer; edited ones must fit the selected length. Mirrors DB `enforce_narration_length`. */
export const maxVideoSeconds = (targetSeconds: number | null | undefined, tier: PlanTier, isAdmin: boolean, edited: boolean) =>
  isAdmin ? null : Math.min(targetSeconds || 120, MAX_SECONDS_BY_TIER[tier]) + (edited ? 0 : 20);
/** Smallest standard length above the current target that fits the video and the plan cap, or null. */
export const nextFittingLength = (currentTarget: number | null | undefined, actualSecs: number, tier: PlanTier, lengths: readonly number[]) => {
  const cur = currentTarget || 120;
  return lengths.find((l) => l > cur && l >= Math.ceil(actualSecs) && l <= MAX_SECONDS_BY_TIER[tier]) ?? null;
};
