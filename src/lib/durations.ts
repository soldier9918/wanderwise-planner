/** Seconds a scene stays on screen: its voiceover plus a short breath, or 4s when there is no voiceover yet. */
export const SCENE_PADDING = 0.4;
export const PLACEHOLDER_SECONDS = 4;
/** Typical narration pace, in words per second (~156 wpm). */
const WORDS_PER_SECOND = 2.6;

/** Rough length of a narration read aloud, used before the voiceover clip is measured. */
export function estimateSeconds(narration: string) {
  const words = narration.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / WORDS_PER_SECOND));
}

/**
 * Seconds a scene will take.
 * `audioSeconds` is the measured voiceover clip length, or null when there is no voiceover yet.
 */
export function sceneSeconds(audioSeconds: number | null | undefined, narration: string) {
  if (typeof audioSeconds === "number" && isFinite(audioSeconds) && audioSeconds > 0) {
    return Math.round(audioSeconds + SCENE_PADDING);
  }
  if (narration.trim()) return estimateSeconds(narration);
  return PLACEHOLDER_SECONDS;
}

/**
 * Seconds played so far across the whole video.
 * `index` is the scene currently on screen and `progress` how far through it (0..1).
 */
export function elapsedSeconds(sceneSecs: number[], index: number, progress: number) {
  if (index < 0 || !sceneSecs.length) return 0;
  const i = Math.min(index, sceneSecs.length - 1);
  const p = Math.min(Math.max(progress, 0), 1);
  return sceneSecs.slice(0, i).reduce((a, s) => a + s, 0) + sceneSecs[i] * p;
}

/** "9s" for anything under a minute, "1:15" beyond it. */
export function formatSeconds(total: number) {
  const s = Math.max(0, Math.round(total));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
