import { useEffect, useRef } from "react";

/** Night-sky hero: black background with small stars that flicker and drift. */
type Star = {
  x: number;
  y: number;
  r: number;
  base: number;
  speed: number;
  phase: number;
  depth: number;
  tint: number;
};

type Shooting = { x: number; y: number; vx: number; vy: number; life: number; max: number };

export default function HeroBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let W = 0;
    let H = 0;
    let stars: Star[] = [];
    let shooting: Shooting[] = [];
    let nextShoot = 3;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const build = () => {
      const count = Math.round((W * H) / 2400);
      stars = Array.from({ length: count }, () => {
        const depth = rand(0.25, 1);
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          r: rand(0.35, 1.1) * (0.6 + depth * 0.7),
          base: rand(0.25, 0.95) * (0.45 + depth * 0.55),
          speed: rand(0.5, 2.6),
          phase: rand(0, Math.PI * 2),
          depth,
          tint: Math.random(),
        };
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = Math.max(1, Math.floor(W * dpr));
      canvas.height = Math.max(1, Math.floor(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      const t = now / 1000;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);

      for (const s of stars) {
        // slow drift, deeper stars move less
        if (!reduce) {
          s.x -= s.depth * 3.2 * (1 / 60);
          if (s.x < -2) s.x = W + 2;
        }

        // flicker: mostly smooth twinkle, with occasional sharp flares
        let b = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
        b = s.base * (0.28 + 0.72 * b);
        const flare = Math.sin(t * (s.speed * 3.1) + s.phase * 2.7);
        if (flare > 0.994) b = Math.min(1, b + 0.55);

        const col =
          s.tint > 0.94
            ? "255,214,170"
            : s.tint > 0.88
              ? "180,205,255"
              : "255,255,255";

        ctx.fillStyle = `rgba(${col},${b.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        // soft halo on the brightest ones
        if (s.r > 0.95 && b > 0.55) {
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 6);
          g.addColorStop(0, `rgba(${col},${(b * 0.3).toFixed(3)})`);
          g.addColorStop(1, `rgba(${col},0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // shooting stars
      if (!reduce) {
        if (t > nextShoot) {
          nextShoot = t + rand(5, 12);
          const fromLeft = Math.random() > 0.5;
          shooting.push({
            x: fromLeft ? rand(-80, W * 0.4) : rand(W * 0.6, W + 80),
            y: rand(-40, H * 0.5),
            vx: (fromLeft ? 1 : -1) * rand(320, 520),
            vy: rand(120, 240),
            life: 0,
            max: rand(0.7, 1.2),
          });
        }
        shooting = shooting.filter((sh) => sh.life < sh.max && sh.y < H + 120);
        for (const sh of shooting) {
          sh.life += 1 / 60;
          sh.x += sh.vx / 60;
          sh.y += sh.vy / 60;
          const fade = Math.max(0, 1 - sh.life / sh.max);
          const len = 90;
          const nx = sh.vx / Math.hypot(sh.vx, sh.vy);
          const ny = sh.vy / Math.hypot(sh.vx, sh.vy);
          const g = ctx.createLinearGradient(sh.x, sh.y, sh.x - nx * len, sh.y - ny * len);
          g.addColorStop(0, `rgba(255,255,255,${(0.8 * fade).toFixed(3)})`);
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(sh.x, sh.y);
          ctx.lineTo(sh.x - nx * len, sh.y - ny * len);
          ctx.stroke();
        }
      }

      if (!reduce) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full bg-black" aria-hidden />;
}
