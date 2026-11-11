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

/** Video lengths offered on the New video screen, in seconds. */
export const VIDEO_LENGTHS = [30, 60, 120, 180, 240, 300, 420, 600, 900, 1200, 1800, 2700, 3600] as const;
export const MIN_SCENE_SECONDS = 5;
export const MAX_SCENE_SECONDS = 90;

/** Average seconds each scene should last to hit the chosen total. */
export function secondsPerScene(totalSeconds: number, scenes: number) {
  if (scenes <= 0) return 0;
  return Math.round(totalSeconds / scenes);
}

/** Words of narration that fill roughly that many seconds. */
export function wordsForSeconds(seconds: number) {
  return Math.max(5, Math.round(seconds * WORDS_PER_SECOND));
}

/** A length works only if each scene lands between 5 and 90 seconds. */
export function isLengthAllowed(totalSeconds: number, scenes: number) {
  const per = totalSeconds / scenes;
  return per >= MIN_SCENE_SECONDS && per <= MAX_SCENE_SECONDS;
}

/** Fewest scenes a length needs (each scene can last at most 90s). */
export function minScenesForSeconds(totalSeconds: number) {
  return Math.ceil(totalSeconds / MAX_SCENE_SECONDS);
}

/** Most scenes a length can hold (each scene needs at least 5s). */
export function maxScenesForSeconds(totalSeconds: number) {
  return Math.floor(totalSeconds / MIN_SCENE_SECONDS);
}

/** Turns a point on the whole-video timeline into the scene it falls in and how far through it (0..1). */
export function locateTime(sceneSecs: number[], seconds: number) {
  if (!sceneSecs.length) return { index: 0, progress: 0 };
  let t = Math.max(0, seconds);
  for (let i = 0; i < sceneSecs.length; i++) {
    if (t < sceneSecs[i]) return { index: i, progress: sceneSecs[i] ? t / sceneSecs[i] : 0 };
    t -= sceneSecs[i];
  }
  return { index: sceneSecs.length - 1, progress: 0.99 };
}

/** Clip lengths the animation model can make, in whole seconds. */
export const CLIP_MIN_SECONDS = 3;
export const CLIP_MAX_SECONDS = 10;

/** Seconds of animation to request so one clip covers the whole scene. */
export function clipSecondsFor(sceneSecs: number) {
  return Math.min(CLIP_MAX_SECONDS, Math.max(CLIP_MIN_SECONDS, Math.ceil(sceneSecs)));
}

/** Playback speed that stretches a clip to last exactly the scene, so it plays once and never loops. */
export function clipRate(clipSecs: number, sceneSecs: number) {
  if (!(clipSecs > 0) || !(sceneSecs > 0)) return 1;
  return Math.min(4, Math.max(0.25, clipSecs / sceneSecs));
}
