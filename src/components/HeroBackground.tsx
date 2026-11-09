import { useEffect, useRef } from "react";

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789VYDORA▶";

/** Matrix-style digital rain: columns of glyphs falling down the hero. */
export default function HeroBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const css = getComputedStyle(document.documentElement);
    const ac = css.getPropertyValue("--accent").trim();
    const p = css.getPropertyValue("--primary").trim();
    const fg = css.getPropertyValue("--foreground").trim();
    const bg = css.getPropertyValue("--background").trim();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const size = window.innerWidth < 768 ? 14 : 16;
    let W = 0, H = 0, drops: { y: number; sp: number; red: boolean }[] = [];
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drops = Array.from({ length: Math.ceil(W / size) }, () => ({ y: Math.random() * -H / size, sp: 0.3 + Math.random() * 0.7, red: Math.random() < 0.08 }));
      ctx.fillStyle = `hsl(${bg})`; ctx.fillRect(0, 0, W, H);
    };
    resize();
    window.addEventListener("resize", resize);
    let raf = 0, last = 0;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < 50) return;
      last = now;
      ctx.fillStyle = `hsl(${bg} / 0.12)`; ctx.fillRect(0, 0, W, H);
      ctx.font = `${size}px "JetBrains Mono", monospace`;
      drops.forEach((d, i) => {
        const ch = CHARS[(Math.random() * CHARS.length) | 0];
        const x = i * size, y = d.y * size;
        ctx.fillStyle = `hsl(${fg} / 0.95)`; ctx.fillText(ch, x, y);
        ctx.fillStyle = `hsl(${d.red ? p : ac} / 0.75)`; ctx.fillText(CHARS[(Math.random() * CHARS.length) | 0], x, y - size);
        d.y += d.sp;
        if (y > H && Math.random() > 0.975) { d.y = 0; d.red = Math.random() < 0.08; }
      });
      if (reduce) cancelAnimationFrame(raf);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <div className="absolute inset-0" aria-hidden>
      <canvas ref={ref} className="absolute inset-0 h-full w-full opacity-60" />
      <div className="absolute inset-0 bg-hero-vignette" />
    </div>
  );
}
