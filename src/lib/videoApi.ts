import { supabase } from "@/integrations/supabase/client";

export const STYLES = ["Documentary", "Cinematic", "Anime", "3D render", "Watercolor", "Retro comic", "Minimal flat"] as const;
export const VOICES = [
  { id: "Kore", label: "Kore — Female, firm and clear" },
  { id: "Aoede", label: "Aoede — Female, breezy" },
  { id: "Leda", label: "Leda — Female, youthful" },
  { id: "Callirrhoe", label: "Callirrhoe — Female, easy-going" },
  { id: "Autonoe", label: "Autonoe — Female, bright" },
  { id: "Despina", label: "Despina — Female, smooth" },
  { id: "Erinome", label: "Erinome — Female, clear" },
  { id: "Laomedeia", label: "Laomedeia — Female, upbeat" },
  { id: "Sulafat", label: "Sulafat — Female, warm" },
  { id: "Vindemiatrix", label: "Vindemiatrix — Female, gentle" },
  { id: "Puck", label: "Puck — Male, upbeat" },
  { id: "Charon", label: "Charon — Male, deep and informative" },
  { id: "Fenrir", label: "Fenrir — Male, excitable" },
  { id: "Orus", label: "Orus — Male, firm" },
  { id: "Enceladus", label: "Enceladus — Male, breathy" },
  { id: "Iapetus", label: "Iapetus — Male, clear" },
  { id: "Umbriel", label: "Umbriel — Male, easy-going" },
  { id: "Algieba", label: "Algieba — Male, smooth" },
  { id: "Algenib", label: "Algenib — Male, gravelly" },
  { id: "Rasalgethi", label: "Rasalgethi — Male, informative" },
  { id: "Achernar", label: "Achernar — Male, soft" },
  { id: "Schedar", label: "Schedar — Male, even" },
] as const;
export const CAPTION_STYLES = [
  { id: "typewriter", label: "Typewriter — words appear one by one" },
  { id: "pop", label: "Word pop — words pile up on screen" },
  { id: "sentence", label: "Sentence — two lines at a time" },
  { id: "full", label: "Full text — the whole caption at once" },
  { id: "none", label: "None — no captions" },
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

export const generateScript = (input: { topic: string; style: string; voice: string; sceneCount: number; captionStyle: string; aspectRatio: string }) =>
  invoke<{ videoId: string }>("generate-script", input);

export const suggestTopic = (hint?: string) =>
  invoke<{ idea: string }>("suggest-topic", { hint });

export const generateThumbnail = (videoId: string) =>
  invoke<{ path: string }>("generate-thumbnail", { videoId });

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
