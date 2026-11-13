import { SCENE_COUNTS } from "@/lib/sceneCount";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Link2, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TEMPLATES } from "@/lib/templates";
import { VoiceSampleButton } from "@/components/VoiceSampleButton";
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
import { STYLES, VOICES, TONES, CAPTION_STYLES, generateScript, suggestTopic } from "@/lib/videoApi";
import { DEFAULT_RATIO } from "@/lib/aspectRatio";
import { DEFAULT_QUALITY, QUALITIES } from "@/lib/quality";
import { MUSIC_MOODS } from "@/lib/music";
import { estimateCredits } from "@/lib/credits";
import { useAccount } from "@/lib/account";
import { voiceAllowed, scenesAllowedForTier, lengthAllowedForPlan, qualityAllowedForPlan, FREE_MAX_SCENES } from "@/lib/tiers";
import { VIDEO_LENGTHS, formatSeconds, isLengthAllowed, secondsPerScene, minScenesForSeconds, maxScenesForSeconds } from "@/lib/durations";

export default function Create({ fromUrl = false }: { fromUrl?: boolean }) {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<string>("Cinematic");
  const [voice, setVoice] = useState<string>("Kore");
  const [tone, setTone] = useState<string>("engaging");
  const [scenes, setScenes] = useState("6");
  const [caption, setCaption] = useState<string>("typewriter");
  const [ratio, setRatio] = useState<string>(DEFAULT_RATIO);
  const [quality, setQuality] = useState<string>(DEFAULT_QUALITY);
  const [mood, setMood] = useState<string>("none");
  const [length, setLength] = useState("60");
  const { data: account } = useAccount();
  const pro = account?.pro ?? false;
  const tier = account?.tier ?? "free";
  const lengthAllowedForTier = (sec: number, _p: boolean) => lengthAllowedForPlan(sec, tier);
  const qualityAllowedForTier = (q: string, _p: boolean) => qualityAllowedForPlan(q, tier);
  const tierOk = voiceAllowed(voice, pro) && lengthAllowedForTier(Number(length), pro) && scenesAllowedForTier(Number(scenes), pro) && qualityAllowedForTier(quality, pro);
  const lengthOk = isLengthAllowed(Number(length), Number(scenes));
  const [useFacts, setUseFacts] = useState(false);
  const [url, setUrl] = useState("");
  const [template, setTemplate] = useState<string | null>(null);
  const [accent, setAccent] = useState("none");
  const [speed, setSpeed] = useState("1");
  const [busy, setBusy] = useState(false);
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
    const poll = setInterval(async () => { const vid = await findNew().catch(() => null); if (vid) go(vid); }, 4000);
    try {
      const { videoId } = await generateScript({ topic, sourceUrl: fromUrl ? url.trim() : undefined, narrationSpeed: Number(speed), accent, style, voice, tone, sceneCount: Number(scenes), captionStyle: caption, aspectRatio: ratio, quality, targetSeconds: Number(length), useFacts });
      await supabase.from("videos").update({ music_mood: mood, music_enabled: mood !== "none" }).eq("id", videoId);
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

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container max-w-4xl py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-4xl font-extrabold">{fromUrl ? "Article to video" : "Create video"}</h1>
            <p className="mt-2 text-muted-foreground">{fromUrl ? "Paste a link to a blog post, news story or Wikipedia article. AI reads it, summarises it and writes a ready-to-render scene script." : "Describe your idea. AI writes the script, then makes the scenes and voiceover."}</p>
          </div>
          <Button variant="outline" asChild className="shrink-0">
            <Link to="/dashboard" className="inline-flex items-center gap-1.5"><Play className="h-4 w-4" />My videos</Link>
          </Button>
        </div>

        <div className="mt-4 flex gap-2 text-sm">
          <Link to="/create" className={`rounded-full border px-3 py-1 ${!fromUrl ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>From an idea</Link>
          <Link to="/from-url" className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${fromUrl ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}><Link2 className="h-3.5 w-3.5" />From a link</Link>
        </div>

        <form onSubmit={create} className="mt-6 grid gap-5 rounded-xl border border-border bg-card p-6">
          {fromUrl ? (
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
              <div className="flex gap-2"><Select value={voice} onValueChange={setVoice}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{VOICES.map((v) => <SelectItem key={v.id} value={v.id} disabled={!voiceAllowed(v.id, pro)}>{voiceAllowed(v.id, pro) ? v.label : `🔒 ${v.label} · PRO`}</SelectItem>)}</SelectContent>
              </Select><VoiceSampleButton voice={voice} accent={accent} className="h-10 shrink-0" /></div>
              <span className="text-xs text-muted-foreground">Listen is free — hear the voice and accent before you spend credits.</span>
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
                <SelectContent>{SCENE_COUNTS.map(String).map((n) => <SelectItem key={n} value={n} disabled={!scenesAllowedForTier(Number(n), pro) || !isLengthAllowed(Number(length), Number(n))}>{!scenesAllowedForTier(Number(n), pro) ? `🔒 ${n} scenes · PRO` : !isLengthAllowed(Number(length), Number(n)) ? `${n} scenes · ${Number(n) > maxScenesForSeconds(Number(length)) ? "too many" : "too few"} for ${formatSeconds(Number(length))}` : `${n} scenes`}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Video length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{VIDEO_LENGTHS.map((s) => (
                  <SelectItem key={s} value={String(s)} disabled={!isLengthAllowed(s, Number(scenes)) || !lengthAllowedForTier(s, pro)}>{!lengthAllowedForTier(s, pro) ? "🔒 " : ""}{s < 60 ? `${s} seconds` : `${s / 60} min`}{!lengthAllowedForTier(s, pro) ? " · PRO" : !isLengthAllowed(s, Number(scenes)) ? (Number(scenes) < minScenesForSeconds(s) ? ` · needs ${minScenesForSeconds(s)}+ scenes` : ` · max ${maxScenesForSeconds(s)} scenes`) : ""}</SelectItem>
                ))}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{QUALITIES.map((q) => { const ok = qualityAllowedForTier(q.value, pro); return <SelectItem key={q.value} value={q.value} disabled={!ok}>{ok ? q.label : `🔒 ${q.short} · PRO`}</SelectItem>; })}</SelectContent>
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
            {lengthOk ? `${scenes} scenes × about ${formatSeconds(secondsPerScene(Number(length), Number(scenes)))} each = ${formatSeconds(Number(length))}` : Number(scenes) < minScenesForSeconds(Number(length)) ? `A ${formatSeconds(Number(length))} video needs at least ${minScenesForSeconds(Number(length))} scenes (each scene can last up to 90s). Pick more scenes or a shorter length.` : `A ${formatSeconds(Number(length))} video fits at most ${maxScenesForSeconds(Number(length))} scenes (each scene needs at least 7s). Pick fewer scenes or a longer length.`}
          </p>
          <p className="-mt-3 text-xs text-muted-foreground">
            Longer videos need more scenes — greyed-out lengths show how many scenes they need.
          </p>
          <p className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <span className="text-muted-foreground">Estimated cost (script, images, voiceovers, quality)</span>
            <Link to="/pricing" className="font-display font-bold text-primary hover:underline">⚡ {estimateCredits({ scenes: Number(scenes), useFacts: useFacts || fromUrl, quality })} credits</Link>
          </p>
          {!pro && <p className="text-xs text-muted-foreground">Free plan: 4 narrators, up to {FREE_MAX_SCENES} scenes, 2-minute videos and 720p. <Link to="/billing" className="text-primary underline">Subscribe to a plan</Link> to unlock every narrator and longer videos (Creator: 20 min, Pro: 60 min + 1080p).</p>}
          <Button type="submit" size="lg" disabled={busy || !lengthOk || !tierOk}>{busy ? "Writing your script…" : "Generate video"}</Button>
        </form>
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
        {!fromUrl && (
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
