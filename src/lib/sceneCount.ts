/** Scene counts offered in the "Scenes" menu. */
export const SCENE_COUNTS = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 30, 40, 50] as const;
export const MIN_SCENES = 4;
export const MAX_SCENES = 50;

/** Keeps a requested count inside the range the script writer can deliver. */
export function clampSceneCount(n: number) {
  if (!isFinite(n)) return MIN_SCENES;
  return Math.min(MAX_SCENES, Math.max(MIN_SCENES, Math.round(n)));
}

/** Menu options: the floor, the usual counts, plus whatever this video already has. */
export function sceneCountOptions(current: number) {
  const counts = new Set<number>([MIN_SCENES, ...SCENE_COUNTS, clampSceneCount(current)]);
  return [...counts].sort((a, b) => a - b);
}

/** What has to happen to go from `current` scenes to `target`. */
export function planSceneChange(current: number, target: number) {
  const t = clampSceneCount(target);
  return { target: t, add: Math.max(0, t - current), remove: Math.max(0, current - t) };
}
