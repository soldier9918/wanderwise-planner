export const SFX_TYPES = [
  { value: "whoosh", label: "Whoosh" },
  { value: "soft-whoosh", label: "Soft whoosh" },
  { value: "swoosh-up", label: "Swoosh up" },
  { value: "reverse", label: "Reverse swell" },
  { value: "page", label: "Page turn" },
  { value: "typewriter", label: "Typewriter clicks" },
  { value: "ding", label: "Typewriter ding" },
  { value: "shutter", label: "Camera shutter" },
  { value: "click", label: "Click" },
  { value: "pop", label: "Pop" },
  { value: "bubble", label: "Bubble" },
  { value: "chime", label: "Chime" },
  { value: "bell", label: "Bell" },
  { value: "sparkle", label: "Magic sparkle" },
  { value: "riser", label: "Riser" },
  { value: "impact", label: "Cinematic boom" },
  { value: "thud", label: "Thud" },
  { value: "drum", label: "Drum hit" },
  { value: "cymbal", label: "Cymbal splash" },
  { value: "heartbeat", label: "Heartbeat" },
  { value: "glitch", label: "Glitch" },
  { value: "laser", label: "Laser zap" },
  { value: "coin", label: "Coin" },
  { value: "wind", label: "Wind gust" },
  { value: "scratch", label: "Record scratch" },
  { value: "notify", label: "Notification" },
  { value: "random", label: "Random mix" },
] as const;

const PLAYABLE = SFX_TYPES.map((s) => s.value).filter((v) => v !== "random");

/** Which sound plays at a given transition ("random" picks a varied, repeatable one). */
export function sfxFor(type: string, index: number): string {
  if (type !== "random") return type;
  return PLAYABLE[(index * 7 + 3) % PLAYABLE.length];
}

/** Times (seconds from start) where a transition sound plays: at the start of every scene after the first. */
export function transitionTimes(sceneDurations: number[]): number[] {
  const out: number[] = [];
  let t = 0;
  sceneDurations.forEach((d, i) => { if (i > 0) out.push(t); t += d; });
  return out;
}

function noise(ctx: BaseAudioContext, secs: number) {
  const b = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * secs)), ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

/** Plays one synthesized transition sound into `out` at time `at` (volume 0–100). */
export function playSfx(ctx: AudioContext, out: AudioNode, type: string, at = ctx.currentTime, volume = 50) {
  const master = ctx.createGain();
  master.gain.value = Math.max(0, Math.min(1, volume / 100));
  master.connect(out);
  const env = (g: GainNode, t: number, peak: number, attack: number, dur: number) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  };
  const tone = (f: number, t: number, dur: number, peak: number, wave: OscillatorType = "sine", f2?: number) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = wave; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    env(g, t, peak, Math.min(0.01, dur / 4), dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  };
  const hiss = (t: number, dur: number, peak: number, attack: number, ftype: BiquadFilterType, f1: number, f2?: number, q = 1) => {
    const s = ctx.createBufferSource(); s.buffer = noise(ctx, dur + 0.05);
    const f = ctx.createBiquadFilter(); f.type = ftype; f.Q.value = q;
    f.frequency.setValueAtTime(f1, t);
    if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ctx.createGain(); env(g, t, peak, attack, dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.05);
  };
  const t = at;
  switch (type) {
    case "whoosh": hiss(t, 0.6, 0.9, 0.25, "bandpass", 300, 3000, 2); break;
    case "soft-whoosh": hiss(t, 0.8, 0.4, 0.35, "lowpass", 400, 1500, 0.7); break;
    case "swoosh-up": hiss(t, 0.45, 0.8, 0.3, "bandpass", 500, 6000, 3); break;
    case "reverse": hiss(t, 0.9, 0.7, 0.8, "lowpass", 300, 5000, 1); break;
    case "page": hiss(t, 0.18, 0.7, 0.03, "highpass", 1500, 4000); hiss(t + 0.12, 0.2, 0.5, 0.02, "bandpass", 3000, 1500, 1); break;
    case "typewriter": for (let i = 0; i < 6; i++) { const k = t + i * 0.07 + (i % 2) * 0.015; hiss(k, 0.03, 0.9, 0.002, "bandpass", 2500, undefined, 4); tone(180, k, 0.03, 0.3, "square"); } break;
    case "ding": hiss(t, 0.04, 0.6, 0.002, "bandpass", 2500, undefined, 4); tone(2100, t + 0.05, 1.0, 0.4); tone(4200, t + 0.05, 0.5, 0.1); break;
    case "shutter": hiss(t, 0.05, 1, 0.002, "highpass", 2000); hiss(t + 0.09, 0.06, 0.8, 0.002, "bandpass", 1200, undefined, 2); break;
    case "click": tone(1800, t, 0.03, 0.6, "square"); break;
    case "pop": tone(400, t, 0.12, 0.8, "sine", 1200); break;
    case "bubble": [0, 0.08, 0.15].forEach((d, i) => tone(500 + i * 200, t + d, 0.1, 0.5, "sine", 1400 + i * 300)); break;
    case "chime": [72, 76, 79, 84].forEach((m, i) => tone(440 * 2 ** ((m - 69) / 12), t + i * 0.08, 0.9, 0.25)); break;
    case "bell": tone(880, t, 1.6, 0.4); tone(1760 * 1.2, t, 0.8, 0.12); tone(440, t, 1.2, 0.15); break;
    case "sparkle": for (let i = 0; i < 8; i++) tone(2000 + Math.random() * 3000, t + i * 0.05, 0.25, 0.15, "triangle"); break;
    case "riser": hiss(t, 1.0, 0.6, 0.9, "bandpass", 200, 8000, 2); tone(200, t, 1.0, 0.15, "sawtooth", 1600); break;
    case "impact": tone(90, t, 1.4, 1, "sine", 30); hiss(t, 0.6, 0.6, 0.005, "lowpass", 800, 100); break;
    case "thud": tone(110, t, 0.3, 1, "sine", 45); break;
    case "drum": tone(160, t, 0.35, 1, "sine", 50); hiss(t, 0.15, 0.4, 0.002, "bandpass", 1800, undefined, 1); break;
    case "cymbal": hiss(t, 1.5, 0.5, 0.005, "highpass", 6000); break;
    case "heartbeat": tone(70, t, 0.2, 1, "sine", 40); tone(65, t + 0.28, 0.25, 0.8, "sine", 40); break;
    case "glitch": for (let i = 0; i < 6; i++) { const k = t + i * 0.04; tone(200 + Math.random() * 2000, k, 0.035, 0.35, "square"); } hiss(t, 0.25, 0.3, 0.005, "highpass", 3000); break;
    case "laser": tone(2500, t, 0.3, 0.35, "sawtooth", 150); break;
    case "coin": tone(988, t, 0.08, 0.35, "square"); tone(1319, t + 0.08, 0.4, 0.3, "square"); break;
    case "wind": hiss(t, 1.4, 0.5, 0.6, "bandpass", 400, 900, 3); break;
    case "scratch": hiss(t, 0.25, 0.8, 0.02, "bandpass", 600, 2500, 5); hiss(t + 0.25, 0.2, 0.6, 0.02, "bandpass", 2500, 600, 5); break;
    case "notify": tone(1047, t, 0.15, 0.35); tone(1568, t + 0.12, 0.35, 0.35); break;
    default: break;
  }
  setTimeout(() => master.disconnect(), (at - ctx.currentTime + 2.5) * 1000);
}
