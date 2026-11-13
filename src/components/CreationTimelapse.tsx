import { useEffect, useState } from "react";
import { Check, Download, FastForward, Image as ImageIcon, Mic, Sparkles } from "lucide-react";
import ocean from "@/assets/reel-ocean.jpg";
import space from "@/assets/example-thumb-space.jpg";
import mars from "@/assets/reel-mars.jpg";
import tokyo from "@/assets/reel-tokyo.jpg";

const PROMPT = "The deepest mysteries of the ocean";
const SCENES = [
  { img: ocean, text: "Miles beneath the surface, darkness rules." },
  { img: space, text: "Creatures glow like stars in the deep." },
  { img: mars, text: "The trench floor is stranger than Mars." },
  { img: tokyo, text: "And we've explored less than 5% of it." },
];
const PHASES = ["Idea", "Script", "Images & voice", "Preview"];
const TICK = 80; // ms per tick
const PHASE_TICKS = [40, 30, 50, 60];
const TOTAL = PHASE_TICKS.reduce((a, b) => a + b, 0);

function phaseOf(t: number) {
  let acc = 0;
  for (let i = 0; i < PHASE_TICKS.length; i++) {
    if (t < acc + PHASE_TICKS[i]) return { phase: i, local: t - acc, len: PHASE_TICKS[i] };
    acc += PHASE_TICKS[i];
  }
  return { phase: 3, local: PHASE_TICKS[3] - 1, len: PHASE_TICKS[3] };
}

export default function CreationTimelapse() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setT(TOTAL - 1); return; }
    const id = window.setInterval(() => setT((x) => (x + 1) % TOTAL), TICK);
    return () => window.clearInterval(id);
  }, []);
  const { phase, local, len } = phaseOf(t);
  const p = local / len;
  const typed = phase === 0 ? PROMPT.slice(0, Math.floor(Math.min(1, p * 1.4) * PROMPT.length)) : PROMPT;
  const scriptCount = phase === 0 ? 0 : phase === 1 ? Math.ceil(p * SCENES.length) : SCENES.length;
  const assetDone = (i: number) => phase > 2 || (phase === 2 && p > (i + 1) / (SCENES.length + 0.5));
  const playIdx = Math.min(SCENES.length - 1, Math.floor(p * SCENES.length));
  let cx = 20, cy = 8, click = false;
  if (phase === 0) { if (p < 0.65) { cx = 12 + p * 30; cy = 9; } else { cx = 10; cy = 17; click = p > 0.8; } }
  else if (phase === 1) { cx = 30; cy = 28 + p * 55; }
  else if (phase === 2) { cx = 65 + p * 15; cy = 70; click = local % 12 === 0; }
  else if (p < 0.6) { cx = 60 + p * 20; cy = 35; } else { cx = 72; cy = 88; click = p > 0.85; }
  const jump = (i: number) => setT(PHASE_TICKS.slice(0, i).reduce((a, b) => a + b, 0));

  return (
    <section className="container py-20">
      <div className="mb-10 text-center">
        <p className="text-sm uppercase tracking-widest text-accent">Watch it happen</p>
        <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">From idea to video in minutes</h2>
        <p className="mt-3 text-muted-foreground">A fast-forwarded look at Vydora making a video.</p>
      </div>
      <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" /> Vydora Studio
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
            <FastForward className="h-3.5 w-3.5" /> 20× speed
          </span>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-border px-4 py-3">
          {PHASES.map((name, i) => (
            <button key={name} onClick={() => jump(i)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${i === phase ? "bg-primary text-primary-foreground" : i < phase ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground"}`}>
              {i + 1}. {name}
            </button>
          ))}
          <div className="ml-auto hidden h-1.5 w-40 self-center overflow-hidden rounded-full bg-muted sm:block">
            <div className="h-full bg-primary transition-[width] duration-75" style={{ width: `${(t / TOTAL) * 100}%` }} />
          </div>
        </div>

        <div className="relative grid gap-4 p-4 md:grid-cols-[1fr_1.4fr]">
          <div aria-hidden className="pointer-events-none absolute z-20" style={{ left: `${cx}%`, top: `${cy}%`, transition: "left 700ms cubic-bezier(.4,0,.2,1), top 700ms cubic-bezier(.4,0,.2,1)" }}>
            {click && <span className="absolute -left-3 -top-3 h-6 w-6 animate-ping rounded-full bg-primary/60" />}
            <svg width="22" height="22" viewBox="0 0 24 24" className={`drop-shadow-lg transition-transform duration-150 ${click ? "scale-90" : ""}`}>
              <path d="M3 2l7 19 2.5-7.5L20 11z" className="fill-foreground stroke-background" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Your idea</p>
              <p className="mt-1 min-h-6 font-medium">{typed}{phase === 0 && <span className="animate-pulse text-primary">|</span>}</p>
              <div className={`mt-3 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${phase === 0 && p > 0.8 ? "scale-95 bg-primary/80" : "bg-primary"} text-primary-foreground`}>
                <Sparkles className="h-3.5 w-3.5" /> {phase === 0 ? "Create video" : "Script written"}
              </div>
            </div>
            {SCENES.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 rounded-lg border border-border bg-background p-2 transition-all duration-300 ${i < scriptCount ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"} ${phase === 3 && i === playIdx ? "border-primary" : ""}`}>
                <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-muted">
                  <img src={s.img} alt="" loading="lazy" className={`h-full w-full object-cover transition-all duration-500 ${assetDone(i) ? "opacity-100 blur-0" : "opacity-30 blur-sm"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs">{s.text}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                    {assetDone(i) ? <><Check className="h-3 w-3 text-accent" /> Image & voice ready</>
                      : phase === 2 ? <><ImageIcon className="h-3 w-3 animate-pulse text-primary" /> Painting image… <Mic className="h-3 w-3 animate-pulse text-primary" /></>
                      : `Scene ${i + 1}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              {phase === 3 ? (
                <>
                  <img key={playIdx} src={SCENES[playIdx].img} alt="" className="h-full w-full scale-110 object-cover animate-fade-in" style={{ transform: `scale(${1.05 + (p * SCENES.length - playIdx) * 0.1})`, transition: "transform 80ms linear" }} />
                  <p className="absolute inset-x-4 bottom-4 rounded bg-background/70 px-3 py-1.5 text-center text-sm font-bold backdrop-blur">{SCENES[playIdx].text}</p>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                  <Sparkles className="h-8 w-8 animate-pulse text-primary" />
                  {phase === 0 ? "Waiting for your idea…" : phase === 1 ? "Writing the script…" : "Making images and voiceovers…"}
                </div>
              )}
            </div>
            <div className="flex h-10 items-end gap-0.5">
              {Array.from({ length: 48 }).map((_, i) => {
                const active = phase >= 2;
                const h = active ? 20 + Math.abs(Math.sin((i + t) * 0.6) * Math.cos(i * 0.3)) * 80 : 8;
                return <span key={i} className={`flex-1 rounded-sm ${active ? "bg-primary/70" : "bg-muted"}`} style={{ height: `${h}%`, transition: "height 80ms linear" }} />;
              })}
            </div>
            <div className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all ${phase === 3 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
              <Download className="h-4 w-4" /> {phase === 3 ? "Ready to download" : "Building your video…"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
