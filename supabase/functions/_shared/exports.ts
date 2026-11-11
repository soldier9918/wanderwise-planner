// Pure export rules shared by the `video-export` function and tests.
export const EXPORT_COSTS = { "720p": 2, "1080p": 5 } as const;
export const MB = 1024 * 1024;
/** Hard caps per stored export file (Free videos are ≤2 min at 720p). */
export const MAX_EXPORT_BYTES = { free: 300 * MB, paid: 2048 * MB } as const;
/** A render that never completes is failed and refunded after this long. */
export const RENDER_TIMEOUT_MS = 90 * 60 * 1000;

export type Quality = keyof typeof EXPORT_COSTS;
export const effectiveQuality = (requested: unknown, paid: boolean): Quality => (paid && requested === "1080p" ? "1080p" : "720p");
export const exportFormat = (f: unknown): "mp4" | "webm" => (f === "webm" ? "webm" : "mp4");
export const exportCost = (q: Quality) => EXPORT_COSTS[q];
export const maxExportBytes = (paid: boolean) => (paid ? MAX_EXPORT_BYTES.paid : MAX_EXPORT_BYTES.free);

/** Fields of a video row that change the rendered output. */
const VIDEO_FIELDS = ["caption_style","caption_font","caption_color","caption_size","aspect_ratio","music_mood","music_volume","music_ducking","music_path","music_enabled","sfx_enabled","sfx_type","sfx_volume","motion_enabled","motion_type","transition_enabled","transition_type","narration_speed","logo_path","logo_position","logo_opacity"] as const;
const SCENE_FIELDS = ["id","position","narration","image_path","audio_path","clip_path"] as const;

type Row = Record<string, unknown>;
const pick = (r: Row, keys: readonly string[]) => Object.fromEntries(keys.map((k) => [k, r[k] ?? null]));
const stable = (v: unknown): string => Array.isArray(v) ? `[${v.map(stable).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v as Row).sort().map((k) => `${JSON.stringify(k)}:${stable((v as Row)[k])}`).join(",")}}` : JSON.stringify(v ?? null);

/** Canonical description of everything that affects the exported file. */
export function versionSource(video: Row, scenes: Row[], cards: unknown, opts: { quality: Quality; format: string; watermark: boolean }) {
  const ordered = [...scenes].sort((a, b) => Number(a.position) - Number(b.position)).map((s) => pick(s, SCENE_FIELDS));
  return stable({ v: 1, video: pick(video, VIDEO_FIELDS), scenes: ordered, cards: cards ?? null, ...opts });
}

export async function versionHash(video: Row, scenes: Row[], cards: unknown, opts: { quality: Quality; format: string; watermark: boolean }) {
  const bytes = new TextEncoder().encode(versionSource(video, scenes, cards, opts));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** What a download request should do. Stored identical exports are always free. */
export function exportDecision(i: { hasCompleted: boolean; rendering: boolean; isAdmin: boolean; balance: number; cost: number }):
  "download" | "busy" | "render" | "insufficient" {
  if (i.hasCompleted) return "download";
  if (i.rendering) return "busy";
  if (i.isAdmin || i.balance >= i.cost) return "render";
  return "insufficient";
}
