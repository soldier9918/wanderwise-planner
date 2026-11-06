import { useEffect, useState } from "react";

const parts = [{ t: "From idea to " }, { t: "upload", hl: true }, { t: " in minutes." }];
const full = parts.map((p) => p.t).join("");

/** Headline that types itself letter by letter with a blinking cursor. */
export default function TypedHeadline() {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= full.length) return;
    const id = setTimeout(() => setN(n + 1), n === 0 ? 400 : 65);
    return () => clearTimeout(id);
  }, [n]);
  let left = n;
  return (
    <h1 className="relative max-w-4xl text-5xl font-extrabold leading-[0.95] md:text-8xl">
      <span className="invisible" aria-hidden>{full}</span>
      <span className="absolute inset-0" aria-label={full}>
        {parts.map((p, i) => {
          const s = p.t.slice(0, Math.max(0, left)); left -= p.t.length;
          return <span key={i} className={p.hl ? "text-primary" : undefined}>{s}</span>;
        })}
        <span className="ml-1 inline-block h-[0.8em] w-[0.08em] translate-y-[0.08em] bg-primary animate-blink" />
      </span>
    </h1>
  );
}
