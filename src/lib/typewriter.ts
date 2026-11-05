/** Returns the part of `text` that should be visible when narration is `fraction` (0–1) of the way through. */
export function typedText(text: string, fraction: number) {
  const f = Math.min(Math.max(fraction, 0), 1);
  return text.slice(0, Math.round(text.length * f));
}
