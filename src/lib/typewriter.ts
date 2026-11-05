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

/**
 * The single line being typed when narration is `fraction` (0–1) of the way through.
 * Whole words appear one at a time (never single letters), and finished lines
 * disappear as the next one starts, so captions never stack up.
 */
export function typedLine(lines: string[], fraction: number): string {
  if (!lines.length) return "";
  const f = Math.min(Math.max(fraction, 0), 1);
  const words = lines.map((l) => l.split(/\s+/).filter(Boolean));
  const total = words.reduce((sum, w) => sum + w.length, 0);
  if (!total) return "";
  let n = Math.round(total * f);
  for (let i = 0; i < words.length; i++) {
    if (n <= words[i].length || i === words.length - 1) {
      return words[i].slice(0, Math.max(0, Math.min(n, words[i].length))).join(" ");
    }
    n -= words[i].length;
  }
  return "";
}
