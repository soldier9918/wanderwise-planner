import { adminClient } from "./common.ts";
import type { PlanTier } from "./tiers.ts";

/** Feature access is server-validated; administrative authority stays in has_role. */
export async function effectiveAccount(userId: string): Promise<{ isAdmin: boolean; adminAccess: boolean; testMode: PlanTier | null; tier: PlanTier; pro: boolean; balance: number }> {
  const { data, error } = await adminClient().rpc("effective_account", { _user: userId });
  if (error || !data || !["free", "creator", "pro"].includes(data.tier)) throw error ?? new Error("Couldn't check account access");
  return data;
}