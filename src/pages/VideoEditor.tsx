import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { generateSceneAsset, generateThumbnail, signedUrls, type Scene } from "@/lib/videoApi";
import { exportVideo } from "@/lib/exportVideo";
import { typedLine, typedPair, typedWords, wrapByChars, type CaptionStyle } from "@/lib/typewriter";
import { formatSeconds, sceneSeconds } from "@/lib/durations";
import { CAPTION_COLORS, CAPTION_FONTS, CAPTION_SIZES, CAPTION_STYLES, fontCss, safeColor, sizePx } from "@/lib/captionLook";
import { captionWrapPx, previewMaxPx, ratioOf } from "@/lib/aspectRatio";
import RatioSelect from "@/components/RatioSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function LookSelect<T extends string>({ label, value, options, onChange, swatch }: {
  label: string; value: string; options: readonly { value: T; label: string; css?: string }[]; onChange: (v: T) => void; swatch?: boolean;
}) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
      {label}
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              <span className="flex items-center gap-2">
                {swatch && <span className="h-3 w-3 rounded-full border border-border" style={{ background: o.value }} />}
                <span style={o.css ? { fontFamily: o.css, fontSize: "15px" } : undefined}>{o.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

export default function VideoEditor() {
  const { id } = useParams<{ id: string }>();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [working, setWorking] = useState<Record<string, boolean>>({});
  const [playing, setPlaying] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [exportPct, setExportPct] = useState<number | null>(null);
  const [thumbBusy, setThumbBusy] = useState(false);
  // Measured length of each voiceover clip, keyed by scene id.
  const [audioSecs, setAudioSecs] = useState<Record<string, number>>({});
  const audioRef = useRef<HTMLAudioElement>(null);
  const autoStarted = useRef(false);

  const { data, isLoading } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const [{ data: video, error: e1 }, { data: scenes, error: e2 }] = await Promise.all([
        supabase.from("videos").select("*").eq("id", id!).maybeSingle(),
        supabase.from("video_scenes").select("*").eq("video_id", id!).order("position"),
      ]);
      if (e1 || e2) throw e1 ?? e2;
      const paths = [
        ...(scenes ?? []).flatMap((s) => [s.image_path, s.audio_path]),
        video?.thumbnail_path,
      ].filter(Boolean) as string[];
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
        ((data.video?.caption_style ?? "typewriter") as CaptionStyle),
        { font: data.video?.caption_font, color: data.video?.caption_color, size: data.video?.caption_size },
        data.video?.aspect_ratio ?? "16:9",
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

  const makeThumbnail = async () => {
    setThumbBusy(true);
    try {
      await generateThumbnail(id!);
      await qc.invalidateQueries({ queryKey: ["video", id] });
      toast.success("Thumbnail ready!");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setThumbBusy(false);
    }
  };

  const downloadThumbnail = async () => {
    const url = data?.video?.thumbnail_path ? data.urls[data.video.thumbnail_path] : null;
    if (!url) return;
    try {
      const blob = await (await fetch(url)).blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${(data?.video?.title ?? "thumbnail").replace(/[^\w\s-]/g, "").trim() || "thumbnail"}-thumbnail.png`;
      a.click();
    } catch {
      toast.error("Couldn't download the thumbnail.");
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
  const captionStyle = (video.caption_style ?? "typewriter") as CaptionStyle;
  const ratio = ratioOf(video.aspect_ratio);
  const capPx = sizePx(video.caption_size);
  // Same canvas px as the export, so lines break alike.
  const capChars = Math.max(8, Math.floor(captionWrapPx(ratio.value) / (capPx * 0.6)));
  const saveLook = async (patch: Partial<Pick<typeof video, "caption_style" | "caption_font" | "caption_color" | "caption_size" | "aspect_ratio">>) => {
    qc.setQueryData(["video", id], { ...data, video: { ...video, ...patch } });
    const { error } = await supabase.from("videos").update(patch).eq("id", id!);
    if (error) { toast.error("Couldn't save caption settings"); refresh(); }
  };
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
        <div className="mt-3 max-w-3xl">
          <h1 className="text-3xl font-extrabold md:text-4xl">{video.title}</h1>
          <p className="mt-2 text-muted-foreground">{video.description}</p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div
              className="relative mx-auto w-full overflow-hidden rounded-xl border border-border bg-muted [container-type:inline-size]"
              style={{ aspectRatio: ratio.css, maxWidth: previewMaxPx(ratio.value) }}
            >
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
              {playing !== null && current && captionStyle !== "none" && (
                <p
                  className="absolute inset-x-[7.5%] bottom-[5%] max-h-[70%] overflow-hidden whitespace-pre-line text-center font-bold leading-[1.2] drop-shadow-[0_2px_4px_hsl(var(--background))]"
                  style={{ fontFamily: fontCss(video.caption_font), color: safeColor(video.caption_color), fontSize: `${(capPx / ratio.w) * 100}cqw` }}
                >
                  {captionStyle === "full"
                    ? wrapByChars(current.narration, capChars).join("\n")
                    : captionStyle === "pop"
                      ? typedWords(wrapByChars(current.narration, capChars), progress).join("\n")
                      : captionStyle === "sentence"
                        ? typedPair(wrapByChars(current.narration, capChars), progress).join("\n")
                        : typedLine(wrapByChars(current.narration, capChars), progress)}
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
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-border p-3 sm:grid-cols-3">
              <LookSelect label="Caption" value={captionStyle} options={CAPTION_STYLES} onChange={(v) => saveLook({ caption_style: v })} />
              <LookSelect label="Font" value={video.caption_font} options={CAPTION_FONTS} onChange={(v) => saveLook({ caption_font: v })} />
              <LookSelect label="Colour" value={safeColor(video.caption_color)} options={CAPTION_COLORS} onChange={(v) => saveLook({ caption_color: v })} swatch />
              <LookSelect label="Size" value={video.caption_size} options={CAPTION_SIZES} onChange={(v) => saveLook({ caption_size: v })} />
              <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
                Format
                <RatioSelect value={ratio.value} onChange={(v) => saveLook({ aspect_ratio: v })} triggerClassName="h-9" />
              </label>
            </div>
            <div className="mt-4 rounded-xl border border-border p-3">
              <p className="text-xs font-semibold text-muted-foreground">Thumbnail</p>
              {video.thumbnail_path && urls[video.thumbnail_path] ? (
                <img src={urls[video.thumbnail_path]} alt="Video thumbnail" className="mt-2 w-full rounded-lg border border-border" />
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No thumbnail yet — AI can make one from your title.</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={makeThumbnail} disabled={thumbBusy}>
                  {thumbBusy ? "Creating…" : video.thumbnail_path ? "Regenerate thumbnail" : "Generate thumbnail"}
                </Button>
                {video.thumbnail_path && urls[video.thumbnail_path] && (
                  <Button size="sm" variant="secondary" onClick={downloadThumbnail}>Download thumbnail</Button>
                )}
              </div>
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
        <div className="mt-10 flex justify-end border-t border-border pt-6">
          <Button variant="ghost" className="text-destructive" onClick={remove}>Delete video</Button>
        </div>
      </main>
    </div>
  );
}
