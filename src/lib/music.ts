export const MUSIC_MOODS = [
  { value: "none", label: "None — no music" },
  { value: "cinematic", label: "Cinematic" },
  { value: "lofi", label: "Lo-fi" },
  { value: "mystery", label: "Mystery" },
  { value: "upbeat", label: "Upbeat" },
  { value: "ambient", label: "Ambient" },
  { value: "epic", label: "Epic" },
  { value: "piano", label: "Calm piano" },
  { value: "dark", label: "Dark & tense" },
  { value: "horror", label: "Horror" },
  { value: "sad", label: "Sad & emotional" },
  { value: "hopeful", label: "Hopeful" },
  { value: "documentary", label: "Documentary" },
  { value: "synthwave", label: "Synthwave" },
  { value: "chill", label: "Chill" },
  { value: "corporate", label: "Corporate" },
  { value: "adventure", label: "Adventure" },
  { value: "dreamy", label: "Dreamy" },
  { value: "funky", label: "Funky" },
  { value: "space", label: "Space" },
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
  dark: { bpm: 64, wave: "sawtooth", chords: [[40, 43, 47], [41, 44, 48], [38, 41, 45], [40, 43, 46]], cutoff: 600, beat: true, bass: true, arp: false },
  horror: { bpm: 48, wave: "sine", chords: [[45, 46, 52], [44, 45, 51], [46, 47, 53], [43, 44, 50]], cutoff: 500, beat: false, bass: true, arp: true },
  sad: { bpm: 60, wave: "triangle", chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [52, 55, 59]], cutoff: 1300, beat: false, bass: true, arp: true },
  hopeful: { bpm: 84, wave: "triangle", chords: [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60, 65]], cutoff: 1800, beat: false, bass: true, arp: true },
  documentary: { bpm: 76, wave: "sine", chords: [[50, 57, 62, 65], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 61]], cutoff: 1200, beat: false, bass: true, arp: false },
  synthwave: { bpm: 100, wave: "sawtooth", chords: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]], cutoff: 1700, beat: true, bass: true, arp: true },
  chill: { bpm: 72, wave: "sine", chords: [[53, 57, 60, 64], [50, 53, 57, 60], [55, 58, 62, 65], [48, 52, 55, 58]], cutoff: 1500, beat: true, bass: true, arp: false },
  corporate: { bpm: 110, wave: "triangle", chords: [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]], cutoff: 2200, beat: true, bass: true, arp: true },
  adventure: { bpm: 104, wave: "sawtooth", chords: [[50, 54, 57], [55, 59, 62], [57, 61, 64], [52, 55, 59]], cutoff: 1800, beat: true, bass: true, arp: false },
  dreamy: { bpm: 56, wave: "sine", chords: [[60, 67, 71, 74], [57, 64, 67, 72], [53, 60, 64, 69], [55, 62, 65, 71]], cutoff: 1600, beat: false, bass: false, arp: true },
  funky: { bpm: 112, wave: "square", chords: [[50, 53, 57, 60], [55, 58, 62, 65], [50, 53, 57, 60], [57, 61, 64, 67]], cutoff: 1500, beat: true, bass: true, arp: false },
  space: { bpm: 44, wave: "sine", chords: [[48, 55, 62], [50, 57, 64], [46, 53, 60], [43, 50, 57]], cutoff: 900, beat: false, bass: true, arp: true },
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
