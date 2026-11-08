import { useEffect, useRef, type RefObject } from "react";
const reelImgs = Object.values(import.meta.glob("@/assets/reel-*.jpg", { eager: true, import: "default" })) as string[];

type Pt = { x: number; y: number };

/** "VYDORA" drawn from glowing dots, then the dots re-form into the slogan in new colours. */
export default function HeroDotLogo({ active, target }: { active: boolean; target: RefObject<HTMLElement> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const css = getComputedStyle(document.documentElement);
    const p = css.getPropertyValue("--primary").trim();
    const ac = css.getPropertyValue("--accent").trim();
    const fg = css.getPropertyValue("--foreground").trim();
    const bg = css.getPropertyValue("--background").trim();
      const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const c = canvas.getBoundingClientRect();
    const r = target.current?.getBoundingClientRect();
    const cy = r ? r.top - c.top + r.height / 2 : H * 0.4;
    const bh = r ? r.height : H * 0.3;

    const sample = (text: string, maxH: number, gapDiv: number, yRatio = 1) => {
      const off = document.createElement("canvas");
      off.width = W; off.height = H;
      const o = off.getContext("2d")!;
      o.font = `800 100px "Bricolage Grotesque", sans-serif`;
      const size = Math.min((W * 0.9 / o.measureText(text).width) * 100, maxH);
      o.font = `800 ${size}px "Bricolage Grotesque", sans-serif`;
      o.textAlign = "center"; o.textBaseline = "middle";
      o.fillText(text, W / 2, cy);
      const data = o.getImageData(0, 0, W, H).data;
      const gap = Math.max(2, Math.round(size / gapDiv));
      const out: Pt[] = [];
      for (let y = 0; y < H; y += Math.max(2, Math.round(gap * yRatio))) for (let x = 0; x < W; x += gap)
        if (data[(y * W + x) * 4 + 3] > 128) out.push({ x, y });
      return { pts: out, gap };
    };
    const A = sample("VYDORA", bh * 1.05, 55);
    const B = sample("Idea to upload in minutes.", bh * 0.6, 14, 0.6);
    // bounding box of the slogan, used to lay a darker plate behind the tiles
    const bb = B.pts.reduce((m, q) => ({
      x0: Math.min(m.x0, q.x), x1: Math.max(m.x1, q.x),
      y0: Math.min(m.y0, q.y), y1: Math.max(m.y1, q.y),
    }), { x0: W, x1: 0, y0: H, y1: 0 });
    const bk = bg.split(/\s+/);
    const inkCol = `${bk[0]} ${bk[1]} ${Math.round(parseFloat(bk[2]) * 0.3)}`;
    const N = Math.max(A.pts.length, B.pts.length);
    const dots = Array.from({ length: N }, (_, i) => ({
      a: A.pts[i % A.pts.length], b: B.pts[i % B.pts.length],
      inA: i < A.pts.length, inB: i < B.pts.length,
      sx: Math.random() * W, sy: Math.random() * H, s: Math.random(),
    }));
    const imgs = reelImgs.map((src) => { const im = new Image(); im.src = src; return im; });
    // Pre-darken each thumbnail once so the slogan reads as deep ink and the
    // per-frame cost stays a plain blit (no canvas filter in the draw loop).
    const darks: (HTMLCanvasElement | null)[] = imgs.map(() => null);
    const buildDark = (im: HTMLImageElement) => {
      const oc = document.createElement("canvas");
      oc.width = 96; oc.height = 60;
      const o = oc.getContext("2d")!;
      o.filter = "brightness(0.62) saturate(0.85) contrast(1.1)";
      o.drawImage(im, 0, 0, oc.width, oc.height);
      o.filter = "none";
      o.fillStyle = `hsl(${bg} / 0.18)`;
      o.fillRect(0, 0, oc.width, oc.height);
      return oc;
    };
    const tileW = B.gap * 0.92, tileH = B.gap * 0.6 * 0.88;
    const ease = (k: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);
    const SWITCH = 4.5, MORPH = 1.8;
    const start = performance.now();
    let raf = 0;
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const e1 = ease(t / 2.2), e2 = ease((t - SWITCH) / MORPH);
      const gap = A.gap + (B.gap - A.gap) * e2;
      ctx.clearRect(0, 0, W, H);
      if (e2 > 0.02) {
        // deepen the band behind the slogan so the dark tiles read as text
        const pad = 46;
        const g = ctx.createLinearGradient(0, bb.y0 - pad, 0, bb.y1 + pad);
        g.addColorStop(0, `hsl(${inkCol} / 0)`);
        g.addColorStop(0.3, `hsl(${inkCol} / ${0.92 * e2})`);
        g.addColorStop(0.7, `hsl(${inkCol} / ${0.92 * e2})`);
        g.addColorStop(1, `hsl(${inkCol} / 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, bb.y0 - pad, W, bb.y1 - bb.y0 + pad * 2);
      }
      for (const d of dots) {
        const ax = d.sx + (d.a.x - d.sx) * e1, ay = d.sy + (d.a.y - d.sy) * e1;
        const x = ax + (d.b.x - ax) * e2, y = ay + (d.b.y - ay) * e2;
        let alphaMul = 1;
        if (!d.inA) alphaMul = e2; else if (!d.inB) alphaMul = 1 - e2;
        if (alphaMul <= 0.01) continue;
        const wave = (Math.sin(x / 60 - t * 2.5) + 1) / 2;
        const tw = Math.sin(t * 4 + d.s * 60) > 0.97;
        if (e2 > 0 && d.inB) {
          const idx = Math.floor(d.s * imgs.length);
          const im = imgs[idx];
          if (im.complete && im.naturalWidth) {
            if (!darks[idx]) darks[idx] = buildDark(im);
            const sc = 0.3 + 0.7 * e2;
            const tw2 = tileW * sc, th2 = tileH * sc;
            ctx.globalAlpha = e2 * (0.8 + wave * 0.2);
            ctx.drawImage(darks[idx]!, x - tw2 / 2, y - th2 / 2, tw2, th2);
            // thin rim on every tile keeps the letterforms crisp at low brightness
            ctx.globalAlpha = e2 * 0.5;
            ctx.strokeStyle = `hsl(${fg})`;
            ctx.lineWidth = 0.8;
            ctx.strokeRect(x - tw2 / 2, y - th2 / 2, tw2, th2);
            ctx.globalAlpha = 1;
          }
          if (tw && e2 > 0.9) { ctx.strokeStyle = `hsl(${p} / 0.4)`; ctx.lineWidth = 1; ctx.strokeRect(x - tileW / 2, y - tileH / 2, tileW, tileH); }
          if (e2 >= 1) continue;
          alphaMul *= 1 - e2;
        }
        const col = tw ? ac : wave > 0.6 ? p : fg;
        ctx.fillStyle = `hsl(${col} / ${(tw ? 0.95 : 0.25 + wave * 0.5) * alphaMul})`;
        ctx.beginPath(); ctx.arc(x, y, tw ? gap * 0.45 : gap * 0.34, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}
