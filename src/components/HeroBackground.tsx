import { useEffect, useRef } from "react";

/** Animated AI-style dot grid: dots ripple, glow and shift colour across the hero. */
export default function HeroBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const css = getComputedStyle(document.documentElement);
    const tok = (n: string) => css.getPropertyValue(n).trim().split(/\s+/);
    const [ph, ps, pl] = tok("--primary");
    const [ah, as, al] = tok("--accent");
    const [fh, fs, fl] = tok("--foreground");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, W = 0, H = 0;
    const gap = window.innerWidth < 768 ? 8 : 10;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = (now: number) => {
      const t = now / 1000;
      ctx.clearRect(0, 0, W, H);
      const cx = W * (0.5 + 0.3 * Math.sin(t * 0.25)), cy = H * (0.4 + 0.2 * Math.cos(t * 0.3));
      for (let x = gap / 2; x < W; x += gap) for (let y = gap / 2; y < H; y += gap) {
        const d = Math.hypot(x - cx, y - cy);
        const wave = (Math.sin(d / 40 - t * 2.2) + 1) / 2;
        const fall = Math.max(0, 1 - d / (Math.max(W, H) * 0.7));
        const v = wave * fall;
        const seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const spark = (seed - Math.floor(seed));
        const twinkle = Math.sin(t * 3 + spark * 50) > 0.985;
        let col: string, a: number, r: number;
        if (twinkle) { col = `${ah} ${as} ${al}`; a = 0.9; r = 1.3; }
        else if (v > 0.55) { col = `${ph} ${ps} ${pl}`; a = 0.2 + v * 0.6; r = 0.7 + v * 0.6; }
        else { col = `${fh} ${fs} ${fl}`; a = 0.07 + v * 0.14; r = 0.6; }
        ctx.fillStyle = `hsl(${col.split(" ").join(" ")} / ${a})`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      // scanning line
      const sy = ((t * 80) % (H + 200)) - 100;
      const g = ctx.createLinearGradient(0, sy - 60, 0, sy);
      g.addColorStop(0, `hsl(${ph} ${ps} ${pl} / 0)`);
      g.addColorStop(1, `hsl(${ph} ${ps} ${pl} / 0.08)`);
      ctx.fillStyle = g; ctx.fillRect(0, sy - 60, W, 60);
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}
