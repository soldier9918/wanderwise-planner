// Ken Burns camera motion: pure maths shared by the preview and the export.
// x/y are offsets as a fraction of the frame size; rot is in degrees.
export type Motion = { scale: number; x: number; y: number; rot: number };

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
  { value: "alternate", label: "Alternate in / out" },
  { value: "random", label: "Random mix" },
] as const;

const ROTATION = MOTION_TYPES.map((m) => m.value).filter((v) => !["random", "alternate"].includes(v));

/** The effect a given scene uses (Random and Alternate change per scene). */
export function motionFor(type: string, index: number): string {
  if (type === "random") return ROTATION[(index * 7 + 3) % ROTATION.length];
  if (type === "alternate") return index % 2 === 0 ? "zoom-in" : "zoom-out";
  return type;
}

const ease = (t: number) => t * t * (3 - 2 * t);

export function motionAt(type: string, index: number, progress: number, enabled = true): Motion {
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
    default: return { ...none, scale: lerp(1, Z) };
  }
}

export const motionCss = (m: Motion) => `translate(${m.x * 100}%, ${m.y * 100}%) rotate(${m.rot}deg) scale(${m.scale})`;
