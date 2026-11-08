import { useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { CREDIT_COSTS, costBreakdown, estimateCredits } from "@/lib/credits";
import { MIN_SCENES, MAX_SCENES } from "@/lib/sceneCount";

const MENU = [
  { label: "Write the script", credits: CREDIT_COSTS.script, note: "Once per video" },
  { label: "Use real facts (web search)", credits: CREDIT_COSTS.facts, note: "Optional, once per video" },
  { label: "Scene image", credits: CREDIT_COSTS.image, note: "Per scene, and per redo" },
  { label: "Scene voiceover", credits: CREDIT_COSTS.voice, note: "Per scene, and per redo" },
  { label: "✨ Animate scene", credits: CREDIT_COSTS.animate, note: "Per scene — AI video is costly to make" },
  { label: "Thumbnail", credits: CREDIT_COSTS.thumbnail, note: "Per thumbnail or text redo" },
  { label: "SEO titles, description & tags", credits: CREDIT_COSTS.seo, note: "Per generation" },
  { label: "1080p Full HD export", credits: CREDIT_COSTS.fullHd, note: "Once per video — 720p HD is free" },
  { label: "Music, sound effects, camera motion, transitions, captions, 720p download", credits: 0, note: "Always free" },
];

const PLANS = [
  { name: "Free", price: "£0", credits: "40 credits once", desc: "Enough for one full video plus a thumbnail." },
  { name: "Creator", price: "£19/mo", credits: "600 credits / month", desc: "About 15–18 standard videos, or 3 fully animated." },
  { name: "Pro", price: "£49/mo", credits: "2,000 credits / month", desc: "About 60 standard videos, or 10–12 fully animated." },
];

export default function Pricing() {
  const [scenes, setScenes] = useState(6);
  const [animated, setAnimated] = useState(0);
  const [facts, setFacts] = useState(false);
  const [thumb, setThumb] = useState(true);
  const [seo, setSeo] = useState(true);
  const [hd, setHd] = useState(false);
  const input = { scenes, animated: Math.min(animated, scenes), useFacts: facts, thumbnail: thumb, seo, quality: hd ? "1080p" : "720p" };
  const total = estimateCredits(input);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container max-w-5xl py-12">
        <h1 className="text-4xl font-extrabold md:text-5xl">What things cost</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Vydora uses credits. Each AI step uses a few; everything that runs in your browser is free. You only pay for what you make.</p>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-bold">Credit menu</h2>
            <ul className="mt-4 divide-y divide-border">
              {MENU.map((m) => (
                <li key={m.label} className="flex items-start justify-between gap-4 py-3">
                  <span><span className="font-semibold">{m.label}</span><span className="block text-xs text-muted-foreground">{m.note}</span></span>
                  <span className={`shrink-0 font-display font-bold ${m.credits ? "text-primary" : "text-accent"}`}>{m.credits ? `${m.credits} cr` : "Free"}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-bold">Cost calculator</h2>
            <div className="mt-5 grid gap-5">
              <label className="grid gap-2 text-sm font-semibold">Scenes: {scenes}
                <Slider min={MIN_SCENES} max={MAX_SCENES} step={1} value={[scenes]} onValueChange={([v]) => setScenes(v)} />
              </label>
              <label className="grid gap-2 text-sm font-semibold">Animated scenes: {Math.min(animated, scenes)}
                <Slider min={0} max={MAX_SCENES} step={1} value={[Math.min(animated, scenes)]} onValueChange={([v]) => setAnimated(Math.min(v, scenes))} />
              </label>
              {([["Use real facts", facts, setFacts], ["Thumbnail", thumb, setThumb], ["SEO titles & tags", seo, setSeo], ["1080p Full HD", hd, setHd]] as const).map(([l, v, set]) => (
                <label key={l} className="flex items-center justify-between text-sm font-semibold">{l}<Switch checked={v} onCheckedChange={set} /></label>
              ))}
            </div>
            <ul className="mt-5 grid gap-1 border-t border-border pt-4 text-sm text-muted-foreground">
              {costBreakdown(input).map((l) => <li key={l.label} className="flex justify-between"><span>{l.label}</span><span>{l.credits}</span></li>)}
            </ul>
            <p className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
              <span className="font-semibold">Estimated total</span>
              <span className="font-display text-3xl font-extrabold text-primary">⚡ {total} credits</span>
            </p>
          </div>
        </section>


        <section className="mt-12">
          <h2 className="text-2xl font-bold">Plans <span className="ml-2 rounded-full border border-border px-2 py-0.5 align-middle text-xs font-semibold text-muted-foreground">Coming soon</span></h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {PLANS.map((p) => (
              <div key={p.name} className="rounded-xl border border-border bg-card p-6">
                <p className="font-semibold text-muted-foreground">{p.name}</p>
                <p className="mt-2 font-display text-3xl font-extrabold">{p.price}</p>
                <p className="mt-1 font-semibold text-primary">{p.credits}</p>
                <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-2">
          {[
            ["Why does animating cost more?", "Each animated scene is a short AI-made video clip, which takes far more computing power than a still picture."],
            ["Do redos cost credits?", "Yes — redoing an image, voiceover, script, thumbnail or SEO costs the same as making it the first time."],
            ["What happens if I run out?", "AI steps pause until you top up. Your videos, edits and downloads stay available."],
            ["Are estimates exact?", "They're close guides based on your settings. Redos and extra scenes add to the total."],
          ].map(([q, a]) => (
            <div key={q} className="rounded-xl border border-border bg-card p-5"><p className="font-semibold">{q}</p><p className="mt-2 text-sm text-muted-foreground">{a}</p></div>
          ))}
        </section>

        <div className="mt-12 text-center"><Button size="lg" asChild><Link to="/dashboard">Make a video</Link></Button></div>
      </main>
      <SiteFooter />
    </div>
  );
}
