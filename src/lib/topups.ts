import { z } from "zod";

export const TOP_UP_AMOUNTS = [5, 10, 50, 100, 1000, 5000] as const;
export const gbpAmount = z.coerce.number().finite().min(5, "Enter at least £5.").refine(
  (value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.000001,
  "Use no more than two decimal places.",
);

export const autoTopUpSchema = z.object({
  enabled: z.boolean(),
  threshold: z.coerce.number().finite().int().min(1, "Enter at least 1 credit."),
  amount: gbpAmount,
  limitEnabled: z.boolean(),
  monthlyLimit: gbpAmount,
}).refine((v) => !v.limitEnabled || v.monthlyLimit >= v.amount, {
  message: "Monthly limit must cover at least one top-up.", path: ["monthlyLimit"],
});