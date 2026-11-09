/** Free vs Pro limits. Pro = any paid ledger row, or admin. */
export const FREE_VOICES = ["Kore", "Aoede", "Puck", "Charon"] as const;
export const FREE_MAX_SECONDS = 120;
export const FREE_MAX_SCENES = 6;
export const voiceAllowed = (voice: string, pro: boolean) => pro || (FREE_VOICES as readonly string[]).includes(voice);
export const lengthAllowedForTier = (seconds: number, pro: boolean) => pro || seconds <= FREE_MAX_SECONDS;
export const scenesAllowedForTier = (scenes: number, pro: boolean) => pro || scenes <= FREE_MAX_SCENES;
export const qualityAllowedForTier = (quality: string, pro: boolean) => pro || quality !== "1080p";
