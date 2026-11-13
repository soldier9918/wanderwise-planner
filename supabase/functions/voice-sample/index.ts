// Free narrator previews. Each voice+accent sample is generated once and cached in storage,
// so repeated listens never call the AI again and never cost credits.
import { corsHeaders, GATEWAY_URL, json, getUserClient, adminClient, gatewayError } from "../_shared/common.ts";

const SPEECH_MODEL = "google/gemini-3.1-flash-tts-preview";
const VOICES = new Set(["Kore","Aoede","Leda","Callirrhoe","Autonoe","Despina","Erinome","Laomedeia","Sulafat","Vindemiatrix","Puck","Charon","Fenrir","Orus","Enceladus","Iapetus","Umbriel","Algieba","Algenib","Rasalgethi","Achernar","Alnilam","Gacrux","Pulcherrima","Achird","Zubenelgenubi","Sadachbia","Sadaltager","Schedar","Zephyr"]);
const ACCENTS: Record<string, string> = {
  british: "a natural British (Received Pronunciation) accent",
  us: "a natural General American accent",
  australian: "a natural Australian accent",
  scottish: "a natural Scottish accent",
};
const SAMPLE = "Hi, I'm your Vydora narrator. Here's how I'll sound telling your story on YouTube.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);
    const { voice, accent } = await req.json();
    if (!VOICES.has(voice)) return json({ error: "Unknown narrator." }, 400);
    const acc = accent && ACCENTS[accent] ? accent : "none";
    const path = `samples/${voice}_${acc}.wav`;
    const store = adminClient().storage.from("video-assets");

    const { data: existing } = await store.list("samples", { search: `${voice}_${acc}.wav` });
    if (!existing?.some((f) => f.name === `${voice}_${acc}.wav`)) {
      const apiKey = Deno.env.get("LOVABLE_API_KEY");
      if (!apiKey) return json({ error: "Voice previews are unavailable right now." }, 500);
      const res = await fetch(`${GATEWAY_URL}/v1/audio/speech`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: SPEECH_MODEL,
          contents: [{ role: "user", parts: [{ text: `Say in a friendly, engaging way${acc !== "none" ? `, with ${ACCENTS[acc]}` : ""}: ${SAMPLE}` }] }],
          generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
          stream_format: "audio",
        }),
      });
      if (!res.ok) return gatewayError(res);
      const bytes = new Uint8Array(await res.arrayBuffer());
      if (bytes.length < 100) return json({ error: "No audio was returned. Please try again." }, 502);
      const { error } = await store.upload(path, bytes, { contentType: res.headers.get("Content-Type") ?? "audio/wav", upsert: true });
      if (error) return json({ error: "Couldn't save the preview." }, 500);
    }
    const { data: signed, error } = await store.createSignedUrl(path, 3600);
    if (error || !signed) return json({ error: "Couldn't load the preview." }, 500);
    return json({ url: signed.signedUrl });
  } catch (e) {
    console.error(e);
    return json({ error: "Something went wrong." }, 500);
  }
});
