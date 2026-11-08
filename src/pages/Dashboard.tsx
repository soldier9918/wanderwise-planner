import { SCENE_COUNTS } from "@/lib/sceneCount";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Sparkles, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TEMPLATES } from "@/lib/templates";
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
import { STYLES, VOICES, TONES, CAPTION_STYLES, generateScript, generateThumbnail, suggestTopic, signedUrls } from "@/lib/videoApi";
import { DEFAULT_RATIO } from "@/lib/aspectRatio";
import { DEFAULT_QUALITY, QUALITIES } from "@/lib/quality";
import { MUSIC_MOODS } from "@/lib/music";
import { estimateCredits } from "@/lib/credits";
import { VIDEO_LENGTHS, formatSeconds, isLengthAllowed, secondsPerScene } from "@/lib/durations";

export default function Dashboard({ fromUrl = false }: { fromUrl?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
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
  const lengthOk = isLengthAllowed(Number(length), Number(scenes));
  const [useFacts, setUseFacts] = useState(false);
  const [url, setUrl] = useState("");
  const [template, setTemplate] = useState<string | null>(null);
  const [accent, setAccent] = useState("none");
  const [speed, setSpeed] = useState("1");
  const [busy, setBusy] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [thumbBusy, setThumbBusy] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // "Create video" in the header points here; bring the form back into view.
  useEffect(() => {
    if (location.hash !== "#new-video") return;
    document.getElementById("new-video")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash, fromUrl]);

  const makeThumbnail = async (videoId: string) => {
    setThumbBusy(videoId);
    try {
      await generateThumbnail(videoId);
      await queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.success("Thumbnail ready!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setThumbBusy(null);
    }
  };

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

  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("id, title, topic, style, aspect_ratio, thumbnail_path, created_at, sources, seo, quality")
        .order("created_at", { ascending: false });
      if (error) throw error;
      type VideoRow = (typeof data)[number] & { thumb: string | null; credits: number };
      if (!data.length) return [] as VideoRow[];

      // Fetch each video's scene 1 image and sign URLs for thumbnails.
      const { data: allScenes } = await supabase
        .from("video_scenes")
        .select("video_id, image_path, clip_path, clip_credit, position")
        .in("video_id", data.map((v) => v.id));
      const scenes = (allScenes ?? []).filter((s) => s.position === 0);
      const creditsFor = (v: (typeof data)[number]) => {
        const mine = (allScenes ?? []).filter((s) => s.video_id === v.id);
        return estimateCredits({
          scenes: mine.length,
          useFacts: Array.isArray(v.sources) && v.sources.length > 0,
          animated: mine.filter((s) => s.clip_path && !s.clip_credit).length,
          thumbnail: !!v.thumbnail_path,
          seo: !!v.seo,
          quality: v.quality,
        });
      };
      const paths = [
        ...(scenes ?? []).map((s) => s.image_path),
        ...data.map((v) => v.thumbnail_path),
      ].filter((p): p is string => !!p);
      const urls = await signedUrls(paths);
      const thumbByVideo: Record<string, string> = {};
      (scenes ?? []).forEach((s) => {
        if (s.image_path && urls[s.image_path]) thumbByVideo[s.video_id] = urls[s.image_path];
      });
      // A generated thumbnail wins over the scene 1 image.
      data.forEach((v) => {
        if (v.thumbnail_path && urls[v.thumbnail_path]) thumbByVideo[v.id] = urls[v.thumbnail_path];
      });
      return data.map((v): VideoRow => ({ ...v, thumb: thumbByVideo[v.id] ?? null, credits: creditsFor(v) }));
    },
  });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { videoId } = await generateScript({ topic, sourceUrl: fromUrl ? url.trim() : undefined, narrationSpeed: Number(speed), accent, style, voice, tone, sceneCount: Number(scenes), captionStyle: caption, aspectRatio: ratio, quality, targetSeconds: Number(length), useFacts });
      await supabase.from("videos").update({ music_mood: mood, music_enabled: mood !== "none" }).eq("id", videoId);
      navigate(`/video/${videoId}?autogen=1`);
    } catch (err) {
      toast.error((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container grid gap-10 py-10 lg:grid-cols-[1.1fr_1fr]">
        <section id="new-video" className="scroll-mt-24">
          <h1 className="text-4xl font-extrabold">{fromUrl ? "Article to video" : "New video"}</h1>
          <p className="mt-2 text-muted-foreground">{fromUrl ? "Paste a link to a blog post, news story or Wikipedia article. AI reads it, summarises it and writes a ready-to-render scene script." : "Describe your idea. AI writes the script, then makes the scenes and voiceover."}</p>
          <div className="mt-4 flex gap-2 text-sm">
            <Link to="/dashboard" className={`rounded-full border px-3 py-1 ${!fromUrl ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>From an idea</Link>
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
              <Textarea id="topic" rows={4} required minLength={3} placeholder="e.g. Why octopuses might be the smartest animals on Earth"
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
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{VOICES.map((v) => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
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
                  <SelectContent>{SCENE_COUNTS.map(String).map((n) => <SelectItem key={n} value={n}>{n} scenes</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Video length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{VIDEO_LENGTHS.map((s) => (
                    <SelectItem key={s} value={String(s)} disabled={!isLengthAllowed(s, Number(scenes))}>{s < 60 ? `${s} seconds` : `${s / 60} min`}</SelectItem>
                  ))}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Quality</Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{QUALITIES.map((q) => <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>)}</SelectContent>
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
              {lengthOk ? `${scenes} scenes × about ${formatSeconds(secondsPerScene(Number(length), Number(scenes)))} each = ${formatSeconds(Number(length))}` : "That length doesn't fit this many scenes — pick another length."}
            </p>
            <p className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <span className="text-muted-foreground">Estimated cost (script, images, voiceovers, quality)</span>
              <Link to="/pricing" className="font-display font-bold text-primary hover:underline">⚡ {estimateCredits({ scenes: Number(scenes), useFacts: useFacts || fromUrl, quality })} credits</Link>
            </p>
            <Button type="submit" size="lg" disabled={busy || !lengthOk}>{busy ? "Writing your script…" : "Generate video"}</Button>
          </form>
        </section>

        <section>
          <h2 className="text-2xl font-bold">My videos</h2>
          <div className="mt-4 grid gap-3">
            {isLoading && <p className="text-muted-foreground">Loading…</p>}
            {videos?.length === 0 && <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">No videos yet — create your first one.</p>}
            {videos?.map((v) => (
              <Link key={v.id} to={`/video/${v.id}`} className="group flex gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary">
                {v.thumb ? (
                  <img src={v.thumb} alt="" className="h-20 w-32 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">No image</div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold group-hover:text-primary">{v.title}</p>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{v.topic}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{v.style} · {v.aspect_ratio ?? "16:9"} · {new Date(v.created_at).toLocaleDateString()} · <span className="font-semibold text-primary">⚡ ~{v.credits} credits</span></p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    disabled={thumbBusy === v.id}
                    onClick={(e) => { e.preventDefault(); makeThumbnail(v.id); }}
                  >
                    <ImagePlus className="h-4 w-4" />
                    {thumbBusy === v.id ? "Creating…" : v.thumbnail_path ? "Regenerate thumbnail" : "Generate thumbnail"}
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
