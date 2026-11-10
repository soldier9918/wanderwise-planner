import { useState } from "react";
import { Link } from "react-router-dom";
import { Layers, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { STYLES, TONES, VOICES, generateScript, generateSeries, type SeriesPlan } from "@/lib/videoApi";
import { estimateCredits } from "@/lib/credits";
import { useAccount } from "@/lib/account";
import { voiceAllowed, FREE_MAX_SCENES } from "@/lib/tiers";

export default function Series() {
  const { data: account } = useAccount();
  const pro = account?.pro ?? false;
  const [topic, setTopic] = useState("");
  const [parts, setParts] = useState<3 | 5>(3);
  const [style, setStyle] = useState("Documentary");
  const [tone, setTone] = useState("history");
  const [voice, setVoice] = useState("Charon");
  const [scenes, setScenes] = useState("6");
  const [plan, setPlan] = useState<SeriesPlan | null>(null);
  const [planning, setPlanning] = useState(false);
  const [creating, setCreating] = useState<number | null>(null);
  const [made, setMade] = useState<Record<number, string>>({});

  const perEpisode = estimateCredits({ scenes: Number(scenes) });
  const sceneOptions = (pro ? [4, 6, 8, 10, 12] : [4, 5, 6]).filter((n) => pro || n <= FREE_MAX_SCENES);

  const outline = async () => {
    if (topic.trim().length < 3) return toast.error("Enter a topic for your series.");
    setPlanning(true); setMade({});
    try { setPlan((await generateSeries({ topic: topic.trim(), parts, tone, style })).plan); }
    catch (e) { toast.error((e as Error).message); }
    finally { setPlanning(false); }
  };

  const editEp = (i: number, field: "title" | "synopsis", value: string) =>
    setPlan((p) => p && { ...p, episodes: p.episodes.map((e, j) => (j === i ? { ...e, [field]: value } : e)) });

  const createEpisode = async (i: number) => {
    if (!plan) return;
    const ep = plan.episodes[i];
    const n = plan.episodes.length;
    const prev = plan.episodes[i - 1];
    const brief = [
      `Part ${i + 1} of ${n} in the series "${plan.title}": ${ep.title}.`,
      ep.synopsis,
      `Open with this hook: ${ep.hook}`,
      prev ? `Briefly reference the previous episode ("${prev.title}").` : "",
      i < n - 1 ? `End by teasing the next episode: "${plan.episodes[i + 1].title}".` : "End by wrapping up the whole series.",
      `Keep visuals consistent across the series: ${plan.visualMotif}`,
    ].filter(Boolean).join(" ");
    setCreating(i);
    try {
      const { videoId } = await generateScript({ topic: brief.slice(0, 1500), style, voice, tone, sceneCount: Number(scenes), captionStyle: "typewriter", aspectRatio: "16:9", targetSeconds: 60 });
      await supabase.from("videos").update({ title: `${plan.title} [Part ${i + 1}/${n}]: ${ep.title}`.slice(0, 200) }).eq("id", videoId);
      setMade((m) => ({ ...m, [i]: videoId }));
      toast.success(`Part ${i + 1} created`);
    } catch (e) { toast.error((e as Error).message); throw e; }
    finally { setCreating(null); }
  };

  const createAll = async () => {
    if (!plan) return;
    for (let i = 0; i < plan.episodes.length; i++) {
      if (made[i]) continue;
      try { await createEpisode(i); } catch { return; }
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container max-w-4xl py-12">
        <div className="flex items-center gap-3"><Layers className="h-8 w-8 text-primary" /><h1 className="text-4xl font-extrabold">Series generator</h1></div>
        <p className="mt-2 text-muted-foreground">Enter a broad topic and Vydora plans a 3 or 5-part series with the same tone, narrator and visual style in every episode.</p>

        <section className="mt-8 space-y-4 rounded-xl border border-border bg-card p-5">
          <div><Label>Series topic</Label><Textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. The Cold War" maxLength={300} className="mt-1" /></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div><Label>Episodes</Label>
              <Select value={String(parts)} onValueChange={(v) => setParts(v === "5" ? 5 : 3)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="3">3-part</SelectItem><SelectItem value="5">5-part</SelectItem></SelectContent></Select></div>
            <div><Label>Visual style</Label>
              <Select value={style} onValueChange={setStyle}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{STYLES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{TONES.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Narrator</Label>
              <Select value={voice} onValueChange={setVoice}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{VOICES.map((v) => <SelectItem key={v.id} value={v.id} disabled={!voiceAllowed(v.id, pro)}>{v.label}{!voiceAllowed(v.id, pro) ? " (Pro)" : ""}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Scenes / episode</Label>
              <Select value={scenes} onValueChange={setScenes}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{sceneOptions.map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Planning the outline is free. Each episode costs about <b className="text-foreground">{perEpisode} credits</b> (≈{perEpisode * parts} for the full series).</p>
            <Button onClick={outline} disabled={planning}>{planning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}Plan series</Button>
          </div>
        </section>

        {plan && (
          <section className="mt-8">
            <h2 className="text-2xl font-extrabold">{plan.title}</h2>
            <p className="mt-1 text-muted-foreground">{plan.logline}</p>
            <p className="mt-2 text-sm"><span className="font-semibold text-accent">Visual thread:</span> {plan.visualMotif}</p>
            <div className="mt-6 space-y-4">
              {plan.episodes.map((ep, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Part {i + 1} of {plan.episodes.length}</p>
                  <Input value={ep.title} onChange={(e) => editEp(i, "title", e.target.value)} className="mt-2 font-semibold" />
                  <p className="mt-2 text-sm italic text-muted-foreground">{ep.hook}</p>
                  <Textarea value={ep.synopsis} onChange={(e) => editEp(i, "synopsis", e.target.value)} className="mt-2" rows={3} />
                  <div className="mt-3 flex justify-end">
                    {made[i] ? (
                      <Button variant="outline" asChild><Link to={`/video/${made[i]}`}><ExternalLink className="h-4 w-4" />Open in editor</Link></Button>
                    ) : (
                      <Button variant="secondary" onClick={() => createEpisode(i).catch(() => {})} disabled={creating !== null}>
                        {creating === i && <Loader2 className="h-4 w-4 animate-spin" />}Create this episode
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={createAll} disabled={creating !== null || Object.keys(made).length === plan.episodes.length}>
                {creating !== null && <Loader2 className="h-4 w-4 animate-spin" />}Create all episodes
              </Button>
            </div>
          </section>
        )}

        <section className="mt-6 rounded-xl border border-border bg-card p-6 text-sm">
          <h2 className="font-display text-lg font-bold">Troubleshooting</h2>
          <ul className="mt-3 grid list-disc gap-2 pl-5 text-muted-foreground">
            <li>Planning the outline costs nothing. Credits are only used when you press "Create this episode" or "Create all episodes".</li>
            <li>If "Plan series" doesn't return an outline, try a shorter or broader topic — "The Cold War" works better than a single narrow event.</li>
            <li>Check the estimate above the button first. "Create all episodes" spends credits for every episode, so create one episode at a time if you're running low.</li>
            <li>Fix episode titles and summaries before creating them. Once created, each episode is a normal video you edit in its own editor.</li>
            <li>If creating stops halfway, the episodes already made are saved in My videos — press "Create this episode" on the rest.</li>
            <li>Narrators marked (Pro) and longer series need a plan. <Link to="/billing" className="text-primary underline">Subscribe to a plan</Link> to unlock them.</li>
            <li>Still stuck? Email <a href="mailto:contact@vydora.ai" className="text-primary underline">contact@vydora.ai</a> with the topic you used.</li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
