import { useEffect, useState } from "react";

type Part = { t: string; hl?: boolean };

const LINES: Part[][] = [
  [{ t: "From idea to " }, { t: "upload", hl: true }, { t: " in minutes." }],
  [{ t: "One sentence in, " }, { t: "one video", hl: true }, { t: " out." }],
  [{ t: "Script, scenes and " }, { t: "voice", hl: true }, { t: " — done." }],
  [{ t: "Your channel, on " }, { t: "autopilot", hl: true }, { t: "." }],
  [{ t: "No camera. No crew. " }, { t: "Just AI", hl: true }, { t: "." }],
  [{ t: "Faceless videos that " }, { t: "sound human", hl: true }, { t: "." }],
];

const textOf = (parts: Part[]) => parts.map((p) => p.t).join("");
const LONGEST = LINES.reduce((a, b) => (textOf(b).length > textOf(a).length ? b : a), LINES[0]);
const TYPE_MS = 65;
const ERASE_MS = 22;
const HOLD_MS = 2400;

/** Headline that types a line, holds, erases it, then types the next one. */
export default function TypedHeadline() {
  const [line, setLine] = useState(0);
  const [n, setN] = useState(0);
  const [erasing, setErasing] = useState(false);

  const parts = LINES[line];
  const full = textOf(parts);

  useEffect(() => {
    if (!erasing && n >= full.length) {
      const id = setTimeout(() => setErasing(true), HOLD_MS);
      return () => clearTimeout(id);
    }
    if (erasing && n <= 0) {
      setErasing(false);
      setLine((p) => (p + 1) % LINES.length);
      return;
    }
    const id = setTimeout(
      () => setN((v) => v + (erasing ? -1 : 1)),
      erasing ? ERASE_MS : n === 0 ? 400 : TYPE_MS,
    );
    return () => clearTimeout(id);
  }, [n, erasing, full.length]);

  let left = n;
  return (
    <h1 className="relative max-w-4xl text-5xl font-extrabold leading-[0.95] md:text-8xl">
      <span className="invisible" aria-hidden>
        {textOf(LONGEST)}
      </span>
      <span className="absolute inset-0" aria-label={full}>
        {parts.map((p, i) => {
          const s = p.t.slice(0, Math.max(0, left));
          left -= p.t.length;
          return (
            <span key={i} className={p.hl ? "text-primary" : undefined}>
              {s}
            </span>
          );
        })}
        <span className="ml-1 inline-block h-[0.8em] w-[0.08em] translate-y-[0.08em] bg-primary animate-blink" />
      </span>
    </h1>
  );
}
