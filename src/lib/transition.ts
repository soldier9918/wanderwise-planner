// Scene transitions: pure maths shared by the preview and the export.
// Runs over the first TRANSITION_SECS of every scene after the first.
export const TRANSITION_SECS = 0.8;

/** One picture's look during a transition. x/y are frame fractions; clip insets are [top, right, bottom, left] fractions. */
export type Layer = { a: number; x: number; y: number; scale: number; rot: number; blur: number; clip?: [number, number, number, number] };
export type Transition = { prev: Layer | null; next: Layer; overlay?: { color: string; a: number } };

export const TRANSITION_TYPES = [
  { value: "crossfade", label: "Smooth cross-dissolve" },
  { value: "fade-black", label: "Film fade (through black)" },
  { value: "fade-white", label: "Dream fade (through white)" },
  { value: "blur", label: "Blur dissolve" },
  { value: "flash", label: "Camera flash" },
  { value: "slide-left", label: "Slide left" },
  { value: "slide-right", label: "Slide right" },
  { value: "slide-up", label: "Slide up" },
  { value: "slide-down", label: "Slide down" },
  { value: "cover-left", label: "Cover from right" },
  { value: "cover-up", label: "Cover from bottom" },
  { value: "reveal-left", label: "Reveal (old slides away)" },
  { value: "wipe-left", label: "Wipe left" },
  { value: "wipe-right", label: "Wipe right" },
  { value: "wipe-up", label: "Wipe up" },
  { value: "wipe-down", label: "Wipe down" },
  { value: "barn-open", label: "Barn doors open" },
  { value: "box-out", label: "Box grow" },
  { value: "zoom-in", label: "Zoom through" },
  { value: "zoom-out", label: "Zoom out reveal" },
  { value: "spin", label: "Spin in" },
  { value: "whip", label: "Whip pan" },
  { value: "glitch", label: "Glitch cut" },
  { value: "blood", label: "Blood red dip (horror)" },
  { value: "random", label: "Random mix" },
] as const;

const ROTATION = TRANSITION_TYPES.map((t) => t.value).filter((v) => v !== "random");

export function transitionFor(type: string, index: number): string {
  return type === "random" ? ROTATION[(index * 7 + 2) % ROTATION.length] : type;
}

const ease = (t: number) => t * t * (3 - 2 * t);
const L = (o: Partial<Layer> = {}): Layer => ({ a: 1, x: 0, y: 0, scale: 1, rot: 0, blur: 0, ...o });

/** index = the incoming scene; progress = 0..1 through the transition. Returns null when no transition applies. */
export function transitionAt(type: string, index: number, progress: number, enabled = true): Transition | null {
  if (!enabled || index <= 0 || progress >= 1) return null;
  const p = Math.max(0, progress);
  const k = ease(p);
  const half = p < 0.5;
  const dip = (color: string): Transition => ({ prev: half ? L() : null, next: L(), overlay: { color, a: half ? ease(p * 2) : ease(2 - p * 2) } });
  switch (transitionFor(type, index)) {
    case "crossfade": return { prev: L(), next: L({ a: k }) };
    case "fade-black": return dip("#000");
    case "fade-white": return dip("#fff");
    case "blood": return dip("#7a0000");
    case "blur": return { prev: L({ blur: 12 * k }), next: L({ a: k, blur: 12 * (1 - k) }) };
    case "flash": return { prev: half ? L() : null, next: L(), overlay: { color: "#fff", a: 1 - Math.abs(p - 0.5) * 2 } };
    case "slide-left": return { prev: L({ x: -k }), next: L({ x: 1 - k }) };
    case "slide-right": return { prev: L({ x: k }), next: L({ x: k - 1 }) };
    case "slide-up": return { prev: L({ y: -k }), next: L({ y: 1 - k }) };
    case "slide-down": return { prev: L({ y: k }), next: L({ y: k - 1 }) };
    case "cover-left": return { prev: L(), next: L({ x: 1 - k }) };
    case "cover-up": return { prev: L(), next: L({ y: 1 - k }) };
    case "reveal-left": return { prev: L({ x: -k }), next: L() };
    case "wipe-left": return { prev: L(), next: L({ clip: [0, 0, 0, 1 - k] }) };
    case "wipe-right": return { prev: L(), next: L({ clip: [0, 1 - k, 0, 0] }) };
    case "wipe-up": return { prev: L(), next: L({ clip: [1 - k, 0, 0, 0] }) };
    case "wipe-down": return { prev: L(), next: L({ clip: [0, 0, 1 - k, 0] }) };
    case "barn-open": return { prev: L(), next: L({ clip: [0, (1 - k) / 2, 0, (1 - k) / 2] }) };
    case "box-out": return { prev: L(), next: L({ clip: [(1 - k) / 2, (1 - k) / 2, (1 - k) / 2, (1 - k) / 2] }) };
    case "zoom-in": return { prev: L({ scale: 1 + k, a: 1 - k }), next: L({ a: k, scale: 0.8 + 0.2 * k }) };
    case "zoom-out": return { prev: L({ scale: 1 - 0.3 * k, a: 1 - k }), next: L({ a: k, scale: 1.4 - 0.4 * k }) };
    case "spin": return { prev: L({ a: 1 - k }), next: L({ a: k, rot: -90 * (1 - k), scale: 0.5 + 0.5 * k }) };
    case "whip": return { prev: L({ x: -k * 1.2, blur: 16 * k }), next: L({ x: 1.2 * (1 - k), blur: 16 * (1 - k) }) };
    case "glitch": {
      const f = Math.floor(p * 20);
      const j = (Math.sin(f * 91.7) * 0.5) * 0.08;
      return { prev: p < 0.5 && f % 3 ? L({ x: j }) : null, next: p < 0.5 ? L({ x: -j, a: f % 3 ? 0.5 : 1 }) : L() };
    }
    default: return { prev: L(), next: L({ a: k }) };
  }
}

export const layerCss = (l: Layer) => ({
  opacity: l.a,
  filter: l.blur ? `blur(${l.blur}px)` : undefined,
  clipPath: l.clip ? `inset(${l.clip.map((c) => `${c * 100}%`).join(" ")})` : undefined,
  transform: `translate(${l.x * 100}%, ${l.y * 100}%) rotate(${l.rot}deg) scale(${l.scale})`,
});
