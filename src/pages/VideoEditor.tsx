import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { generateSceneAsset, signedUrls, type Scene } from "@/lib/videoApi";
import { exportVideo } from "@/lib/exportVideo";
import { typedLine, wrapByChars } from "@/lib/typewriter";
import { formatSeconds, sceneSeconds } from "@/lib/durations";

export default function VideoEditor() {
  const { id } = useParams<{ id: string }>();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [working, setWorking] = useState<Record<string, boolean>>({});
  const [playing, setPlaying] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [exportPct, setExportPct] = useState<number | null>(null);
  // Measured length of each voiceover clip, keyed by scene id.
  const [audioSecs, setAudioSecs] = useState<Record<string, number>>({});
  const audioRef = useRef<HTMLAudioElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const autoStarted = useRef(false);
  // How many monospace characters fit on one caption line in this box.
  const [captionChars, setCaptionChars] = useState(32);

  useEffect(() => {
    const el = captionRef.current;
    if (!el) return;
    const measure = () => {
      const style = getComputedStyle(el);
      const size = parseFloat(style.fontSize) || 18;
      const pad = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
      const avail = el.clientWidth - pad;
      if (avail > 0) setCaptionChars(Math.max(12, Math.floor(avail / (size * 0.62))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [playing]);

  const { data, isLoading } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const [{ data: video, error: e1 }, { data: scenes, error: e2 }] = await Promise.all([
        supabase.from("videos").select("*").eq("id", id!).maybeSingle(),
        supabase.from("video_scenes").select("*").eq("video_id", id!).order("position"),
      ]);
      if (e1 || e2) throw e1 ?? e2;
      const paths = (scenes ?? []).flatMap((s) => [s.image_path, s.audio_path]).filter(Boolean) as string[];
      const urls = await signedUrls(paths);
      return { video, scenes: (scenes ?? []) as Scene[], urls };
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["video", id] });

  // Measure every voiceover clip so the seconds shown match the exported video.
  useEffect(() => {
    if (!data) return;
    const pending = data.scenes.filter((s) => s.audio_path && data.urls[s.audio_path] && audioSecs[s.id] === undefined);
    if (!pending.length) return;
    let cancelled = false;
    const cleanups = pending.map((s) => {
      const a = new Audio();
      a.preload = "metadata";
      const read = () => {
        // Some clips report Infinity until the browser is forced to look.
        if (a.duration === Infinity) { a.currentTime = 1e10; return; }
        if (!cancelled && isFinite(a.duration) && a.duration > 0) {
          const d = a.duration;
          setAudioSecs((m) => ({ ...m, [s.id]: d }));
        }
      };
      a.addEventListener("loadedmetadata", read);
      a.addEventListener("durationchange", read);
      a.src = data.urls[s.audio_path!];
      return () => {
        a.removeEventListener("loadedmetadata", read);
        a.removeEventListener("durationchange", read);
        a.src = "";
      };
    });
    return () => { cancelled = true; cleanups.forEach((c) => c()); };
  }, [data, audioSecs]);

  const runAsset = useCallback(async (scene: Scene, kind: "image" | "audio") => {
    const key = `${scene.id}-${kind}`;
    setWorking((w) => ({ ...w, [key]: true }));
    try {
      await generateSceneAsset(scene.id, kind);
      await qc.invalidateQueries({ queryKey: ["video", id] });
    } catch (e) {
      toast.error(`Scene ${scene.position + 1}: ${(e as Error).message}`);
      throw e;
    } finally {
      setWorking((w) => ({ ...w, [key]: false }));
    }
  }, [id, qc]);

  const generateMissing = useCallback(async (scenes: Scene[]) => {
    // Small batches to stay within rate limits.
    const jobs = scenes.flatMap((s) => [
      ...(!s.image_path ? [() => runAsset(s, "image")] : []),
      ...(!s.audio_path ? [() => runAsset(s, "audio")] : []),
    ]);
    for (let i = 0; i < jobs.length; i += 3) {
      const results = await Promise.allSettled(jobs.slice(i, i + 3).map((j) => j()));
      if (results.some((r) => r.status === "rejected" && /credits|limit/i.test(String((r as PromiseRejectedResult).reason)))) break;
    }
  }, [runAsset]);

  useEffect(() => {
    if (data && params.get("autogen") && !autoStarted.current) {
      autoStarted.current = true;
      setParams({}, { replace: true });
      generateMissing(data.scenes);
    }
  }, [data, params, setParams, generateMissing]);

  // Sequential preview playback
  useEffect(() => {
    if (playing === null || !data) return;
    const scene = data.scenes[playing];
    const audio = audioRef.current;
    if (!scene || !audio) { setPlaying(null); return; }
    setProgress(0);
    let raf = 0;
    const started = performance.now();
    const tick = () => {
      const a = audioRef.current;
      if (a && a.duration && isFinite(a.duration) && scene.audio_path) setProgress(a.currentTime / a.duration);
      else if (!scene.audio_path) setProgress((performance.now() - started) / 4000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const cleanupRaf = () => cancelAnimationFrame(raf);
    const next = () => setPlaying((p) => (p !== null && p + 1 < data.scenes.length ? p + 1 : null));
    const url = scene.audio_path ? data.urls[scene.audio_path] : null;
    if (url) {
      audio.src = url;
      audio.onended = next;
      audio.play().catch(() => setPlaying(null));
      return () => { audio.onended = null; cleanupRaf(); };
    }
    const t = setTimeout(next, 4000);
    return () => { clearTimeout(t); cleanupRaf(); };
  }, [playing, data]);

  const saveNarration = async (scene: Scene, narration: string) => {
    if (narration === scene.narration) return;
    const { error } = await supabase.from("video_scenes").update({ narration, audio_path: null }).eq("id", scene.id);
    if (error) return toast.error(error.message);
    toast.success("Narration saved — regenerate the voiceover to hear it.");
    refresh();
  };

  const download = async () => {
    if (!data) return;
    const missing = data.scenes.some((s) => !s.image_path);
    if (missing) return toast.error("Every scene needs an image before exporting.");
    setPlaying(null);
    setExportPct(0);
    try {
      const blob = await exportVideo(
        data.scenes.map((s) => ({ imageUrl: data.urls[s.image_path!], audioUrl: s.audio_path ? data.urls[s.audio_path] : null, caption: s.narration })),
        setExportPct,
      );
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${(data.video?.title ?? "video").replace(/[^\w\s-]/g, "").trim() || "video"}.webm`;
      a.click();
      toast.success("Video downloaded");
    } catch (e) {
      toast.error(`Export failed: ${(e as Error).message}`);
    } finally {
      setExportPct(null);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this video?")) return;
    await supabase.from("videos").delete().eq("id", id!);
    navigate("/dashboard");
  };

  if (isLoading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  if (!data?.video) return <div className="grid min-h-screen place-items-center">Video not found. <Link to="/dashboard" className="text-primary">Back</Link></div>;

  const { video, scenes, urls } = data;
  const done = scenes.filter((s) => s.image_path && s.audio_path).length;
  const busyAny = Object.values(working).some(Boolean);
  const current = playing !== null ? scenes[playing] : scenes[0];
  const currentImg = current?.image_path ? urls[current.image_path] : null;
  const secOf = (s: Scene) => sceneSeconds(s.audio_path ? audioSecs[s.id] : null, s.narration);
  const totalSecs = scenes.reduce((a, s) => a + secOf(s), 0);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <audio ref={audioRef} className="hidden" />
      <main className="container py-8">
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← My videos</Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-extrabold md:text-4xl">{video.title}</h1>
            <p className="mt-2 text-muted-foreground">{video.description}</p>
          </div>
          <Button variant="ghost" className="text-destructive" onClick={remove}>Delete</Button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted">
              {currentImg ? (
                <img key={`${current?.id}-${playing}`} src={currentImg} alt={current?.heading} className={`h-full w-full object-cover ${playing !== null ? "animate-kenburns" : ""}`} />
              ) : (
                <div className="grid h-full place-items-center text-muted-foreground">Scenes will appear here</div>
              )}
              {current && (
                <span className="absolute right-3 top-3 rounded-md bg-background/80 px-2 py-1 text-xs font-semibold tabular-nums text-foreground">
                  {playing !== null ? `${(secOf(current) * progress).toFixed(1)} / ${secOf(current)}s` : `${secOf(current)}s`}
                </span>
              )}
              {playing !== null && current && (
                <p ref={captionRef} className="absolute inset-x-6 bottom-6 min-h-[2.5rem] text-center font-mono text-lg font-bold leading-snug drop-shadow-[0_2px_4px_hsl(var(--background))]">
                  {typedLine(wrapByChars(current.narration, captionChars), progress)}
                </p>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {playing === null ? (
                <Button onClick={() => setPlaying(0)} disabled={!scenes.length}>▶ Preview</Button>
              ) : (
                <Button variant="outline" onClick={() => { audioRef.current?.pause(); setPlaying(null); }}>■ Stop</Button>
              )}
              <Button variant="secondary" onClick={download} disabled={exportPct !== null || busyAny}>
                {exportPct !== null ? `Exporting ${Math.round(exportPct * 100)}%` : "Download video"}
              </Button>
              <Button variant="outline" onClick={() => generateMissing(scenes)} disabled={busyAny || done === scenes.length}>
                Generate missing assets
              </Button>
            </div>
            {exportPct !== null && (
              <div className="mt-3"><Progress value={exportPct * 100} /><p className="mt-1 text-xs text-muted-foreground">Recording in real time — keep this tab open.</p></div>
            )}
            <p className="mt-3 text-sm text-muted-foreground">{done}/{scenes.length} scenes ready{busyAny ? " · generating…" : ""}{scenes.length ? ` · ${formatSeconds(totalSecs)} total` : ""}</p>
          </div>

          <ol className="grid gap-4">
            {scenes.map((s, i) => (
              <li key={s.id} className={`rounded-xl border bg-card p-4 ${playing === i ? "border-primary" : "border-border"}`}>
                <div className="flex gap-3">
                  <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                    {s.image_path ? <img src={urls[s.image_path]} alt="" className="h-full w-full object-cover" />
                      : <div className={`h-full w-full ${working[`${s.id}-image`] ? "animate-pulse bg-secondary" : ""}`} />}
                    <span className="absolute bottom-1 right-1 rounded bg-background/85 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-foreground">{formatSeconds(secOf(s))}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-widest text-accent">Scene {i + 1}</p>
                    <p className="font-semibold">{s.heading}</p>
                  </div>
                </div>
                <Textarea className="mt-3 text-sm" rows={3} defaultValue={s.narration} onBlur={(e) => saveNarration(s, e.target.value.trim())} />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled={working[`${s.id}-image`]} onClick={() => runAsset(s, "image").catch(() => {})}>
                    {working[`${s.id}-image`] ? "Painting…" : s.image_path ? "New image" : "Make image"}
                  </Button>
                  <Button size="sm" variant="outline" disabled={working[`${s.id}-audio`]} onClick={() => runAsset(s, "audio").catch(() => {})}>
                    {working[`${s.id}-audio`] ? "Recording…" : s.audio_path ? "Redo voiceover" : "Make voiceover"}
                  </Button>
                  {s.audio_path && <Button size="sm" variant="ghost" onClick={() => setPlaying(i)}>▶ Play</Button>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </main>
    </div>
  );
}
