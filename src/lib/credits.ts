// Credit prices for each AI action. Browser-only features (music, SFX, motion, transitions, export) are free.
export const CREDIT_COSTS = {
  script: 2,
  facts: 2,
  image: 3,
  voice: 2,
  animate: 25,
  thumbnail: 5,
  seo: 1,
} as const;

export type EstimateInput = {
  scenes: number;
  useFacts?: boolean;
  animated?: number;
  thumbnail?: boolean;
  seo?: boolean;
};

export type CostLine = { label: string; credits: number };

export function costBreakdown(i: EstimateInput): CostLine[] {
  const c = CREDIT_COSTS;
  const lines: CostLine[] = [{ label: "Script", credits: c.script }];
  if (i.useFacts) lines.push({ label: "Real-facts web search", credits: c.facts });
  lines.push({ label: `${i.scenes} scene images`, credits: i.scenes * c.image });
  lines.push({ label: `${i.scenes} voiceovers`, credits: i.scenes * c.voice });
  if (i.animated) lines.push({ label: `${i.animated} animated scenes`, credits: i.animated * c.animate });
  if (i.thumbnail) lines.push({ label: "Thumbnail", credits: c.thumbnail });
  if (i.seo) lines.push({ label: "SEO titles & tags", credits: c.seo });
  return lines;
}

export function estimateCredits(i: EstimateInput): number {
  return costBreakdown(i).reduce((n, l) => n + l.credits, 0);
}
