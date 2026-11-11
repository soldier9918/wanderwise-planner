import { createOpenAI } from "npm:@ai-sdk/openai@3";
import { streamText } from "npm:ai@6";
import { corsHeaders, GATEWAY_URL, json, getUserClient, adminClient } from "../_shared/common.ts";
import { charge, refund, requireMutable, COSTS } from "../_shared/credits.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);
    const { sceneId } = await req.json();
    if (typeof sceneId !== "string" || !sceneId) return json({ error: "Invalid request." }, 400);

    const { data: scene, error } = await auth.client
      .from("video_scenes")
      .select("id, video_id, position, heading, narration")
      .eq("id", sceneId)
      .maybeSingle();
    if (error) throw error;
    if (!scene) return json({ error: "Scene not found." }, 404);

    const locked = await requireMutable(auth.user.id);
    if (locked) return locked;
    const { data: video } = await auth.client.from("videos").select("title, topic, target_seconds").eq("id", scene.video_id).maybeSingle();
    const { data: all } = await auth.client.from("video_scenes").select("position, heading, narration").eq("video_id", scene.video_id).order("position");
    const scenes = all ?? [];
    const words = Math.max(8, scene.narration.trim().split(/\s+/).length);
    const outline = scenes.map((s) => `Scene ${s.position + 1}${s.position === scene.position ? " (REWRITE THIS ONE)" : ""}: ${s.heading} — ${s.narration}`).join("\n");
    const isLast = scene.position === scenes.length - 1;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);

    const provider = createOpenAI({
      baseURL: `${GATEWAY_URL}/v1`,
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    const denied = await charge(auth.user.id, COSTS.script, "scene_rewrite");
    if (denied) return denied;
    let ok = false;
    try {
    let narration = "";
    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        system: `You are a YouTube scriptwriter. Rewrite the narration for one scene of an existing script with a fresh, engaging take. Keep it about ${words} words, keep it consistent with the surrounding scenes, keep any facts already stated, and do not repeat other scenes.${isLast ? " End with a call to subscribe." : ""} Reply with only the new narration text — no quotes, labels or notes.`,
        messages: [{ role: "user", content: `Video title: ${video?.title ?? ""}\nVideo idea: ${video?.topic ?? ""}\n\nScript:\n${outline}\n\nWrite the new narration for scene ${scene.position + 1} ("${scene.heading}").` }],
        abortSignal: req.signal,
        providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } },
      });
      narration = (await result.text).trim().replace(/^["']|["']$/g, "");
    } catch (e) {
      const status = (e as { statusCode?: number })?.statusCode ?? 500;
      if (status === 402) return json({ error: "Your workspace is out of AI credits. Add credits in Settings → Plans & credits." }, 402);
      if (status === 429) return json({ error: "Too many requests right now — please wait a moment and try again." }, 429);
      throw e;
    }
    if (!narration) return json({ error: "No new script was written. Please try again." }, 502);

    const { error: uErr } = await adminClient().from("video_scenes").update({ narration, audio_path: null }).eq("id", scene.id);
    if (uErr) throw uErr;
    ok = true;
    return json({ narration });
    } finally {
      if (!ok) await refund(auth.user.id, COSTS.script, "refund_scene_rewrite");
    }
  } catch (e) {
    console.error("rewrite-scene error", e);
    return json({ error: "Something went wrong rewriting this scene." }, 500);
  }
});
