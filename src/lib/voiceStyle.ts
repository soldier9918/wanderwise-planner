export const NARRATION_SPEEDS = [1, 1.15, 1.25] as const;
export const ACCENTS = [
  { value: "none", label: "Voice's natural accent" },
  { value: "british", label: "British" },
  { value: "us", label: "American (US)" },
  { value: "australian", label: "Australian" },
  { value: "scottish", label: "Scottish" },
] as const;
const ACCENT_TEXT: Record<string, string> = {
  british: "a natural British (Received Pronunciation) accent",
  us: "a natural General American accent",
  australian: "a natural Australian accent",
  scottish: "a natural Scottish accent",
};
/** Clamp any stored speed to an allowed option (default 1×). */
export function speedOf(v: unknown): number {
  const n = Number(v);
  return (NARRATION_SPEEDS as readonly number[]).includes(n) ? n : 1;
}
/** Extra voice direction for the narrator, or "" for no accent. */
export function accentDirection(accent: string | null | undefined) {
  return accent && ACCENT_TEXT[accent] ? `Speak with ${ACCENT_TEXT[accent]}` : "";
}
export const LOGO_POSITIONS = [
  { value: "top-left", label: "Top left" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-right", label: "Bottom right" },
] as const;
/** Logo box (x, y, size) inside a W×H frame: ~12% of the short side, 3% margin. */
export function logoBox(pos: string, W: number, H: number, iw: number, ih: number) {
  const s = Math.min(W, H) * 0.12;
  const k = s / Math.max(iw, ih);
  const w = iw * k, h = ih * k, m = Math.min(W, H) * 0.03;
  const right = pos.endsWith("right"), bottom = pos.startsWith("bottom");
  return { x: right ? W - w - m : m, y: bottom ? H - h - m : m, w, h };
}
