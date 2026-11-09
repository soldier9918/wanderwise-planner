import { useEffect, useRef } from "react";
const imgs = Object.values(import.meta.glob("@/assets/reel-*.jpg", { eager: true, import: "default" }) as Record<string, string>);

/** "AI studio" hero: tilted glowing scene frames, light streams and a live voice waveform. */
export default function HeroStudio({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const css = getComputedStyle(document.documentElement);
    const p = css.getPropertyValue("--primary").trim();
    const ac = css.getPropertyValue("--accent").trim();
    const fg = css.getPropertyValue("--foreground").trim();
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    if (W < 1 || H < 1) return;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let mx = 0, my = 0;
    const move = (e: PointerEvent) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; };
    window.addEventListener("pointermove", move);
    const mob = W < 768;
    const frames = Array.from({ length: mob ? 6 : 10 }, (_, i) => ({
      x: Math.random(), y: Math.random() * 0.9 + 0.05, z: 0.4 + Math.random() * 0.8,
      rot: (Math.random() - 0.5) * 0.5, ph: i * 1.7, pic: i, col: i % 3 === 0 ? ac : p,
    }));
    const pics = imgs.map((u) => { const im = new Image(); im.src = u; return im; });
    const start = performance.now();
    let raf = 0;
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const fade = Math.min(1, t / 1.2);
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = fade;
      // floating scene frames
      for (const f of frames) {
        const fw = (mob ? 120 : 200) * f.z, fh = fw * 9 / 16;
        const x = ((f.x * (W + fw) + t * 18 * f.z) % (W + fw)) - fw / 2 + mx * 60 * f.z;
        const y = f.y * H + Math.sin(t * 0.8 + f.ph) * 12 + my * 40 * f.z;
        ctx.save();
        ctx.translate(x, y); ctx.rotate(f.rot + Math.sin(t * 0.4 + f.ph) * 0.04);
        ctx.transform(1, 0.08 * Math.sin(f.ph), -0.12, 1, 0, 0);
        const a = 0.12 + 0.18 * f.z;
        const g = ctx.createLinearGradient(-fw / 2, -fh / 2, fw / 2, fh / 2);
        g.addColorStop(0, `hsl(${f.col} / ${a * 0.5})`); g.addColorStop(1, `hsl(${fg} / 0.02)`);
        ctx.fillStyle = g; ctx.fillRect(-fw / 2, -fh / 2, fw, fh);
        ctx.shadowColor = `hsl(${f.col} / 0.8)`; ctx.shadowBlur = 14;
        ctx.strokeStyle = `hsl(${f.col} / ${a + 0.25})`; ctx.lineWidth = 1.2;
        ctx.strokeRect(-fw / 2, -fh / 2, fw, fh);
        ctx.shadowBlur = 0;
        const im = pics[f.pic % pics.length];
        if (im?.complete && im.naturalWidth) { ctx.globalAlpha = fade * (0.35 + 0.5 * f.z); ctx.drawImage(im, -fw / 2, -fh / 2, fw, fh); ctx.globalAlpha = fade; }
        // play triangle
        ctx.fillStyle = `hsl(${fg} / ${a + 0.2})`;
        const s = fw * 0.07;
        ctx.beginPath(); ctx.moveTo(-s * 0.7, -s); ctx.lineTo(s, 0); ctx.lineTo(-s * 0.7, s); ctx.fill();
        // progress line
        const pr = (t * 0.15 + f.ph) % 1;
        ctx.fillStyle = `hsl(${p} / 0.9)`; ctx.fillRect(-fw / 2, fh / 2 - 3, fw * pr, 2);
        ctx.restore();
      }
      // voice waveform across lower third
      const by = H * 0.86, bars = mob ? 60 : 120, bw = W / bars;
      for (let i = 0; i < bars; i++) {
        const v = Math.abs(Math.sin(i * 0.35 + t * 3) * Math.sin(i * 0.07 - t * 1.3)) * (0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i * 0.9)));
        const h = 4 + v * H * 0.12;
        ctx.fillStyle = `hsl(${v > 0.6 ? ac : p} / ${0.25 + v * 0.55})`;
        ctx.fillRect(i * bw + bw * 0.2, by - h / 2, bw * 0.6, h);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); };
  }, [active]);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}
