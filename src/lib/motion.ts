// Ken Burns camera motion: pure maths shared by the preview and the export.
// x/y are offsets as a fraction of the frame size; rot is in degrees.
export type Line = { pos: number; size: number; a: number };
/** Optional overlays: dark = black veil, flash = white flash, red = blood tint, streaks = vertical film scratches, bands = horizontal glitch bars. */
export type Fx = { dark?: number; flash?: number; red?: number; streaks?: Line[]; bands?: Line[] };
export type Motion = { scale: number; x: number; y: number; rot: number; fx?: Fx };

export const MOTION_TYPES = [
  { value: "zoom-in", label: "Slow zoom in" },
  { value: "subtle-zoom", label: "Subtle zoom in" },
  { value: "zoom-out", label: "Slow zoom out" },
  { value: "punch-in", label: "Punch in (fast zoom)" },
  { value: "pan-left", label: "Pan left" },
  { value: "pan-right", label: "Pan right" },
  { value: "pan-up", label: "Pan up (tilt)" },
  { value: "pan-down", label: "Pan down (tilt)" },
  { value: "zoom-left", label: "Zoom in + drift left" },
  { value: "zoom-right", label: "Zoom in + drift right" },
  { value: "zoom-up", label: "Zoom in + rise" },
  { value: "zoom-down", label: "Zoom in + sink" },
  { value: "out-left", label: "Zoom out + drift left" },
  { value: "out-right", label: "Zoom out + drift right" },
  { value: "diagonal-down", label: "Diagonal glide ↘" },
  { value: "diagonal-up", label: "Diagonal glide ↖" },
  { value: "rotate-zoom", label: "Rotate + zoom" },
  { value: "breathe", label: "Breathing pulse" },
  { value: "float", label: "Floating drift" },
  { value: "handheld", label: "Handheld camera" },
  { value: "h-flicker", label: "Horror: flickering light" },
  { value: "h-strobe", label: "Horror: strobe" },
  { value: "h-streaks", label: "Horror: old film scratches" },
  { value: "h-vhs", label: "Horror: VHS glitch" },
  { value: "h-static", label: "Horror: signal static" },
  { value: "h-creep", label: "Horror: creeping dread zoom" },
  { value: "h-fade", label: "Horror: sinking into darkness" },
  { value: "h-lightning", label: "Horror: lightning flashes" },
  { value: "h-blood", label: "Horror: blood pulse" },
  { value: "h-heartbeat", label: "Horror: heartbeat thump" },
  { value: "h-tilt", label: "Horror: dutch tilt" },
  { value: "h-sway", label: "Horror: haunted sway" },
  { value: "h-shake", label: "Horror: violent shake" },
  { value: "h-lurch", label: "Horror: sudden lurches" },
  { value: "h-jumpscare", label: "Horror: jump scare punch" },
  { value: "h-possessed", label: "Horror: possessed (everything)" },
  { value: "h-random", label: "Horror: random mix" },
  { value: "alternate", label: "Alternate in / out" },
  { value: "random", label: "Random mix" },
] as const;

const ROTATION = MOTION_TYPES.map((m) => m.value).filter((v) => !["random", "alternate", "h-random"].includes(v));
const HORROR = ROTATION.filter((v) => v.startsWith("h-"));

/** The effect a given scene uses (Random and Alternate change per scene). */
export function motionFor(type: string, index: number): string {
  if (type === "random") return ROTATION[(index * 7 + 3) % ROTATION.length];
  if (type === "h-random") return HORROR[(index * 5 + 2) % HORROR.length];
  if (type === "alternate") return index % 2 === 0 ? "zoom-in" : "zoom-out";
  return type;
}

