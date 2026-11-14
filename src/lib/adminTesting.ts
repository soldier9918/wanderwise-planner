import type { PlanTier } from "@/lib/tiers";

export type EffectiveAccount = { isAdmin: boolean; adminAccess: boolean; testMode: PlanTier | null; tier: PlanTier; pro: boolean; balance: number };
export function parseEffectiveAccount(value: unknown): EffectiveAccount {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Couldn't check your account");
  const v = value as Record<string, unknown>;
  if (!["free", "creator", "pro"].includes(String(v.tier)) || typeof v.balance !== "number" || typeof v.isAdmin !== "boolean" || typeof v.adminAccess !== "boolean" || typeof v.pro !== "boolean") throw new Error("Couldn't check your account");
  return v as EffectiveAccount;
}
export const validCreditAdjustment = (value: string) => value.trim() !== "" && Number.isSafeInteger(Number(value)) && Number(value) !== 0 && Math.abs(Number(value)) <= 2147483647;