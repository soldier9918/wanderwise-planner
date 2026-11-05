/** A video format: the shape of the finished video. */
export type AspectRatio = {
  value: string;
  label: string;
  /** Short label shown in the closed menu box. */
  short: string;
  /** Canvas size (px) the downloaded video is rendered at. */
  w: number;
  h: number;
  /** Nearest size the image generator supports for this shape. */
  imageSize: string;
  /** CSS aspect-ratio used by the preview box. */
  css: string;
};

export const ASPECT_RATIOS = [
  { value: "16:9", label: "Landscape 16:9 — YouTube video", short: "Landscape 16:9", w: 1280, h: 720, imageSize: "1536x1024", css: "16 / 9" },
  { value: "9:16", label: "Portrait 9:16 — Shorts & Reels", short: "Portrait 9:16", w: 720, h: 1280, imageSize: "1024x1536", css: "9 / 16" },
  { value: "1:1", label: "Square 1:1 — Feed post", short: "Square 1:1", w: 1000, h: 1000, imageSize: "1024x1024", css: "1 / 1" },
  { value: "4:5", label: "Tall 4:5 — Instagram feed", short: "Tall 4:5", w: 864, h: 1080, imageSize: "1024x1536", css: "4 / 5" },
  { value: "21:9", label: "Cinematic 21:9 — Widescreen", short: "Cinematic 21:9", w: 1680, h: 720, imageSize: "1536x1024", css: "21 / 9" },
] as const;

export const DEFAULT_RATIO = "16:9";

export const isRatio = (v: string) => ASPECT_RATIOS.some((r) => r.value === v);

/** Falls back to landscape so older videos (and bad input) still render. */
export const ratioOf = (v?: string | null): AspectRatio => ASPECT_RATIOS.find((r) => r.value === v) ?? ASPECT_RATIOS[0];

/** Width in canvas px a caption line may use — the preview box matches this. */
export const captionWrapPx = (v?: string | null) => Math.round(ratioOf(v).w * 0.85);

/** Portrait formats are capped in width so the preview stays a sensible size on screen. */
export const previewMaxPx = (v?: string | null) => (ratioOf(v).w >= ratioOf(v).h ? undefined : 420);

/** Small rectangle (px) showing an option's shape, for the menu. */
export const shapeOf = (v: string) => {
  const r = ratioOf(v);
  const s = 20 / Math.max(r.w, r.h);
  return { w: Math.max(6, Math.round(r.w * s)), h: Math.max(6, Math.round(r.h * s)) };
};
