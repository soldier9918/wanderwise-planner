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
 * Finished lines disappear as the next one starts, so captions never stack up.
 */
export function typedLine(lines: string[], fraction: number): string {
  if (!lines.length) return "";
  const f = Math.min(Math.max(fraction, 0), 1);
  const total = lines.reduce((sum, l, i) => sum + l.length + (i < lines.length - 1 ? 1 : 0), 0);
  let n = Math.round(total * f);
  for (let i = 0; i < lines.length; i++) {
    const cost = lines[i].length + (i < lines.length - 1 ? 1 : 0);
    if (n < cost || i === lines.length - 1) {
      return lines[i].slice(0, Math.max(0, Math.min(n, lines[i].length)));
    }
    n -= cost;
  }
  return "";
}
