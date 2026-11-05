import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import RatioSelect from "@/components/RatioSelect";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STYLES, VOICES, CAPTION_STYLES, generateScript, suggestTopic } from "@/lib/videoApi";
import { DEFAULT_RATIO } from "@/lib/aspectRatio";

export default function Dashboard() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<string>("Cinematic");
  const [voice, setVoice] = useState<string>("Kore");
  const [scenes, setScenes] = useState("6");
  const [caption, setCaption] = useState<string>("typewriter");
  const [ratio, setRatio] = useState<string>(DEFAULT_RATIO);
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

  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("id, title, topic, style, aspect_ratio, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { videoId } = await generateScript({ topic, style, voice, sceneCount: Number(scenes), captionStyle: caption, aspectRatio: ratio });
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
              <Link key={v.id} to={`/video/${v.id}`} className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary">
                <p className="font-semibold group-hover:text-primary">{v.title}</p>
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{v.topic}</p>
                <p className="mt-2 text-xs text-muted-foreground">{v.style} · {v.aspect_ratio ?? "16:9"} · {new Date(v.created_at).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
