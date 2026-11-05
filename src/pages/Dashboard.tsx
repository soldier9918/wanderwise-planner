import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import RatioSelect from "@/components/RatioSelect";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STYLES, VOICES, CAPTION_STYLES, generateScript, generateThumbnail, suggestTopic, signedUrls } from "@/lib/videoApi";
import { DEFAULT_RATIO } from "@/lib/aspectRatio";
import { DEFAULT_QUALITY, QUALITIES } from "@/lib/quality";

export default function Dashboard() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<string>("Cinematic");
  const [voice, setVoice] = useState<string>("Kore");
  const [scenes, setScenes] = useState("6");
  const [caption, setCaption] = useState<string>("typewriter");
  const [ratio, setRatio] = useState<string>(DEFAULT_RATIO);
  const [quality, setQuality] = useState<string>(DEFAULT_QUALITY);
  const [busy, setBusy] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [thumbBusy, setThumbBusy] = useState<string | null>(null);
  const queryClient = useQueryClient();

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
        .select("id, title, topic, style, aspect_ratio, thumbnail_path, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      type VideoRow = (typeof data)[number] & { thumb: string | null };
      if (!data.length) return [] as VideoRow[];

      // Fetch each video's scene 1 image and sign URLs for thumbnails.
      const { data: scenes } = await supabase
        .from("video_scenes")
        .select("video_id, image_path")
        .in("video_id", data.map((v) => v.id))
        .eq("position", 0);
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
      return data.map((v): VideoRow => ({ ...v, thumb: thumbByVideo[v.id] ?? null }));
    },
  });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { videoId } = await generateScript({ topic, style, voice, sceneCount: Number(scenes), captionStyle: caption, aspectRatio: ratio, quality });
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
        <section>
          <h1 className="text-4xl font-extrabold">New video</h1>
          <p className="mt-2 text-muted-foreground">Describe your idea. AI writes the script, then makes the scenes and voiceover.</p>
          <form onSubmit={create} className="mt-6 grid gap-5 rounded-xl border border-border bg-card p-6">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="topic">Video idea</Label>
                <Button type="button" variant="outline" size="sm" onClick={suggest} disabled={suggesting || busy}>
                  <Sparkles className="h-4 w-4" />
                  {suggesting ? "Thinking…" : "Suggest an idea"}
                </Button>
              </div>
              <Textarea id="topic" rows={4} required minLength={3} placeholder="e.g. Why octopuses might be the smartest animals on Earth"
                value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
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
                <Label>Scenes</Label>
                <Select value={scenes} onValueChange={setScenes}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["4", "6", "8", "10", "12", "14", "16", "18", "20", "22"].map((n) => <SelectItem key={n} value={n}>{n} scenes (~{Number(n) * 12}s)</SelectItem>)}</SelectContent>
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
                <Label>Captions</Label>
                <Select value={caption} onValueChange={setCaption}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CAPTION_STYLES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" size="lg" disabled={busy}>{busy ? "Writing your script…" : "Generate video"}</Button>
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
                  <p className="mt-2 text-xs text-muted-foreground">{v.style} · {v.aspect_ratio ?? "16:9"} · {new Date(v.created_at).toLocaleDateString()}</p>
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
