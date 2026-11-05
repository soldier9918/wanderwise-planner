/** Splits narration into word-wrapped lines of at most `maxChars` characters. */
export function wrapByChars(text: string, maxChars: number): string[] {
  const limit = Math.max(1, Math.floor(maxChars));
  const lines: string[] = [];
  let line = "";
  const flush = () => { if (line) { lines.push(line); line = ""; } };
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (word.length > limit) {
      flush();
      let rest = word;
      while (rest.length > limit) { lines.push(rest.slice(0, limit)); rest = rest.slice(limit); }
      line = rest;
      continue;
    }
    const test = line ? `${line} ${word}` : word;
    if (test.length > limit && line) { flush(); line = word; } else line = test;
  }
  flush();
  return lines;
}

/** Captions finish by this share of the clip, since voiceovers end with a little silence. */
export const CAPTION_LEAD = 1;

/** The caption looks a video can use. */
export type CaptionStyle = "typewriter" | "pop" | "full" | "none";

/** How many words are showing when narration is `fraction` (0–1) of the way through. */
function wordCountAt(flat: string[], fraction: number): number {
  if (!flat.length) return 0;
  const f = Math.min(Math.max(fraction / CAPTION_LEAD, 0), 1);
  if (f <= 0) return 0;
  if (f >= 1) return flat.length;
  // Each word "costs" its length plus a beat; punctuation adds a short pause.
  const cost = flat.map((w) => w.length + 1 + (/[,;:]$/.test(w) ? 2 : /[.!?]$/.test(w) ? 4 : 0));
  const total = cost.reduce((a, b) => a + b, 0);
  const at = f * total;
  let n = 0, start = 0;
  for (const c of cost) { if (start <= at) n++; start += c; }
  return n;
}

/**
 * The single line being typed when narration is `fraction` (0–1) of the way through.
 * Whole words appear one at a time (never single letters), each one as the narrator
 * starts saying it. Longer words get more time than short ones, and finished lines
 * disappear as the next one starts, so captions never stack up.
 */
export function typedLine(lines: string[], fraction: number): string {
  const clean = lines.map((l) => l.split(/\s+/).filter(Boolean).join(" ")).filter(Boolean);
  if (!clean.length) return "";
  const f = Math.min(Math.max(fraction / CAPTION_LEAD, 0), 1);
  if (f <= 0) return "";
  if (f >= 1) return clean[clean.length - 1];
  // Letters type one at a time; punctuation adds a short pause, line breaks a beat.
  const cost = (ch: string) => 1 + (/[,;:]/.test(ch) ? 2 : /[.!?]/.test(ch) ? 4 : 0);
  const lineCost = clean.map((l) => [...l].reduce((a, ch) => a + cost(ch), 0) + 1);
  let at = f * lineCost.reduce((a, b) => a + b, 0);
  for (let i = 0; i < clean.length; i++) {
    if (at < lineCost[i] || i === clean.length - 1) {
      let out = "";
      for (const ch of clean[i]) { if (at <= 0) break; out += ch; at -= cost(ch); }
      return out || clean[i][0];
    }
    at -= lineCost[i];
  }
  return "";
}

/**
 * Like `typedLine`, but words pile up: every spoken word stays on screen and the
 * lines stack, so the caption grows until the whole narration is showing.
 */
export function typedWords(lines: string[], fraction: number): string[] {
  const words = lines.map((l) => l.split(/\s+/).filter(Boolean));
  // One screen-wide line at a time: words pop in, then the next line replaces it.
  let n = wordCountAt(words.flat(), fraction);
  for (let i = 0; i < words.length; i++) {
    if (n <= words[i].length || i === words.length - 1) {
      const take = Math.max(0, Math.min(n, words[i].length));
      return take ? [words[i].slice(0, take).join(" ")] : [];
    }
    n -= words[i].length;
  }
  return [];
}
