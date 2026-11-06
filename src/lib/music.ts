export const MUSIC_MOODS = [
  { value: "none", label: "None — no music" },
  { value: "cinematic", label: "Cinematic" },
  { value: "lofi", label: "Lo-fi" },
  { value: "mystery", label: "Mystery" },
  { value: "upbeat", label: "Upbeat" },
  { value: "ambient", label: "Ambient" },
  { value: "epic", label: "Epic" },
  { value: "piano", label: "Calm piano" },
  { value: "custom", label: "My uploaded track" },
] as const;
export type MusicMood = (typeof MUSIC_MOODS)[number]["value"];

/** How loud music sits under the narrator when ducking is on (fraction of the chosen volume). */
export const DUCK_RATIO = 0.25;

/** Gain level points for the export: ducked while each scene's voice plays, full in the gaps. */
export function duckSchedule(sceneDurations: number[], speechDurations: (number | null)[], volume: number, ducking: boolean) {
  const base = Math.max(0, Math.min(1, volume / 100));
  if (!ducking) return [{ t: 0, level: base }];
  const out: { t: number; level: number }[] = [];
  let t = 0;
  sceneDurations.forEach((d, i) => {
    const speech = speechDurations[i];
    if (speech && speech > 0) {
      out.push({ t, level: base * DUCK_RATIO });
      out.push({ t: t + Math.min(speech, d), level: base });
    } else out.push({ t, level: base });
    t += d;
  });
  return out;
}

type MoodDef = { bpm: number; wave: OscillatorType; chords: number[][]; cutoff: number; beat: boolean; bass: boolean; arp: boolean };
const MOODS: Record<string, MoodDef> = {
  cinematic: { bpm: 70, wave: "sawtooth", chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], cutoff: 900, beat: false, bass: true, arp: false },
  lofi: { bpm: 80, wave: "triangle", chords: [[50, 53, 57, 60], [55, 59, 62, 65], [48, 52, 55, 59], [45, 48, 52, 55]], cutoff: 1400, beat: true, bass: true, arp: false },
  mystery: { bpm: 60, wave: "sine", chords: [[45, 48, 52], [46, 49, 53], [44, 47, 51], [45, 48, 51]], cutoff: 700, beat: false, bass: true, arp: true },
  upbeat: { bpm: 118, wave: "square", chords: [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]], cutoff: 2000, beat: true, bass: true, arp: true },
  ambient: { bpm: 50, wave: "sine", chords: [[52, 59, 64], [48, 55, 64], [50, 57, 62], [47, 54, 62]], cutoff: 1100, beat: false, bass: false, arp: false },
  epic: { bpm: 90, wave: "sawtooth", chords: [[50, 57, 62], [46, 53, 58], [48, 55, 60], [45, 52, 57]], cutoff: 1600, beat: true, bass: true, arp: false },
  piano: { bpm: 72, wave: "triangle", chords: [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]], cutoff: 2500, beat: false, bass: false, arp: true },
};
const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);

export type MusicPlayer = { gain: GainNode; stop: () => void };

/** Plays a mood (composed live) or a looped uploaded track into `out`. Control loudness via `gain`. */
export function startMusic(ctx: AudioContext, out: AudioNode, mood: string, customBuffer?: AudioBuffer | null): MusicPlayer | null {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(out);
  if (mood === "custom") {
    if (!customBuffer) { gain.disconnect(); return null; }
    const src = ctx.createBufferSource();
    src.buffer = customBuffer; src.loop = true; src.connect(gain); src.start();
    return { gain, stop: () => { try { src.stop(); } catch { /* */ } gain.disconnect(); } };
  }
  const def = MOODS[mood];
  if (!def) { gain.disconnect(); return null; }
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass"; filter.frequency.value = def.cutoff;
  filter.connect(gain);
  const beat = 60 / def.bpm;
  const bar = beat * 4;
  let nextBar = ctx.currentTime + 0.05;
  let barIdx = 0;
  const note = (f: number, t: number, dur: number, vol: number, type: OscillatorType, dest: AudioNode = filter) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(0.08, dur / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
  };
  const kick = (t: number) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g); g.connect(gain); o.start(t); o.stop(t + 0.25);
  };
  const schedule = () => {
    while (nextBar < ctx.currentTime + 1.5) {
      const chord = def.chords[barIdx % def.chords.length];
      const padVol = 0.08 / chord.length * 3;
      chord.forEach((m) => note(hz(m), nextBar, bar * 1.05, padVol, def.wave));
      if (def.bass) note(hz(chord[0] - 12), nextBar, bar, 0.12, "sine");
      if (def.arp) for (let i = 0; i < 8; i++) note(hz(chord[i % chord.length] + 12), nextBar + i * beat / 2, beat / 2, 0.05, "triangle");
      if (def.beat) for (let i = 0; i < 4; i++) kick(nextBar + i * beat);
      nextBar += bar; barIdx++;
    }
  };
  schedule();
  const timer = setInterval(schedule, 400);
  return { gain, stop: () => { clearInterval(timer); gain.gain.cancelScheduledValues(ctx.currentTime); gain.disconnect(); } };
}

/** Smoothly move the music to a level. */
export function rampTo(ctx: AudioContext, p: MusicPlayer, level: number, at = ctx.currentTime) {
  p.gain.gain.cancelScheduledValues(at);
  p.gain.gain.setTargetAtTime(level, at, 0.08);
}
