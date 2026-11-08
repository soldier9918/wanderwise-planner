import { useEffect, useRef } from "react";

/** "VYDORA" drawn from thousands of tiny glowing dots that drift into place and shimmer. */
export default function HeroDotLogo({ active }: { active: boolean }) {
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
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // sample text
    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const o = off.getContext("2d")!;
    const size = Math.min(W / 7.5, H * 0.32);
    o.font = `800 ${size}px "Bricolage Grotesque", sans-serif`;
    o.textAlign = "center"; o.textBaseline = "middle";
    o.fillText("VYDORA", W * (W > 900 ? 0.74 : 0.5), H * (W > 900 ? 0.68 : 0.85));
    const data = o.getImageData(0, 0, W, H).data;
    const gap = Math.max(3, Math.round(size / 55));
    const pts: { x: number; y: number; sx: number; sy: number; s: number }[] = [];
    for (let y = 0; y < H; y += gap) for (let x = 0; x < W; x += gap)
      if (data[(y * W + x) * 4 + 3] > 128) pts.push({ x, y, sx: Math.random() * W, sy: Math.random() * H, s: Math.random() });
    const start = performance.now();
    let raf = 0;
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const k = Math.min(1, t / 2.2), e = 1 - Math.pow(1 - k, 3);
      ctx.clearRect(0, 0, W, H);
      for (const d of pts) {
        const x = d.sx + (d.x - d.sx) * e, y = d.sy + (d.y - d.sy) * e;
        const wave = (Math.sin(d.x / 60 - t * 2.5) + 1) / 2;
        const tw = Math.sin(t * 4 + d.s * 60) > 0.97;
        const col = tw ? ac : wave > 0.6 ? p : fg;
        ctx.fillStyle = `hsl(${col} / ${tw ? 0.95 : 0.2 + wave * 0.45})`;
        ctx.beginPath(); ctx.arc(x, y, tw ? gap * 0.45 : gap * 0.32, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}
