import { supabase } from "@/integrations/supabase/client";

export const STYLES = ["Documentary", "Cinematic", "Anime", "3D render", "Watercolor", "Retro comic", "Minimal flat"] as const;
export const VOICES = [
  { id: "Kore", label: "Kore — firm, clear" },
  { id: "Puck", label: "Puck — upbeat" },
  { id: "Charon", label: "Charon — deep, informative" },
  { id: "Aoede", label: "Aoede — breezy" },
  { id: "Fenrir", label: "Fenrir — excitable" },
] as const;

export type Scene = {
  id: string;
  video_id: string;
  position: number;
  heading: string;
  narration: string;
  visual_prompt: string;
  image_path: string | null;
  audio_path: string | null;
};

async function invoke<T>(name: string, body: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    let message = error.message;
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx) message = (await ctx.json()).error ?? message;
    } catch { /* ignore */ }
    throw new Error(message);
  }
  return data as T;
}

export const generateScript = (input: { topic: string; style: string; voice: string; sceneCount: number }) =>
  invoke<{ videoId: string }>("generate-script", input);

export const generateSceneAsset = (sceneId: string, kind: "image" | "audio") =>
  invoke<{ path: string }>("scene-asset", { sceneId, kind });

export async function signedUrls(paths: string[]) {
  if (!paths.length) return {} as Record<string, string>;
  const { data, error } = await supabase.storage.from("video-assets").createSignedUrls(paths, 60 * 60);
  if (error) throw error;
  const map: Record<string, string> = {};
  data.forEach((d) => { if (d.path && d.signedUrl) map[d.path] = d.signedUrl; });
  return map;
}