// Repeatable pseudo-random number in [0,1).
const rnd = (n: number) => { const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
const lines = (seed: number, count: number, maxSize: number, alpha: number): Line[] =>
  Array.from({ length: count }, (_, i) => ({ pos: rnd(seed * 13 + i), size: 0.002 + rnd(seed * 7 + i * 3) * maxSize, a: alpha * (0.4 + 0.6 * rnd(seed + i * 11)) }));

const ease = (t: number) => t * t * (3 - 2 * t);

export function motionAt(type: string, index: number, progress: number, enabled = true): Motion {
  const m = rawMotion(type, index, progress, enabled);
  const lim = (m.scale - 1) / 2; // keep the picture covering the frame
  return { ...m, x: Math.max(-lim, Math.min(lim, m.x)), y: Math.max(-lim, Math.min(lim, m.y)) };
}

function rawMotion(type: string, index: number, progress: number, enabled: boolean): Motion {
  const none = { scale: 1, x: 0, y: 0, rot: 0 };
  if (!enabled) return none;
  const p = Math.max(0, Math.min(1, progress));
  const k = ease(p);
  const lerp = (a: number, b: number) => a + (b - a) * k;
  const Z = 1.15, D = 0.05; // zoom amount and drift (always < (Z-1)/2 so edges never show)
  switch (motionFor(type, index)) {
    case "zoom-in": return { ...none, scale: lerp(1, Z) };
    case "subtle-zoom": return { ...none, scale: lerp(1, 1.06) };
    case "zoom-out": return { ...none, scale: lerp(Z, 1) };
    case "punch-in": { const q = ease(Math.min(p / 0.25, 1)); return { ...none, scale: 1 + 0.18 * q + 0.03 * p }; }
    case "pan-left": return { ...none, scale: Z, x: lerp(D, -D) };
    case "pan-right": return { ...none, scale: Z, x: lerp(-D, D) };
    case "pan-up": return { ...none, scale: Z, y: lerp(D, -D) };
    case "pan-down": return { ...none, scale: Z, y: lerp(-D, D) };
    case "zoom-left": return { ...none, scale: lerp(1.05, Z + 0.05), x: lerp(0, -D) };
    case "zoom-right": return { ...none, scale: lerp(1.05, Z + 0.05), x: lerp(0, D) };
    case "zoom-up": return { ...none, scale: lerp(1.05, Z + 0.05), y: lerp(0, -D) };
    case "zoom-down": return { ...none, scale: lerp(1.05, Z + 0.05), y: lerp(0, D) };
    case "out-left": return { ...none, scale: lerp(Z + 0.05, 1.05), x: lerp(D * 0.5, -D * 0.5) };
    case "out-right": return { ...none, scale: lerp(Z + 0.05, 1.05), x: lerp(-D * 0.5, D * 0.5) };
    case "diagonal-down": return { ...none, scale: Z, x: lerp(-D, D), y: lerp(-D, D) };
    case "diagonal-up": return { ...none, scale: Z, x: lerp(D, -D), y: lerp(D, -D) };
    case "rotate-zoom": return { ...none, scale: lerp(1.12, 1.25), rot: lerp(-2, 2) };
    case "breathe": return { ...none, scale: 1.08 + 0.04 * Math.sin(p * Math.PI * 2) };
    case "float": return { ...none, scale: 1.12, x: 0.03 * Math.sin(p * Math.PI * 2), y: 0.02 * Math.sin(p * Math.PI * 4) };
    case "handheld": return { scale: 1.1, x: 0.008 * Math.sin(p * 37) + 0.005 * Math.sin(p * 91), y: 0.008 * Math.cos(p * 29) + 0.004 * Math.sin(p * 73), rot: 0.4 * Math.sin(p * 23) };
    case "h-flicker": { const f = Math.floor(p * 160); const off = rnd(f) < 0.18; return { ...none, scale: lerp(1.04, 1.12), fx: { dark: off ? 0.75 : 0.15 * rnd(f + 1) } }; }
    case "h-strobe": { const on = Math.floor(p * 60) % 2 === 0; return { ...none, scale: 1.08, fx: { dark: on ? 0 : 0.85 } }; }
    case "h-streaks": { const f = Math.floor(p * 120); return { ...none, scale: lerp(1.05, 1.1), x: 0.004 * (rnd(f) - 0.5), fx: { dark: 0.1 + 0.1 * rnd(f + 5), streaks: lines(f, 1 + Math.floor(rnd(f + 9) * 4), 0.004, 0.6) } }; }
    case "h-vhs": { const f = Math.floor(p * 90); const g = rnd(f) < 0.3; return { ...none, scale: 1.1, x: g ? 0.03 * (rnd(f + 2) - 0.5) : 0, fx: { bands: g ? lines(f, 3, 0.05, 0.5) : lines(f, 1, 0.01, 0.2), red: g ? 0.12 : 0 } }; }
    case "h-static": { const f = Math.floor(p * 140); return { ...none, scale: 1.1, x: 0.01 * (rnd(f) - 0.5), fx: { dark: rnd(f + 3) < 0.15 ? 0.6 : 0.1, bands: lines(f, 4, 0.03, 0.45), streaks: lines(f + 50, 2, 0.003, 0.4) } }; }
    case "h-creep": return { ...none, scale: lerp(1, 1.22), fx: { dark: lerp(0, 0.45) } };
    case "h-fade": return { ...none, scale: lerp(1.05, 1.12), fx: { dark: lerp(0, 0.8) } };
    case "h-lightning": { const f = Math.floor(p * 100); const hit = rnd(Math.floor(p * 8) + 0.5) > 0.55 && f % 12 < 2; return { ...none, scale: lerp(1.05, 1.12), fx: { dark: hit ? 0 : 0.45, flash: hit ? 0.7 : 0 } }; }
    case "h-blood": { const s = (Math.sin(p * Math.PI * 8) + 1) / 2; return { ...none, scale: 1.08 + 0.03 * s, fx: { red: 0.15 + 0.25 * s, dark: 0.2 } }; }
    case "h-heartbeat": { const b = (p * 6) % 1; const thump = b < 0.08 ? 1 - b / 0.08 : b > 0.2 && b < 0.28 ? 0.6 * (1 - (b - 0.2) / 0.08) : 0; return { ...none, scale: 1.08 + 0.05 * thump, fx: { dark: 0.3 - 0.2 * thump, red: 0.1 * thump } }; }
    case "h-tilt": return { ...none, scale: lerp(1.18, 1.26), rot: lerp(0, -6), fx: { dark: 0.2 } };
    case "h-sway": return { ...none, scale: 1.18, rot: 3 * Math.sin(p * Math.PI * 3), x: 0.03 * Math.sin(p * Math.PI * 2), fx: { dark: 0.25 } };
    case "h-shake": { const f = Math.floor(p * 200); return { scale: 1.15, x: 0.04 * (rnd(f) - 0.5), y: 0.04 * (rnd(f + 1) - 0.5), rot: 2 * (rnd(f + 2) - 0.5), fx: { dark: 0.2 } }; }
    case "h-lurch": { const seg = Math.floor(p * 5); return { ...none, scale: 1.12 + 0.03 * rnd(seg), x: 0.05 * (rnd(seg + 1) - 0.5), y: 0.05 * (rnd(seg + 2) - 0.5), rot: 3 * (rnd(seg + 3) - 0.5), fx: { dark: 0.25 } }; }
    case "h-jumpscare": { const j = p < 0.7 ? 0 : ease(Math.min((p - 0.7) / 0.05, 1)); return { ...none, scale: lerp(1, 1.04) + 0.3 * j, x: j ? 0.01 * (rnd(Math.floor(p * 200)) - 0.5) : 0, fx: { dark: 0.35 * (1 - j), flash: p > 0.7 && p < 0.73 ? 0.6 : 0 } }; }
    case "h-possessed": { const f = Math.floor(p * 150); return { scale: 1.18, x: 0.03 * (rnd(f) - 0.5), y: 0.03 * (rnd(f + 1) - 0.5), rot: 3 * Math.sin(p * 9), fx: { dark: rnd(f + 4) < 0.2 ? 0.7 : 0.2, red: 0.15 + 0.15 * Math.sin(p * 20), streaks: lines(f, 2, 0.004, 0.5), bands: rnd(f + 6) < 0.3 ? lines(f, 2, 0.04, 0.4) : [] } }; }
    default: return { ...none, scale: lerp(1, Z) };
  }
}

export const motionCss = (m: Motion) => `translate(${m.x * 100}%, ${m.y * 100}%) rotate(${m.rot}deg) scale(${m.scale})`;

/** Draws the overlay effects onto a canvas (export). */
export function drawFx(ctx: CanvasRenderingContext2D, fx: Fx | undefined, W: number, H: number) {
  if (!fx) return;
  const fill = (c: string, a: number, x = 0, y = 0, w = W, h = H) => { if (a <= 0) return; ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  fill("#8b0000", fx.red ?? 0);
  fill("#000", fx.dark ?? 0);
  fill("#fff", fx.flash ?? 0);
  fx.streaks?.forEach((l) => fill("#eee", l.a, l.pos * W, 0, Math.max(1, l.size * W), H));
  fx.bands?.forEach((l) => fill("#ddd", l.a, 0, l.pos * H, W, Math.max(1, l.size * H)));
  ctx.globalAlpha = 1;
}
