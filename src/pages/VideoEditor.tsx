import { TRANSITION_SECS, TRANSITION_TYPES, layerCss, transitionAt } from "@/lib/transition";
import { MOTION_TYPES, motionAt, motionCss, type Fx } from "@/lib/motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { generateSceneAsset, generateThumbnail, signedUrls, VOICES, TONES, editScenes, rewriteScene, animateScene, generateSeo, type Scene, type Seo } from "@/lib/videoApi";
import { Input } from "@/components/ui/input";
import { exportVideo } from "@/lib/exportVideo";
import { typedLine, typedPair, typedWords, wrapByChars, type CaptionStyle } from "@/lib/typewriter";
import { elapsedSeconds, locateTime, formatSeconds, sceneSeconds, clipRate } from "@/lib/durations";
import { planSceneChange, sceneCountOptions } from "@/lib/sceneCount";
import { CAPTION_COLORS, CAPTION_FONTS, CAPTION_SIZES, CAPTION_STYLES, fontCss, safeColor, sizePx } from "@/lib/captionLook";
import { captionWrapPx, previewMaxPx, ratioOf } from "@/lib/aspectRatio";
import { QUALITIES, qualityOf } from "@/lib/quality";
import RatioSelect from "@/components/RatioSelect";
import { Switch } from "@/components/ui/switch";
import { SFX_TYPES, playSfx, sfxFor } from "@/lib/sfx";
import { MUSIC_MOODS, DUCK_RATIO, shouldPlayMusic, startMusic, rampTo, type MusicPlayer } from "@/lib/music";
import { estimateCredits, costBreakdown, CREDIT_COSTS } from "@/lib/credits";
import StockFootagePicker from "@/components/StockFootagePicker";
import { ACCENTS, LOGO_POSITIONS, NARRATION_SPEEDS, speedOf } from "@/lib/voiceStyle";
import { remixToShorts } from "@/lib/shorts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function LookSelect<T extends string>({ label, value, options, onChange, swatch, disabled }: {
  label: string; value: string; options: readonly { value: T; label: string; css?: string }[]; onChange: (v: T) => void; swatch?: boolean; disabled?: boolean;
}) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
      {label}
      <Select value={value} onValueChange={(v) => onChange(v as T)} disabled={disabled}>
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
  const [sceneBusy, setSceneBusy] = useState(false);
  // Measured length of each voiceover clip, keyed by scene id.
  const [audioSecs, setAudioSecs] = useState<Record<string, number>>({});
  const audioRef = useRef<HTMLAudioElement>(null);
  const seekRef = useRef(0);
  const [full, setFull] = useState(false);
  const toggleFull = () => {
    if (full) { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); setFull(false); }
    else { document.documentElement.requestFullscreen?.().catch(() => {}); setFull(true); }
  };
  useEffect(() => {
    const onChange = () => { if (!document.fullscreenElement) setFull(false); };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const [dragSecs, setDragSecs] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [clipPct, setClipPct] = useState<Record<string, number>>({});
  useEffect(() => { if (playing === null) setPaused(false); }, [playing]);
  const togglePause = () => {
    const a = audioRef.current;
    if (!a) return;
    if (paused) { a.play().catch(() => {}); setPaused(false); }
    else { a.pause(); setPaused(true); }
  };
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
        ...(scenes ?? []).flatMap((s) => [s.image_path, s.audio_path, s.clip_path]),
        video?.thumbnail_path,
        video?.music_path,
        video?.logo_path,
      ].filter(Boolean) as string[];
      const urls = await signedUrls(paths);
      return { video, scenes: (scenes ?? []) as Scene[], urls };
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["video", id] });

  // Background music for the preview.
  const musicCtx = useRef<AudioContext | null>(null);
  const musicPlayer = useRef<MusicPlayer | null>(null);
  const [listening, setListening] = useState(false);
  const [musicBusy, setMusicBusy] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const stopMusic = () => { musicPlayer.current?.stop(); musicPlayer.current = null; };
  const startPreviewMusic = async (mood: string, volume: number) => {
    stopMusic();
    if (mood === "none") return;
    const ctx = musicCtx.current ?? (musicCtx.current = new AudioContext());
    if (ctx.state === "suspended") await ctx.resume().catch(() => {});
    let buf: AudioBuffer | null = null;
    const mp = data?.video?.music_path;
    if (mood === "custom") {
      if (!mp || !data?.urls[mp]) return;
      buf = await ctx.decodeAudioData(await (await fetch(data.urls[mp])).arrayBuffer()).catch(() => null);
    }
    const p = startMusic(ctx, ctx.destination, mood, buf);
    if (p) { musicPlayer.current = p; rampTo(ctx, p, volume / 100); }
  };
  const isPlaying = playing !== null;
  useEffect(() => {
    if (!isPlaying || !data?.video || !shouldPlayMusic(data.video.music_mood, data.video.music_enabled)) { if (!listening) stopMusic(); return; }
    setListening(false);
    startPreviewMusic(data.video.music_mood, data.video.music_volume);
    return () => stopMusic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, data?.video?.music_mood, data?.video?.music_enabled, data?.video?.music_path]);
  useEffect(() => {
    const ctx = musicCtx.current;
    if (!ctx) return;
    if (paused) ctx.suspend().catch(() => {}); else ctx.resume().catch(() => {});
  }, [paused]);
  // Auto-ducking: quieter while the narrator's voice is playing.
  useEffect(() => {
    const a = audioRef.current;
    const v = data?.video;
    if (!a || !v) return;
    const apply = () => {
      const ctx = musicCtx.current, p = musicPlayer.current;
      if (!ctx || !p) return;
      const base = v.music_volume / 100;
      rampTo(ctx, p, v.music_ducking && !a.paused && !a.ended ? base * DUCK_RATIO : base);
    };
    apply();
    a.addEventListener("play", apply); a.addEventListener("pause", apply); a.addEventListener("ended", apply);
    return () => { a.removeEventListener("play", apply); a.removeEventListener("pause", apply); a.removeEventListener("ended", apply); };
  }, [data?.video, playing]);
  // Transition sound effects when the preview moves to the next scene.
  const prevScene = useRef<number | null>(null);
  const sfxCtx = useRef<AudioContext | null>(null);
  const previewSfx = async (type: string, volume: number, index = 0) => {
    const ctx = sfxCtx.current ?? (sfxCtx.current = new AudioContext());
    if (ctx.state === "suspended") await ctx.resume().catch(() => {});
    playSfx(ctx, ctx.destination, sfxFor(type, index), ctx.currentTime, volume);
  };
  useEffect(() => {
    const v = data?.video, prev = prevScene.current;
    prevScene.current = playing;
    if (v?.sfx_enabled && playing !== null && prev !== null && playing === prev + 1) previewSfx(v.sfx_type, v.sfx_volume, playing - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);
  useEffect(() => () => { sfxCtx.current?.close().catch(() => {}); }, []);
  useEffect(() => () => { stopMusic(); musicCtx.current?.close().catch(() => {}); }, []);

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

  const uploadImage = useCallback(async (scene: Scene, f: File) => {
    if (!f.type.startsWith("image/")) return toast.error("Please pick a photo or screenshot.");
    if (f.size > 15 * 1024 * 1024) return toast.error("Please pick an image under 15 MB.");
    const key = `${scene.id}-image`;
    setWorking((w) => ({ ...w, [key]: true }));
    try {
      const { data: u } = await supabase.auth.getUser();
      const ext = (f.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const path = `${u.user!.id}/${scene.video_id}/${scene.id}-upload-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("video-assets").upload(path, f, { contentType: f.type });
      if (error) throw error;
      const { error: e2 } = await supabase.from("video_scenes").update({ image_path: path, clip_path: null }).eq("id", scene.id);
      if (e2) throw e2;
      await qc.invalidateQueries({ queryKey: ["video", id] });
      toast.success(`Scene ${scene.position + 1} now uses your image.`);
    } catch (e) {
      toast.error(`Upload failed: ${(e as Error).message}`);
    } finally {
      setWorking((w) => ({ ...w, [key]: false }));
    }
  }, [id, qc]);

  const pollClip = useCallback(async (scene: Scene) => {
    const key = `${scene.id}-clip`;
    setWorking((w) => ({ ...w, [key]: true }));
    try {
      const t0 = Date.now();
      // Estimate from elapsed time (~2 min typical); use the real figure when the AI service reports one.
      const tick = setInterval(() => setClipPct((p) => ({ ...p, [scene.id]: Math.max(p[scene.id] ?? 0, Math.min(95, ((Date.now() - t0) / 120000) * 95)) })), 1000);
      setClipPct((p) => ({ ...p, [scene.id]: 2 }));
      try {
      for (let n = 0; n < 60; n++) {
        await new Promise((r) => setTimeout(r, 8000));
        const r = await animateScene(scene.id, "status");
        if (typeof r.progress === "number" && r.progress > 0) { const real = r.progress <= 1 ? r.progress * 100 : r.progress; setClipPct((p) => ({ ...p, [scene.id]: Math.max(p[scene.id] ?? 0, Math.min(99, real)) })); }
        if (r.status === "completed") { await qc.invalidateQueries({ queryKey: ["video", id] }); toast.success(`Scene ${scene.position + 1} is now animated.`); return; }
        if (r.status === "failed" || r.status === "none") { if (r.error) toast.error(`Scene ${scene.position + 1}: ${r.error}`); await qc.invalidateQueries({ queryKey: ["video", id] }); return; }
      }
      toast.error("Animation is taking too long — reload the page later to check.");
      } finally { clearInterval(tick); setClipPct((p) => { const n = { ...p }; delete n[scene.id]; return n; }); }
    } catch (e) {
      toast.error(`Scene ${scene.position + 1}: ${(e as Error).message}`);
    } finally {
      setWorking((w) => ({ ...w, [key]: false }));
    }
  }, [id, qc]);

  const animate = useCallback(async (scene: Scene) => {
    const key = `${scene.id}-clip`;
    setWorking((w) => ({ ...w, [key]: true }));
    try {
      await animateScene(scene.id, "start", sceneSeconds(scene.audio_path ? audioSecs[scene.id] : null, scene.narration));
      toast.message(`Animating scene ${scene.position + 1} — this takes 1–3 minutes.`);
    } catch (e) {
      toast.error(`Scene ${scene.position + 1}: ${(e as Error).message}`);
      setWorking((w) => ({ ...w, [key]: false }));
      return;
    }
    pollClip(scene);
  }, [pollClip, audioSecs]);

  const removeClip = useCallback(async (scene: Scene) => {
    const { error } = await supabase.from("video_scenes").update({ clip_path: null, clip_credit: null }).eq("id", scene.id);
    if (error) return toast.error("Couldn't switch back to the still image.");
    await qc.invalidateQueries({ queryKey: ["video", id] });
  }, [id, qc]);

  const resumed = useRef(false);
  useEffect(() => {
    if (!data || resumed.current) return;
    resumed.current = true;
    data.scenes.filter((s) => s.clip_job_id).forEach((s) => pollClip(s));
  }, [data, pollClip]);

  const redoScript = useCallback(async (scene: Scene) => {
    const key = `${scene.id}-script`;
    setWorking((w) => ({ ...w, [key]: true }));
    try {
      await rewriteScene(scene.id);
      await qc.invalidateQueries({ queryKey: ["video", id] });
      toast.success(`Scene ${scene.position + 1} rewritten — recording the new voiceover…`);
    } catch (e) {
      toast.error(`Scene ${scene.position + 1}: ${(e as Error).message}`);
      return;
    } finally {
      setWorking((w) => ({ ...w, [key]: false }));
    }
    runAsset(scene, "audio").catch(() => {});
  }, [id, qc, runAsset]);

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
    const startFrac = seekRef.current;
    seekRef.current = 0;
    setProgress(startFrac);
    let raf = 0;
    const started = performance.now() - startFrac * 4000;
    let pending = startFrac > 0 && !!scene.audio_path;
    const tick = () => {
      const a = audioRef.current;
      if (pending && a && a.duration && isFinite(a.duration)) {
        a.currentTime = startFrac * a.duration;
        pending = false;
      } else if (pending) { raf = requestAnimationFrame(tick); return; }
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
      audio.preservesPitch = true;
      audio.playbackRate = speedOf(data.video?.narration_speed);
      audio.onended = next;
      audio.play().catch(() => setPlaying(null));
      return () => { audio.onended = null; cleanupRaf(); };
    }
    const t = setTimeout(next, 4000 * (1 - startFrac));
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
        data.scenes.map((s) => ({ imageUrl: data.urls[s.image_path!], clipUrl: s.clip_path ? data.urls[s.clip_path] : null, audioUrl: s.audio_path ? data.urls[s.audio_path] : null, caption: s.narration })),
        setExportPct,
        ((data.video?.caption_style ?? "typewriter") as CaptionStyle),
        { font: data.video?.caption_font, color: data.video?.caption_color, size: data.video?.caption_size },
        data.video?.aspect_ratio ?? "16:9",
        data.video?.quality ?? "720p",
        {
          mood: data.video?.music_mood ?? "none",
          enabled: data.video?.music_enabled ?? true,
          volume: data.video?.music_volume ?? 30,
          ducking: data.video?.music_ducking ?? true,
          customUrl: data.video?.music_path ? data.urls[data.video.music_path] : null,
        },
        { enabled: data.video?.sfx_enabled ?? false, type: data.video?.sfx_type ?? "whoosh", volume: data.video?.sfx_volume ?? 50 },
        { enabled: data.video?.motion_enabled ?? true, type: data.video?.motion_type ?? "zoom-in" },
        { enabled: data.video?.transition_enabled ?? false, type: data.video?.transition_type ?? "crossfade" },
        {
          speed: speedOf(data.video?.narration_speed),
          logoUrl: data.video?.logo_path ? data.urls[data.video.logo_path] : null,
          logoPosition: data.video?.logo_position,
          logoOpacity: data.video?.logo_opacity,
        },
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

  const [seoBusy, setSeoBusy] = useState(false);
  const makeSeo = async () => {
    setSeoBusy(true);
    try {
      await generateSeo(id!);
      await qc.invalidateQueries({ queryKey: ["video", id] });
      toast.success("SEO pack ready!");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSeoBusy(false);
    }
  };
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast.success("Copied"); } catch { toast.error("Couldn't copy."); }
  };

  const [thumbText, setThumbText] = useState("");
  const [thumbSize, setThumbSize] = useState(3);
  const makeThumbnail = async (opts?: { mode?: "text"; text?: string; textSize?: number }) => {
    setThumbBusy(true);
    try {
      await generateThumbnail(id!, opts);
      await qc.invalidateQueries({ queryKey: ["video", id] });
      toast.success(opts?.text ? "Your text is on the thumbnail!" : opts?.mode ? "New text style ready!" : "Thumbnail ready!");
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

  const changeScenes = async (target: number) => {
    if (!data) return;
    const before = data.scenes;
    const plan = planSceneChange(before.length, target);
    if (plan.add === 0 && plan.remove === 0) return;
    setPlaying(null);
    setSceneBusy(true);
    const ids = new Set(before.map((s) => s.id));
    try {
      const { added, removed } = await editScenes(id!, plan.target);
      await qc.refetchQueries({ queryKey: ["video", id], type: "active" });
      const fresh = (qc.getQueryData(["video", id]) as { scenes?: Scene[] } | undefined)?.scenes ?? [];
      const extra = fresh.filter((s) => !ids.has(s.id));
      if (extra.length) {
        toast.info(`${extra.length} new scene${extra.length > 1 ? "s" : ""} written — painting images and recording voiceovers…`);
        await generateMissing(extra);
        toast.success("New scenes are ready.");
      } else if (added === 0 && removed > 0) {
        toast.success(`Trimmed to ${plan.target} scenes.`);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSceneBusy(false);
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
  const saveLook = async (patch: Partial<Pick<typeof video, "caption_style" | "caption_font" | "caption_color" | "caption_size" | "aspect_ratio" | "quality" | "voice" | "tone" | "music_mood" | "music_enabled" | "music_volume" | "music_ducking" | "music_path" | "sfx_enabled" | "sfx_type" | "sfx_volume" | "motion_enabled" | "motion_type" | "transition_enabled" | "transition_type" | "narration_speed" | "accent" | "logo_path" | "logo_position" | "logo_opacity">>) => {
    qc.setQueryData(["video", id], { ...data, video: { ...video, ...patch } });
    const { error } = await supabase.from("videos").update(patch).eq("id", id!);
    if (error) { toast.error("Couldn't save caption settings"); refresh(); }
  };
  const done = scenes.filter((s) => s.image_path && s.audio_path).length;
  const busyAny = Object.values(working).some(Boolean);
  const current = playing !== null ? scenes[playing] : scenes[0];
  const currentImg = current?.image_path ? urls[current.image_path] : null;
  const currentClip = current?.clip_path ? urls[current.clip_path] : null;
  const speed = speedOf(video.narration_speed);
  const secOf = (s: Scene) => sceneSeconds(s.audio_path && audioSecs[s.id] ? audioSecs[s.id] / speed : null, s.narration);
  const sceneSecs = scenes.map(secOf);
  const totalSecs = sceneSecs.reduce((a, s) => a + s, 0);
  const curMotion = motionAt(video?.motion_type ?? "zoom-in", playing ?? 0, playing !== null ? progress : 0, (video?.motion_enabled ?? true) && playing !== null);
  const motionOn = video?.motion_enabled ?? true;
  const trans = playing !== null && playing > 0 ? transitionAt(video?.transition_type ?? "crossfade", playing, (progress * sceneSecs[playing]) / TRANSITION_SECS, video?.transition_enabled ?? false) : null;
  const fromScene = playing ? scenes[playing - 1] : null;
  const prevImg = fromScene?.image_path ? urls[fromScene.image_path] : null;
  const elapsedSecs = playing !== null ? elapsedSeconds(sceneSecs, playing, progress) : 0;
  const seekTo = (secs: number) => {
    if (!scenes.length) return;
    if (paused) { audioRef.current?.play().catch(() => {}); setPaused(false); }
    const { index, progress: frac } = locateTime(sceneSecs, secs);
    const a = audioRef.current;
    if (index === playing && a && scenes[index].audio_path && isFinite(a.duration)) {
      a.currentTime = frac * a.duration;
      setProgress(frac);
      return;
    }
    seekRef.current = frac;
    if (index === playing) { setPlaying(null); setTimeout(() => setPlaying(index), 0); }
    else setPlaying(index);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <audio ref={audioRef} className="hidden" />
      <main className="container py-8">
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← My videos</Link>
        <div className="mt-3 max-w-3xl">
          <h1 className="text-3xl font-extrabold md:text-4xl">{video.title}</h1>
          <p className="mt-2 text-muted-foreground">{video.description}</p>
          {(() => {
            const est = { scenes: scenes.length, useFacts: Array.isArray(video.sources) && video.sources.length > 0, animated: scenes.filter((s) => s.clip_path && !s.clip_credit).length, thumbnail: !!video.thumbnail_path, seo: !!video.seo, quality: video.quality ?? "720p" };
            return (
              <details className="mt-3 rounded-lg border border-border bg-card p-3 text-sm">
                <summary className="cursor-pointer font-semibold">⚡ This video: about <span className="text-primary">{estimateCredits(est)} credits</span> with its current settings</summary>
                <ul className="mt-2 grid gap-1 text-muted-foreground">
                  {costBreakdown(est).map((l) => <li key={l.label} className="flex justify-between"><span>{l.label}</span><span>{l.credits}</span></li>)}
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">Redos add more. <Link to="/pricing" className="text-primary underline">See all costs</Link></p>
              </details>
            );
          })()}
          {Array.isArray(video.sources) && video.sources.length > 0 && (
            <details className="mt-3 rounded-lg border border-border bg-card p-3 text-sm">
              <summary className="cursor-pointer font-semibold">Sources ({video.sources.length}) — check facts before publishing</summary>
              <ul className="mt-2 grid gap-1">
                {(video.sources as { title?: string; url: string }[]).map((s) => (
                  <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer" className="text-primary underline break-all">{s.title || s.url}</a></li>
                ))}
              </ul>
            </details>
          )}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className={full ? "fixed inset-0 z-50 flex flex-col justify-center bg-background p-3" : ""}>
            <div
              className="relative mx-auto w-full overflow-hidden rounded-xl border border-border bg-muted [container-type:inline-size]"
              style={{ aspectRatio: ratio.css, maxWidth: full ? `min(100%, calc((100dvh - 7rem) * ${ratio.w / ratio.h}))` : previewMaxPx(ratio.value) }}
            >
              {currentImg ? (
                <>
                {trans?.prev && prevImg && (
                  <div className="absolute inset-0" style={layerCss(trans.prev)}>
                    <img src={prevImg} alt="" className="h-full w-full object-cover" style={{ transform: motionCss(motionAt(video?.motion_type ?? "zoom-in", playing! - 1, 1, motionOn)) }} />
                  </div>
                )}
                <div className="absolute inset-0" style={trans ? layerCss(trans.next) : undefined}>
                {currentClip ? (
                  <video
                    key={`${current?.id}-${playing}-clip`}
                    src={currentClip}
                    muted playsInline
                    className="h-full w-full object-cover"
                    ref={(v) => {
                      if (!v) return;
                      // Play the clip once across the whole scene: stretch it to fit, never loop.
                      const sync = () => {
                        if (!isFinite(v.duration) || !v.duration || playing === null) return;
                        const secs = sceneSecs[playing] || v.duration;
                        v.playbackRate = clipRate(v.duration, secs);
                        const want = Math.min(progress, 0.999) * v.duration;
                        if (Math.abs(v.currentTime - want) > 0.35) v.currentTime = want;
                        if (paused) v.pause(); else if (v.paused && !v.ended) v.play().catch(() => {});
                      };
                      if (v.readyState >= 1) sync(); else v.onloadedmetadata = sync;
                    }}
                  />
                ) : (
                <img key={`${current?.id}-${playing}`} src={currentImg} alt={current?.heading} className="h-full w-full object-cover will-change-transform" style={{ transform: motionCss(curMotion) }} />
                )}
                </div>
                {trans?.overlay && <div className="pointer-events-none absolute inset-0" style={{ background: trans.overlay.color, opacity: trans.overlay.a }} />}
                <FxLayer fx={curMotion.fx} />
                {video.logo_path && urls[video.logo_path] && (
                  <img src={urls[video.logo_path]} alt="Channel logo" className={`pointer-events-none absolute max-h-[12%] max-w-[12%] object-contain ${video.logo_position.startsWith("top") ? "top-[3%]" : "bottom-[3%]"} ${video.logo_position.endsWith("left") ? "left-[3%]" : "right-[3%]"}`} style={{ opacity: video.logo_opacity / 100 }} />
                )}
                </>
              ) : (
                <div className="grid h-full place-items-center text-muted-foreground">Scenes will appear here</div>
              )}
              {current && (
                <span className="absolute right-3 top-3 rounded-md bg-background/80 px-2 py-1 text-xs font-semibold tabular-nums text-foreground">
                  {playing !== null ? `${formatSeconds(elapsedSecs)} / ${formatSeconds(totalSecs)}` : formatSeconds(totalSecs)}
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
            {scenes.length > 0 && (
              <div className="mt-3 flex items-center gap-3">
                <span className="w-10 text-xs tabular-nums text-muted-foreground">{formatSeconds(elapsedSecs)}</span>
                <Slider
                  aria-label="Video position"
                  className="flex-1"
                  min={0}
                  max={Math.max(1, totalSecs)}
                  step={0.5}
                  value={[dragSecs ?? elapsedSecs]}
                  onValueChange={([v]) => setDragSecs(v)}
                  onValueCommit={([v]) => { setDragSecs(null); seekTo(v); }}
                />
                <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{formatSeconds(totalSecs)}</span>
                <Button size="sm" variant="outline" aria-label={full ? "Exit full screen" : "Full screen"} onClick={toggleFull}>{full ? "✕" : "⛶"}</Button>
              </div>
            )}
            {full && (
              <div className="mt-3 flex justify-center gap-3">
                {playing === null ? (
                  <Button onClick={() => setPlaying(0)}>▶ Preview</Button>
                ) : (
                  <Button onClick={togglePause}>{paused ? "▶ Resume" : "❚❚ Pause"}</Button>
                )}
                <Button variant="outline" onClick={toggleFull}>Exit full screen</Button>
              </div>
            )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {playing === null ? (
                <Button onClick={() => setPlaying(0)} disabled={!scenes.length}>▶ Preview</Button>
              ) : (
                <>
                  <Button onClick={togglePause}>{paused ? "▶ Resume" : "❚❚ Pause"}</Button>
                  <Button variant="outline" onClick={() => { audioRef.current?.pause(); setPlaying(null); }}>■ Stop</Button>
                </>
              )}
              {ratio.value !== "9:16" && (
                <Button variant="outline" disabled={busyAny} onClick={async () => {
                  const t = toast.loading("Making your Shorts cut…");
                  try { const nid = await remixToShorts(id!); toast.success("Shorts cut ready — your original is untouched.", { id: t }); navigate(`/video/${nid}`); }
                  catch (e) { toast.error((e as Error).message, { id: t }); }
                }}>📱 Remix for Shorts / TikTok</Button>
              )}
              <Button variant="secondary" onClick={download} disabled={exportPct !== null || busyAny}>
                {exportPct !== null ? `Exporting ${Math.round(exportPct * 100)}%` : "Download video"}
              </Button>
              <Button variant="outline" onClick={() => generateMissing(scenes)} disabled={busyAny || done === scenes.length}>
                Generate missing assets
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-3">
              <LookSelect label="Caption" value={captionStyle} options={CAPTION_STYLES} onChange={(v) => saveLook({ caption_style: v })} />
              <LookSelect label="Font" value={video.caption_font} options={CAPTION_FONTS} onChange={(v) => saveLook({ caption_font: v })} />
              <LookSelect label="Colour" value={safeColor(video.caption_color)} options={CAPTION_COLORS} onChange={(v) => saveLook({ caption_color: v })} swatch />
              <LookSelect label="Size" value={video.caption_size} options={CAPTION_SIZES} onChange={(v) => saveLook({ caption_size: v })} />
              <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
                Format
                <RatioSelect value={ratio.value} onChange={(v) => saveLook({ aspect_ratio: v })} triggerClassName="h-9" />
              </label>
              <LookSelect label="Quality" value={qualityOf(video.quality).value} options={QUALITIES} onChange={(v) => saveLook({ quality: v })} />
              <LookSelect
                label="Scenes"
                value={String(scenes.length)}
                disabled={sceneBusy || busyAny}
                options={sceneCountOptions(scenes.length).map((n) => ({ value: String(n), label: `${n} scenes` }))}
                onChange={(v) => changeScenes(Number(v))}
              />
              <LookSelect
                label="Narrator"
                value={video.voice ?? "Kore"}
                options={VOICES.map((v) => ({ value: v.id, label: v.label }))}
                onChange={async (v) => {
                  await saveLook({ voice: v });
                  toast.info("Narrator changed — re-recording every voiceover with the new voice…");
                  for (let i = 0; i < scenes.length; i += 3) {
                    const results = await Promise.allSettled(scenes.slice(i, i + 3).map((s) => runAsset(s, "audio")));
                    if (results.some((r) => r.status === "rejected" && /credits|limit/i.test(String((r as PromiseRejectedResult).reason)))) return;
                  }
                  toast.success("All voiceovers now use the new narrator.");
                }}
              />
              <LookSelect
                label="Tone & emotion"
                value={video.tone ?? "engaging"}
                options={TONES.map((v) => ({ value: v.id, label: v.label }))}
                onChange={async (v) => {
                  await saveLook({ tone: v });
                  toast.info("Tone changed — re-recording every voiceover…");
                  for (let i = 0; i < scenes.length; i += 3) {
                    const results = await Promise.allSettled(scenes.slice(i, i + 3).map((s) => runAsset(s, "audio")));
                    if (results.some((r) => r.status === "rejected" && /credits|limit/i.test(String((r as PromiseRejectedResult).reason)))) return;
                  }
                  toast.success("All voiceovers now use the new tone.");
                }}
              />
            </div>
            <div className="mt-4 grid gap-3 rounded-xl border border-border bg-card p-3">
              <p className="text-sm font-semibold">Narration speed & accent</p>
              <div className="grid gap-1 text-xs font-semibold text-muted-foreground">
                Speed: {speed}×
                <div className="flex gap-2">
                  {NARRATION_SPEEDS.map((n) => (
                    <Button key={n} size="sm" variant={speed === n ? "default" : "outline"} onClick={() => saveLook({ narration_speed: n })}>{n.toFixed(n === 1 ? 1 : 2)}×</Button>
                  ))}
                </div>
                <span className="font-normal">Speeds up the voice without changing its pitch. Free.</span>
              </div>
              <LookSelect
                label="Accent"
                value={video.accent ?? "none"}
                options={ACCENTS}
                onChange={async (v) => {
                  await saveLook({ accent: v });
                  toast.info("Accent changed — re-recording every voiceover…");
                  for (let i = 0; i < scenes.length; i += 3) {
                    const results = await Promise.allSettled(scenes.slice(i, i + 3).map((s) => runAsset(s, "audio")));
                    if (results.some((r) => r.status === "rejected" && /credits|limit/i.test(String((r as PromiseRejectedResult).reason)))) return;
                  }
                  toast.success("All voiceovers now use the new accent.");
                }}
              />
            </div>
            <div className="mt-4 grid gap-3 rounded-xl border border-border bg-card p-3">
              <p className="text-sm font-semibold">Channel logo / watermark</p>
              <p className="-mt-2 text-xs text-muted-foreground">Shows semi-transparent in a corner of the preview and download.</p>
              <div className="flex flex-wrap items-center gap-2">
                {video.logo_path && urls[video.logo_path] && <img src={urls[video.logo_path]} alt="Your logo" className="h-10 w-10 rounded object-contain bg-muted" />}
                <label className="inline-flex cursor-pointer items-center rounded-md border border-input px-3 py-2 text-sm font-medium hover:bg-accent/20">
                  {logoBusy ? "Uploading…" : video.logo_path ? "Change logo" : "Upload logo"}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={logoBusy}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (!f) return;
                      if (!f.type.startsWith("image/")) return toast.error("Please pick an image.");
                      if (f.size > 5 * 1024 * 1024) return toast.error("Please pick a logo under 5 MB.");
                      setLogoBusy(true);
                      try {
                        const { data: u } = await supabase.auth.getUser();
                        const ext = f.type === "image/png" ? "png" : f.type === "image/webp" ? "webp" : "jpg";
                        const path = `${u.user!.id}/${id}/logo-${Date.now()}.${ext}`;
                        const { error } = await supabase.storage.from("video-assets").upload(path, f, { contentType: f.type });
                        if (error) throw error;
                        await supabase.from("videos").update({ logo_path: path }).eq("id", id!);
                        toast.success("Logo added.");
                        refresh();
                      } catch (err) { toast.error(`Upload failed: ${(err as Error).message}`); }
                      finally { setLogoBusy(false); }
                    }} />
                </label>
                {video.logo_path && <Button size="sm" variant="ghost" onClick={() => saveLook({ logo_path: null })}>Remove</Button>}
              </div>
              <LookSelect label="Corner" value={video.logo_position} options={LOGO_POSITIONS} disabled={!video.logo_path} onChange={(v) => saveLook({ logo_position: v })} />
              <div className="grid gap-1 text-xs font-semibold text-muted-foreground">
                Logo opacity: {video.logo_opacity}%
                <Slider value={[video.logo_opacity]} min={10} max={100} step={5} disabled={!video.logo_path}
                  onValueChange={([v]) => qc.setQueryData(["video", id], { ...data, video: { ...video, logo_opacity: v } })}
                  onValueCommit={([v]) => saveLook({ logo_opacity: v })} />
              </div>
            </div>
            <div className="mt-4 grid gap-3 rounded-xl border border-border bg-card p-3">
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="font-semibold">Background music</span>
                  <span className="block text-xs text-muted-foreground">Plays under the narration in preview and download.</span>
                </span>
                <Switch
                  checked={video.music_enabled ?? true}
                  onCheckedChange={(v) => { saveLook({ music_enabled: v }); if (!v) { stopMusic(); setListening(false); } }}
                />
              </label>
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[180px] flex-1">
                  <LookSelect
                    label="Mood"
                    value={video.music_mood}
                    options={MUSIC_MOODS.filter((m) => m.value !== "custom" || video.music_path)}
                    disabled={video.music_enabled === false}
                    onChange={(v) => { saveLook({ music_mood: v }); if (listening) startPreviewMusic(v, video.music_volume); }}
                  />
                </div>
                <Button
                  size="sm" variant="outline" disabled={video.music_enabled === false || video.music_mood === "none" || playing !== null}
                  onClick={() => { if (listening) { stopMusic(); setListening(false); } else { setListening(true); startPreviewMusic(video.music_mood, video.music_volume); } }}
                >{listening ? "■ Stop" : "▶ Listen"}</Button>
                <label className="inline-flex cursor-pointer items-center rounded-md border border-input px-3 py-2 text-sm font-medium hover:bg-accent/20">
                  {musicBusy ? "Uploading…" : "Upload your own"}
                  <input
                    type="file" accept="audio/mpeg,audio/wav,audio/mp3,audio/x-wav,.mp3,.wav" className="hidden" disabled={musicBusy || video.music_enabled === false}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (!f) return;
                      if (f.size > 20 * 1024 * 1024) return toast.error("Please pick a track under 20 MB.");
                      setMusicBusy(true);
                      try {
                        const { data: u } = await supabase.auth.getUser();
                        const ext = f.name.toLowerCase().endsWith(".wav") ? "wav" : "mp3";
                        const path = `${u.user!.id}/${id}/music-${Date.now()}.${ext}`;
                        const { error } = await supabase.storage.from("video-assets").upload(path, f, { contentType: f.type || "audio/mpeg" });
                        if (error) throw error;
                        await supabase.from("videos").update({ music_path: path, music_mood: "custom" }).eq("id", id!);
                        toast.success("Track uploaded — only use music you own or have a licence for.");
                        refresh();
                      } catch (err) { toast.error(`Upload failed: ${(err as Error).message}`); }
                      finally { setMusicBusy(false); }
                    }}
                  />
                </label>
              </div>
              <div className="grid gap-1 text-xs font-semibold text-muted-foreground">
                Music volume: {video.music_volume}%
                <Slider
                  value={[video.music_volume]} min={0} max={100} step={5} disabled={video.music_enabled === false}
                  onValueChange={([v]) => {
                    qc.setQueryData(["video", id], { ...data, video: { ...video, music_volume: v } });
                    const ctx = musicCtx.current, p = musicPlayer.current;
                    if (ctx && p) rampTo(ctx, p, (v / 100) * (video.music_ducking && playing !== null && !audioRef.current?.paused ? DUCK_RATIO : 1));
                  }}
                  onValueCommit={([v]) => saveLook({ music_volume: v })}
                />
              </div>
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="font-semibold">Auto-ducking</span>
                  <span className="block text-xs text-muted-foreground">Lowers the music while the narrator speaks.</span>
                </span>
                <Switch checked={video.music_ducking} disabled={video.music_enabled === false} onCheckedChange={(v) => saveLook({ music_ducking: v })} />
              </label>
            </div>
            <div className="mt-4 grid gap-3 rounded-xl border border-border bg-card p-3">
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="font-semibold">Camera motion (pan & zoom)</span>
                  <span className="block text-xs text-muted-foreground">Gently moves each picture so scenes feel alive.</span>
                </span>
                <Switch checked={video.motion_enabled} onCheckedChange={(v) => saveLook({ motion_enabled: v })} />
              </label>
              <LookSelect
                label="Movement"
                value={video.motion_type}
                options={MOTION_TYPES}
                disabled={!video.motion_enabled}
                onChange={(v) => saveLook({ motion_type: v })}
              />
            </div>
            <div className="mt-4 grid gap-3 rounded-xl border border-border bg-card p-3">
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="font-semibold">Scene transitions</span>
                  <span className="block text-xs text-muted-foreground">Blends one scene into the next instead of a hard cut.</span>
                </span>
                <Switch checked={video.transition_enabled} onCheckedChange={(v) => saveLook({ transition_enabled: v })} />
              </label>
              <LookSelect
                label="Style"
                value={video.transition_type}
                options={TRANSITION_TYPES}
                disabled={!video.transition_enabled}
                onChange={(v) => saveLook({ transition_type: v })}
              />
            </div>
            <div className="mt-4 grid gap-3 rounded-xl border border-border bg-card p-3">
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="font-semibold">Transition sound effects</span>
                  <span className="block text-xs text-muted-foreground">A short sound as each new scene begins.</span>
                </span>
                <Switch checked={video.sfx_enabled} onCheckedChange={(v) => saveLook({ sfx_enabled: v })} />
              </label>
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[180px] flex-1">
                  <LookSelect
                    label="Sound"
                    value={video.sfx_type}
                    options={SFX_TYPES}
                    disabled={!video.sfx_enabled}
                    onChange={(v) => { saveLook({ sfx_type: v }); previewSfx(v, video.sfx_volume); }}
                  />
                </div>
                <Button size="sm" variant="outline" disabled={!video.sfx_enabled} onClick={() => previewSfx(video.sfx_type, video.sfx_volume, Math.floor(Math.random() * 30))}>▶ Listen</Button>
              </div>
              <div className="grid gap-1 text-xs font-semibold text-muted-foreground">
                Effects volume: {video.sfx_volume}%
                <Slider
                  value={[video.sfx_volume]} min={0} max={100} step={5} disabled={!video.sfx_enabled}
                  onValueChange={([v]) => qc.setQueryData(["video", id], { ...data, video: { ...video, sfx_volume: v } })}
                  onValueCommit={([v]) => saveLook({ sfx_volume: v })}
                />
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-border bg-card p-3">
              <p className="text-xs font-semibold text-muted-foreground">Thumbnail</p>
              {video.thumbnail_path && urls[video.thumbnail_path] ? (
                <img src={urls[video.thumbnail_path]} alt="Video thumbnail" className="mt-2 w-full rounded-lg border border-border" />
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No thumbnail yet — AI can make one from your title.</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => makeThumbnail()} disabled={thumbBusy}>
                  {thumbBusy ? "Creating…" : video.thumbnail_path ? "Regenerate thumbnail" : "Generate thumbnail"} · {CREDIT_COSTS.thumbnail} cr
                </Button>
                {video.thumbnail_path && (
                  <Button size="sm" variant="outline" onClick={() => makeThumbnail({ mode: "text", textSize: thumbSize })} disabled={thumbBusy}>Redo text</Button>
                )}
                {video.thumbnail_path && urls[video.thumbnail_path] && (
                  <Button size="sm" variant="secondary" onClick={downloadThumbnail}>Download thumbnail</Button>
                )}
              </div>
              {video.thumbnail_path && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground">Text size: <span className="font-semibold text-foreground">{["Small", "Medium", "Large", "Extra large", "Huge"][thumbSize - 1]}</span></p>
                  <Slider className="mt-2" min={1} max={5} step={1} value={[thumbSize]} onValueChange={(v) => setThumbSize(v[0])} aria-label="Thumbnail text size" />
                  <p className="mt-1 text-[11px] text-muted-foreground">Applies when you tap Redo text or Add text.</p>
                </div>
              )}
              {video.thumbnail_path && (
                <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); const t = thumbText.trim(); if (t) makeThumbnail({ mode: "text", text: t, textSize: thumbSize }); }}>
                  <Input value={thumbText} onChange={(e) => setThumbText(e.target.value)} maxLength={80} placeholder="Your own thumbnail text" className="h-9" />
                  <Button size="sm" type="submit" disabled={thumbBusy || !thumbText.trim()}>Add text</Button>
                </form>
              )}
            </div>
            <div className="mt-4 rounded-xl border border-border bg-card p-3">
              <p className="text-xs font-semibold text-muted-foreground">SEO — titles, description & tags</p>
              {(() => {
                const seo = (video.seo as unknown as Seo | null);
                if (!seo) return <p className="mt-2 text-sm text-muted-foreground">One click drafts 3 click-worthy titles, a search-friendly description, hashtags and tags.</p>;
                return (
                  <div className="mt-2 grid gap-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold">Title ideas</p>
                      <ul className="mt-1 grid gap-1">
                        {seo.titles.map((t) => (
                          <li key={t} className="flex items-start justify-between gap-2 rounded-md bg-secondary/50 p-2">
                            <span>{t} <span className="text-[11px] text-muted-foreground">({t.length})</span></span>
                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => copy(t)}>Copy</Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {([["Description", seo.description], ["Hashtags", seo.hashtags.join(" ")], ["Tags", seo.tags.join(", ")]] as const).map(([label, text]) => (
                      <div key={label}>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold">{label}</p>
                          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => copy(text)}>Copy</Button>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap rounded-md bg-secondary/50 p-2 text-muted-foreground">{text}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <Button size="sm" variant="outline" className="mt-3" onClick={makeSeo} disabled={seoBusy || !scenes.length}>
                {seoBusy ? "Writing…" : (video.seo as unknown as Seo | null) ? "Regenerate SEO" : "Generate SEO"} · {CREDIT_COSTS.seo} cr
              </Button>
            </div>
            {exportPct !== null && (
              <div className="mt-3"><Progress value={exportPct * 100} /><p className="mt-1 text-xs text-muted-foreground">Recording in real time — keep this tab open.</p></div>
            )}
            <p className="mt-3 text-sm text-muted-foreground">{done}/{scenes.length} scenes ready{busyAny ? " · generating…" : ""}{sceneBusy ? " · adjusting scenes…" : ""}{scenes.length ? ` · ${formatSeconds(totalSecs)} total` : ""}</p>
          </div>

          <ol className="grid gap-4">
            {scenes.map((s, i) => (
              <li key={s.id} className={`rounded-xl border bg-card p-4 ${playing === i ? "border-primary" : "border-border"}`}>
                <div className="flex gap-3">
                  <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                    {s.clip_path && urls[s.clip_path] ? <video src={urls[s.clip_path]} autoPlay loop muted playsInline className="h-full w-full object-cover" />
                      : s.image_path ? <img src={urls[s.image_path]} alt="" className="h-full w-full object-cover" />
                      : <div className={`h-full w-full ${working[`${s.id}-image`] ? "animate-pulse bg-secondary" : ""}`} />}
                    <span className="absolute bottom-1 right-1 rounded bg-background/85 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-foreground">{formatSeconds(secOf(s))}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-widest text-accent">Scene {i + 1}</p>
                    <p className="font-semibold">{s.heading}</p>
                  </div>
                </div>
                <Textarea key={s.narration} className="mt-3 text-sm" rows={3} defaultValue={s.narration} onBlur={(e) => saveNarration(s, e.target.value.trim())} />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled={working[`${s.id}-image`]} onClick={() => runAsset(s, "image").catch(() => {})}>
                    {working[`${s.id}-image`] ? "Painting…" : s.image_path ? "New image" : "Make image"}
                  </Button>
                  <Button size="sm" variant="outline" asChild disabled={working[`${s.id}-image`]}>
                    <label className={`cursor-pointer ${working[`${s.id}-image`] ? "pointer-events-none opacity-50" : ""}`}>
                      Upload image
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) uploadImage(s, f); }} />
                    </label>
                  </Button>
                  <Button size="sm" variant="outline" disabled={!s.image_path || working[`${s.id}-clip`] || working[`${s.id}-image`]} onClick={() => animate(s)}>
                    {working[`${s.id}-clip`] ? "Animating… (1–3 min)" : s.clip_path ? "Re-animate" : "✨ Animate scene"} · {CREDIT_COSTS.animate} cr
                  </Button>
<StockFootagePicker
                    sceneId={s.id} sceneNo={i + 1} defaultQuery={s.heading}
                    orientation={ratio.w > ratio.h ? "landscape" : ratio.w < ratio.h ? "portrait" : "square"}
                    disabled={working[`${s.id}-clip`] || working[`${s.id}-image`] || !s.image_path}
                    onDone={refresh}
                  />
                  {s.clip_credit && <p className="basis-full text-xs text-muted-foreground">🎞 {s.clip_credit}</p>}
{working[`${s.id}-clip`] && (
                    <div className="basis-full">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Animating scene {s.position + 1}…</span>
                        <span className="tabular-nums">{Math.round(clipPct[s.id] ?? 0)}%</span>
                      </div>
                      <Progress value={clipPct[s.id] ?? 0} className="h-2" />
                    </div>
                  )}
                                    {s.clip_path && !working[`${s.id}-clip`] && (
                    <Button size="sm" variant="ghost" onClick={() => removeClip(s)}>Use still image</Button>
                  )}
                  <Button size="sm" variant="outline" disabled={working[`${s.id}-script`] || working[`${s.id}-audio`]} onClick={() => redoScript(s)}>
                    {working[`${s.id}-script`] ? "Rewriting…" : "Redo script"}
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

// Horror overlays for the preview (inline colours mirror the export's canvas drawing).
function FxLayer({ fx }: { fx?: Fx }) {
  if (!fx) return null;
  const layer = (c: string, a = 0) => a > 0 && <div className="pointer-events-none absolute inset-0" style={{ background: c, opacity: a }} />;
  return (
    <>
      {layer("#8b0000", fx.red)}
      {layer("#000", fx.dark)}
      {layer("#fff", fx.flash)}
      {fx.streaks?.map((l, i) => <div key={`s${i}`} className="pointer-events-none absolute inset-y-0" style={{ left: `${l.pos * 100}%`, width: `max(1px, ${l.size * 100}%)`, background: "#eee", opacity: l.a }} />)}
      {fx.bands?.map((l, i) => <div key={`b${i}`} className="pointer-events-none absolute inset-x-0" style={{ top: `${l.pos * 100}%`, height: `max(1px, ${l.size * 100}%)`, background: "#ddd", opacity: l.a }} />)}
    </>
  );
}
