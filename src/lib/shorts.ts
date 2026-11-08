import { supabase } from "@/integrations/supabase/client";

/** Settings a Shorts / TikTok cut gets: vertical, punchy word-pop captions, big bold text. */
export const SHORTS_LOOK = {
  aspect_ratio: "9:16",
  caption_style: "pop",
  caption_size: "large",
  caption_font: "impact",
} as const;

export const shortsTitle = (title: string) =>
  /\(Shorts cut\)$/.test(title) ? title : `${title} (Shorts cut)`;

/** Copies a video and its scenes (reusing the same media files, so no credits) as a 9:16 cut. */
export async function remixToShorts(videoId: string): Promise<string> {
  const { data: v, error } = await supabase.from("videos").select("*").eq("id", videoId).single();
  if (error || !v) throw new Error("Couldn't load the video");
  const { id: _id, created_at: _c, updated_at: _u, ...rest } = v;
  const { data: copy, error: e2 } = await supabase
    .from("videos")
    .insert({ ...rest, ...SHORTS_LOOK, title: shortsTitle(v.title) })
    .select("id")
    .single();
  if (e2 || !copy) throw new Error("Couldn't create the Shorts cut");
  const { data: scenes } = await supabase.from("video_scenes").select("*").eq("video_id", videoId).order("position");
  if (scenes?.length) {
    const rows = scenes.map(({ id: _i, created_at: _ca, clip_job_id: _j, ...s }) => ({ ...s, video_id: copy.id }));
    const { error: e3 } = await supabase.from("video_scenes").insert(rows);
    if (e3) {
      await supabase.from("videos").delete().eq("id", copy.id);
      throw new Error("Couldn't copy the scenes");
    }
  }
  return copy.id;
}
