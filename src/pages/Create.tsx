import { SCENE_COUNTS } from "@/lib/sceneCount";
import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Link2, Play, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TEMPLATES } from "@/lib/templates";
import { VoiceSelect } from "@/components/VoiceSelect";
import { ACCENTS, NARRATION_SPEEDS } from "@/lib/voiceStyle";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import RatioSelect from "@/components/RatioSelect";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STYLES, TONES, CAPTION_STYLES, generateScript, suggestTopic } from "@/lib/videoApi";
import { DEFAULT_RATIO } from "@/lib/aspectRatio";
import { DEFAULT_QUALITY, QUALITIES } from "@/lib/quality";
import { MUSIC_MOODS } from "@/lib/music";
import { estimateCredits } from "@/lib/credits";
import { useAccount } from "@/lib/account";
import { voiceAllowed, scenesAllowedForPlan, lengthAllowedForPlan, qualityAllowedForPlan, FREE_MAX_SCENES } from "@/lib/tiers";
import { VIDEO_LENGTHS, formatSeconds, isLengthAllowed, secondsPerScene, minScenesForSeconds, maxScenesForSeconds } from "@/lib/durations";

export type PlanSettings = Record<string, string | boolean>;
const initialSettings = (): PlanSettings => { try { return JSON.parse(new URLSearchParams(window.location.search).get("settings") || "{}"); } catch { return {}; } };

export const AD_FRAMEWORKS = [
  { id: "problem-solution", label: "Problem → Solution" },
  { id: "feature-tour", label: "Feature tour" },
  { id: "launch", label: "Launch or special offer" },
  { id: "before-after", label: "Before & after" },
];
const AD_IMG_TYPES = ["image/png", "image/jpeg", "image/webp"];

