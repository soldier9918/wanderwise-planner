import fixWebmDuration from "fix-webm-duration";
import { typedLine } from "./typewriter";

export type ExportScene = { imageUrl: string; audioUrl: string | null; caption: string };

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** Renders scenes (image + voiceover + captions) into a downloadable WebM, in real time. */
export async function exportVideo(scenes: ExportScene[], onProgress: (p: number) => void, captions = true): Promise<Blob> {
  const W = 1280, H = 720;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const audioCtx = new AudioContext();
  const dest = audioCtx.createMediaStreamDestination();
  // Phones start audio paused; without this the recording can stall after scene 1.
  if (audioCtx.state === "suspended") await audioCtx.resume().catch(() => {});

  const loaded = await Promise.all(
    scenes.map(async (s) => {
      const img = await loadImage(s.imageUrl);
      let buffer: AudioBuffer | null = null;
      if (s.audioUrl) {
        const arr = await (await fetch(s.audioUrl)).arrayBuffer();
        buffer = await audioCtx.decodeAudioData(arr);
      }
      return { img, buffer, caption: s.caption };
    }),
  );

  const stream = new MediaStream([...canvas.captureStream(30).getVideoTracks(), ...dest.stream.getAudioTracks()]);
  const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
  const recorder = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 5_000_000 } : undefined);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise<Blob>((r) => (recorder.onstop = () => r(new Blob(chunks, { type: "video/webm" }))));

  const durations = loaded.map((l) => (l.buffer ? l.buffer.duration + 0.4 : 4));
  const total = durations.reduce((a, b) => a + b, 0);
  let elapsedBefore = 0;

  recorder.start(250);
  for (let i = 0; i < loaded.length; i++) {
    const { img, buffer, caption } = loaded[i];
    const dur = durations[i];
    if (buffer) {
      const src = audioCtx.createBufferSource();
      src.buffer = buffer;
      src.connect(dest);
      src.start();
    }
    const start = performance.now();
    await new Promise<void>((resolve) => {
      const frame = () => {
        const t = (performance.now() - start) / 1000;
        const k = Math.min(t / dur, 1);
        const scale = 1 + 0.1 * k;
        const ratio = Math.max(W / img.width, H / img.height) * scale;
        const iw = img.width * ratio, ih = img.height * ratio;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);
        ctx.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
        if (captions) {
          ctx.font = "600 34px 'Courier New', monospace";
          // Typewriter: one line at a time, in step with the voiceover.
          const speak = buffer ? buffer.duration : dur;
          const line = typedLine(wrap(ctx, caption, W - 200), t / speak);
          ctx.fillStyle = "#fff";
          ctx.shadowColor = "rgba(0,0,0,0.9)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 2;
          ctx.textAlign = "center";
          ctx.fillText(line, W / 2, H - 60);
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;
        }
        onProgress(Math.min((elapsedBefore + t) / total, 1));
        // Timers keep going even when the browser pauses animations (e.g. screen dims).
        if (t < dur) setTimeout(frame, 1000 / 30); else resolve();
      };
      frame();
    });
    elapsedBefore += dur;
  }
  recorder.stop();
  const raw = await done;
  await audioCtx.close();
  // Browser recordings have no length stored, so many players stop after the first part.
  return await fixWebmDuration(raw, total * 1000, { logger: false });
}
