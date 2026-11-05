/** Download quality: how sharp the exported video is. */
export const QUALITIES = [
  { value: "720p", label: "720p HD — smaller file, faster", short: "720p HD", scale: 1, bitrate: 5_000_000 },
  { value: "1080p", label: "1080p Full HD — sharper, bigger file", short: "1080p Full HD", scale: 1.5, bitrate: 8_000_000 },
] as const;

export type Quality = (typeof QUALITIES)[number]["value"];

export const DEFAULT_QUALITY: Quality = "720p";

/** Falls back to 720p so older videos (and bad input) still export. */
export const qualityOf = (v?: string | null) => QUALITIES.find((q) => q.value === v) ?? QUALITIES[0];