export default function Create({ fromUrl = false, adMode = false, onPlan, planExtra }: { fromUrl?: boolean; adMode?: boolean; onPlan?: (topic: string, settings: PlanSettings) => Promise<boolean>; planExtra?: ReactNode }) {
  const navigate = useNavigate();
  const [init] = useState(initialSettings);
  const g = (k: string, d: string) => (typeof init[k] === "string" ? (init[k] as string) : d);
  const [topic, setTopic] = useState(() => new URLSearchParams(window.location.search).get("idea") ?? "");
  const [style, setStyle] = useState<string>(g("style", "Cinematic"));
  const [voice, setVoice] = useState<string>(g("voice", "Kore"));
  const [tone, setTone] = useState<string>(g("tone", "engaging"));
  const [scenes, setScenes] = useState(g("scenes", "6"));
  const [caption, setCaption] = useState<string>(g("caption", "typewriter"));
  const [ratio, setRatio] = useState<string>(g("ratio", DEFAULT_RATIO));
  const [quality, setQuality] = useState<string>(g("quality", DEFAULT_QUALITY));
  const [mood, setMood] = useState<string>(g("mood", "none"));
  const [length, setLength] = useState(g("length", "60"));
  const { data: account } = useAccount();
  const pro = account?.pro ?? false;
  const tier = account?.tier ?? "free";
  const lengthAllowedForTier = (sec: number, _p: boolean) => lengthAllowedForPlan(sec, tier);
  const qualityAllowedForTier = (q: string, _p: boolean) => qualityAllowedForPlan(q, tier);
  const tierOk = voiceAllowed(voice, pro) && lengthAllowedForTier(Number(length), pro) && scenesAllowedForPlan(Number(scenes), tier) && qualityAllowedForTier(quality, pro);
  const lengthOk = isLengthAllowed(Number(length), Number(scenes));
  const [useFacts, setUseFacts] = useState(init.useFacts === true);
  const [url, setUrl] = useState("");
  const [template, setTemplate] = useState<string | null>(null);
  const [accent, setAccent] = useState(g("accent", "none"));
  const [speed, setSpeed] = useState(g("speed", "1"));
  const [busy, setBusy] = useState(false);
  const [framework, setFramework] = useState("problem-solution");
  const [cta, setCta] = useState("");
  const [adImages, setAdImages] = useState<File[]>([]);
  const addAdImages = (files: FileList | null) => {
    const ok = Array.from(files ?? []).filter((f) => {
      if (!AD_IMG_TYPES.includes(f.type)) { toast.error(`${f.name}: use PNG, JPEG or WebP.`); return false; }
      if (f.size > 10 * 1024 * 1024) { toast.error(`${f.name} is over 10 MB.`); return false; }
      return true;
    });
    setAdImages((cur) => [...cur, ...ok].slice(0, Number(scenes)));
  };
  const [suggesting, setSuggesting] = useState(false);

  const suggest = async () => {
    setSuggesting(true);
    try {
      const { idea } = await suggestTopic(topic);
      setTopic(idea);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSuggesting(false);
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onPlan) {
      setBusy(true);
      const ok = await onPlan(topic, { style, voice, tone, scenes, caption, ratio, quality, mood, length, accent, speed, useFacts });
      setBusy(false);
      if (ok) setTopic("");
      return;
    }
    setBusy(true);
    const started = new Date(Date.now() - 5000).toISOString();
    let moved = false;
    const go = (videoId: string) => { if (moved) return; moved = true; clearInterval(poll); navigate(`/video/${videoId}?autogen=1`); };
    // Fallback: if the reply is slow or lost, open the new video as soon as it has its scenes.
    const findNew = async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data: v } = await supabase.from("videos").select("id, video_scenes(count)").eq("user_id", u.user.id).gte("created_at", started).order("created_at", { ascending: false }).limit(1).maybeSingle();
      const n = (v as { video_scenes?: { count: number }[] } | null)?.video_scenes?.[0]?.count ?? 0;
      return v && n > 0 ? v.id : null;
    };
    const poll = setInterval(async () => { if (adMode) return; const vid = await findNew().catch(() => null); if (vid) go(vid); }, 4000);
    try {
      const { videoId } = await generateScript({ topic, sourceUrl: (fromUrl || adMode) && url.trim() ? url.trim() : undefined, ad: adMode ? { framework, cta } : undefined, narrationSpeed: Number(speed), accent, style, voice, tone, sceneCount: Number(scenes), captionStyle: caption, aspectRatio: ratio, quality, targetSeconds: Number(length), useFacts });
      await supabase.from("videos").update({ music_mood: mood, music_enabled: mood !== "none" }).eq("id", videoId);
      if (adMode && adImages.length) {
        // Put the user's product photos/screenshots on the scenes in order; the rest get AI images.
        const { data: u } = await supabase.auth.getUser();
        const { data: sc } = await supabase.from("video_scenes").select("id, position").eq("video_id", videoId).order("position");
        await Promise.all((sc ?? []).slice(0, adImages.length).map(async (row, i) => {
          const f = adImages[i];
          const ext = f.type === "image/png" ? "png" : f.type === "image/webp" ? "webp" : "jpg";
          const path = `${u.user!.id}/${videoId}/${row.id}-upload-${Date.now()}.${ext}`;
          const { error } = await supabase.storage.from("video-assets").upload(path, f, { contentType: f.type });
          if (!error) await supabase.from("video_scenes").update({ image_path: path }).eq("id", row.id);
        }));
      }
      go(videoId);
    } catch (err) {
      const vid = await findNew().catch(() => null);
      if (vid) return go(vid);
      clearInterval(poll);
      if (moved) return;
      toast.error((err as Error).message);
      setBusy(false);
    }
  };

  const formEl = (
        <form onSubmit={create} className={`${onPlan ? "" : "mt-6 "}grid gap-5 rounded-xl border border-border bg-card p-6`}>
          {adMode ? (
            <div className="grid gap-2">
              <Label htmlFor="url">Website or product page link (optional)</Label>
              <Input id="url" type="url" placeholder="https://yourshop.com/product" value={url} onChange={(e) => setUrl(e.target.value)} />
              <Label htmlFor="product" className="mt-2">About your product</Label>
              <Textarea id="product" rows={4} required={!url.trim()} placeholder="e.g. GlowBrew — a smart coffee mug that keeps drinks at your perfect temperature for 3 hours. For busy remote workers." value={topic} onChange={(e) => setTopic(e.target.value)} />
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Advert style</Label>
                  <Select value={framework} onValueChange={setFramework}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{AD_FRAMEWORKS.map((f) => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cta">Call to action</Label>
                  <Input id="cta" maxLength={120} placeholder="e.g. Visit glowbrew.com today" value={cta} onChange={(e) => setCta(e.target.value)} />
                </div>
              </div>
              <Label className="mt-2">Product photos or website screenshots (optional)</Label>
              <div className="flex flex-wrap gap-2">
                {adImages.map((f, i) => (
                  <div key={i} className="relative h-20 w-20 overflow-hidden rounded-md border border-border">
                    <img src={URL.createObjectURL(f)} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
                    <span className="absolute left-1 top-1 rounded bg-background/80 px-1 text-[10px]">Scene {i + 1}</span>
                    <button type="button" aria-label="Remove image" onClick={() => setAdImages((cur) => cur.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded bg-background/80 p-0.5"><X className="h-3 w-3" /></button>
                  </div>
                ))}
                {adImages.length < Number(scenes) && (
                  <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground hover:border-primary">
                    + Add
                    <input type="file" multiple accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { addAdImages(e.target.files); e.target.value = ""; }} />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">PNG, JPEG or WebP, up to 10 MB each. Your images are used on the first scenes in order; the rest get AI images. Only describe real features — the AI won't invent prices or reviews.</p>
            </div>
          ) : fromUrl ? (
            <div className="grid gap-2">
              <Label htmlFor="url">Article link</Label>
              <Input id="url" type="url" required placeholder="https://en.wikipedia.org/wiki/Octopus" value={url} onChange={(e) => setUrl(e.target.value)} />
              <Label htmlFor="angle" className="mt-2">Angle or focus (optional)</Label>
              <Textarea id="angle" rows={2} placeholder="e.g. Focus on the most surprising facts, for a curious teenage audience" value={topic} onChange={(e) => setTopic(e.target.value)} />
              <p className="text-xs text-muted-foreground">The article is listed as the source on your video. Reading it costs the same as "Use real facts".</p>
            </div>
          ) : (
            <div className="grid gap-2">
              <div>
                <Label>Start from a template</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TEMPLATES.map((t) => (
                    <button key={t.id} type="button"
                      onClick={() => { setTemplate(t.id); setTopic(t.idea); setTone(t.tone); setStyle(t.style); }}
                      className={`rounded-full border px-3 py-1 text-sm transition-colors ${template === t.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary"}`}>
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
                {template && <p className="mt-2 text-xs text-muted-foreground">Replace the [brackets] with your own subject. Tone and visual style were set for you.</p>}
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="topic">Video idea</Label>
                <Button type="button" variant="outline" size="sm" onClick={suggest} disabled={suggesting || busy}>
                  <Sparkles className="h-4 w-4" />
                  {suggesting ? "Thinking…" : "Suggest an idea"}
                </Button>
              </div>
              <Textarea id="topic" rows={4} required minLength={3} placeholder="e.g. The real reason the Titanic sank in under three hours"
                value={topic} onChange={(e) => setTopic(e.target.value)} />
              <label className="flex items-start gap-3 rounded-lg border border-border p-3">
                <Switch checked={useFacts} onCheckedChange={setUseFacts} className="mt-0.5" />
                <span className="text-sm">
                  <span className="font-semibold">Use real facts</span>
                  <span className="block text-muted-foreground">For real events: searches the web first and writes only from what it finds. Takes a little longer.</span>
                </span>
              </label>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="grid gap-2">
              <Label>Format</Label>
              <RatioSelect value={ratio} onChange={setRatio} />
            </div>
            <div className="grid gap-2">
              <Label>Visual style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STYLES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Voice</Label>
              <VoiceSelect value={voice} onChange={setVoice} pro={pro} accent={accent} />
              <span className="text-xs text-muted-foreground">Press play next to any narrator to hear them — listening is free and never uses credits.</span>
            </div>
            <div className="grid gap-2">
              <Label>Accent</Label>
              <Select value={accent} onValueChange={setAccent}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ACCENTS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Narration speed</Label>
              <Select value={speed} onValueChange={setSpeed}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{NARRATION_SPEEDS.map((n) => <SelectItem key={n} value={String(n)}>{n === 1 ? "1.0× — normal" : `${n}×`}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Tone & emotion</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TONES.map((v) => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Scenes</Label>
              <Select value={scenes} onValueChange={setScenes}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SCENE_COUNTS.map(String).map((n) => <SelectItem key={n} value={n} disabled={!scenesAllowedForPlan(Number(n), tier) || !isLengthAllowed(Number(length), Number(n))}>{!scenesAllowedForPlan(Number(n), tier) ? `🔒 ${n} scenes · ${tier === "free" ? "upgrade" : "PRO"}` : !isLengthAllowed(Number(length), Number(n)) ? `${n} scenes · ${Number(n) > maxScenesForSeconds(Number(length)) ? "too many" : "too few"} for ${formatSeconds(Number(length))}` : `${n} scenes`}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Video length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{VIDEO_LENGTHS.map((s) => (
                  <SelectItem key={s} value={String(s)} disabled={!isLengthAllowed(s, Number(scenes)) || !lengthAllowedForTier(s, pro)}>{!lengthAllowedForTier(s, pro) ? "🔒 " : ""}{formatSeconds(s)}{!lengthAllowedForTier(s, pro) ? " · PRO" : !isLengthAllowed(s, Number(scenes)) ? (Number(scenes) < minScenesForSeconds(s) ? ` · needs ${minScenesForSeconds(s)}+ scenes` : ` · max ${maxScenesForSeconds(s)} scenes`) : ""}</SelectItem>
                ))}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger className="[&>span]:truncate [&>span]:whitespace-nowrap"><SelectValue /></SelectTrigger>
                <SelectContent>{QUALITIES.map((q) => { const ok = qualityAllowedForTier(q.value, pro); return (
                  <SelectItem key={q.value} value={q.value} disabled={!ok}>
                    {ok ? q.label : `🔒 ${q.label} · PRO`}
                  </SelectItem>
                ); })}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Music</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MUSIC_MOODS.filter((m) => m.value !== "custom").map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Captions</Label>
              <Select value={caption} onValueChange={setCaption}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CAPTION_STYLES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <p className="-mt-2 text-sm text-muted-foreground">
            {lengthOk ? `${scenes} scenes × about ${formatSeconds(secondsPerScene(Number(length), Number(scenes)))} each = ${formatSeconds(Number(length))}` : Number(scenes) < minScenesForSeconds(Number(length)) ? `A video ${formatSeconds(Number(length))} long needs at least ${minScenesForSeconds(Number(length))} scenes (each scene can last up to 90 seconds). Pick more scenes or a shorter length.` : `A video ${formatSeconds(Number(length))} long fits at most ${maxScenesForSeconds(Number(length))} scenes (each scene needs at least 7 seconds). Pick fewer scenes or a longer length.`}
          </p>
          <p className="-mt-3 text-xs text-muted-foreground">
            Longer videos need more scenes — greyed-out lengths show how many scenes they need.
          </p>
          {planExtra}
          <p className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <span className="text-muted-foreground">Estimated cost (script, images, voiceovers, quality)</span>
            <Link to="/pricing" className="font-display font-bold text-primary hover:underline">⚡ {estimateCredits({ scenes: Number(scenes), useFacts: useFacts || fromUrl || (adMode && !!url.trim()), quality })} credits</Link>
          </p>
          {!pro && <p className="text-xs text-muted-foreground">Free plan: 4 narrators, up to {FREE_MAX_SCENES} scenes, 2-minute videos and 720p. <Link to="/billing" className="text-primary underline">Subscribe to a plan</Link> to unlock every narrator and longer videos (Creator: 20 minutes, Pro: 60 minutes + 1080p).</p>}
          <Button type="submit" size="lg" disabled={busy || !lengthOk || !tierOk}>{onPlan ? (busy ? "Adding…" : "Add to plan") : busy ? "Writing your script…" : "Generate video"}</Button>
        </form>
  );
  if (onPlan) return formEl;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container max-w-4xl py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-4xl font-extrabold">{adMode ? "Product ads" : fromUrl ? "Article to video" : "Create video"}</h1>
            <p className="mt-2 text-muted-foreground">{adMode ? "Add your website link or product details, plus photos or screenshots. AI writes a persuasive advert script with a narrator and builds the scenes." : fromUrl ? "Paste a link to a blog post, news story or Wikipedia article. AI reads it, summarises it and writes a ready-to-render scene script." : "Describe your idea. AI writes the script, then makes the scenes and voiceover."}</p>
          </div>
          <Button variant="outline" asChild className="shrink-0">
            <Link to="/dashboard" className="inline-flex items-center gap-1.5"><Play className="h-4 w-4" />My videos</Link>
          </Button>
        </div>

        {!adMode && <div className="mt-4 flex gap-2 text-sm">
          <Link to="/create" className={`rounded-full border px-3 py-1 ${!fromUrl ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>From an idea</Link>
          <Link to="/from-url" className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${fromUrl ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}><Link2 className="h-3.5 w-3.5" />From a link</Link>
        </div>}

        {formEl}
        {fromUrl && (
          <section className="mt-6 rounded-xl border border-border bg-card p-6 text-sm">
            <h2 className="font-display text-lg font-bold">Troubleshooting</h2>
            <ul className="mt-3 grid list-disc gap-2 pl-5 text-muted-foreground">
              <li>Use the full link to the article itself, starting with https:// — not a home page, search page or social media post.</li>
              <li>Pages behind a login or paywall, or ones that are mostly video, can't be read. Try a free, public version of the story.</li>
              <li>If you see "No scenes were written", the page may have very little text. Try another link or add more detail in "Angle or focus".</li>
              <li>If the video misses parts of the article, open the article in another tab and compare, then use "Angle or focus" to say what to cover.</li>
              <li>Still stuck? Email <a href="mailto:contact@vydora.ai" className="text-primary underline">contact@vydora.ai</a> with the link you used.</li>
            </ul>
          </section>
        )}
        {!fromUrl && !adMode && (
          <section className="mt-6 rounded-xl border border-border bg-card p-6 text-sm">
            <h2 className="font-display text-lg font-bold">Troubleshooting</h2>
            <ul className="mt-3 grid list-disc gap-2 pl-5 text-muted-foreground">
              <li>The <span className="text-foreground">Generate video</span> button stays greyed out if a narrator, scene count, length or quality marked 🔒 PRO is selected. Pick one without the lock, or <Link to="/billing" className="text-primary underline">subscribe to a plan</Link>.</li>
              <li>If it says "That length doesn't fit this many scenes", choose a longer length or fewer scenes so each scene has time to breathe.</li>
              <li>The script is written in a few seconds, then the editor opens and the pictures and voiceovers are made — that can take a few minutes for a longer video. Leave the page open while it works.</li>
              <li>If a scene is missing its picture or voiceover, open the video again from <Link to="/dashboard" className="text-primary underline">My videos</Link> — anything missing is made automatically.</li>
              <li>Check the credit estimate above before you press <span className="text-foreground">Generate video</span>. If your balance is too low, add credits on <Link to="/billing" className="text-primary underline">Plans &amp; Billing</Link>.</li>
              <li>Turn on <span className="text-foreground">Use real facts</span> for real events, people or news — Vydora searches the web first and writes only from what it finds, so it takes a little longer.</li>
              <li>Still stuck? Email <a href="mailto:contact@vydora.ai" className="text-primary underline">contact@vydora.ai</a> with what you typed and what you saw.</li>
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
