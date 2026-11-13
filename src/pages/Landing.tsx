import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/hooks/useAuth";
import HeroBackground from "@/components/HeroBackground";
import HeroReel from "@/components/HeroReel";
import HeroDotLogo from "@/components/HeroDotLogo";
import HeroStudio from "@/components/HeroStudio";
import HeroDotGrid from "@/components/HeroDotGrid";
import { useEffect, useRef, useState } from "react";
import CreationTimelapse from "@/components/CreationTimelapse";
import TypedHeadline from "@/components/TypedHeadline";
import { Play, Link2, Layers, Search, Film, Smartphone, Music, ArrowRight } from "lucide-react";
import thumbMh370 from "@/assets/example-thumb-mh370.jpg";
import thumbRome from "@/assets/example-thumb-rome.jpg";
import thumbBitcoin from "@/assets/example-thumb-bitcoin.jpg";
import thumbSpace from "@/assets/example-thumb-space.jpg";
import thumbStoic from "@/assets/example-thumb-stoic.jpg";
import thumbAi from "@/assets/example-thumb-ai.jpg";

const examples = [
  { img: thumbMh370, title: "The MH370 Mystery: What Really Happened?" },
  { img: thumbRome, title: "The Rise of Rome in 10 Minutes" },
  { img: thumbBitcoin, title: "Bitcoin Explained Simply" },
  { img: thumbSpace, title: "Black Holes: What's Inside?" },
  { img: thumbStoic, title: "5 Stoic Habits That Changed My Life" },
  { img: thumbAi, title: "AI in 2030: The Future Is Closer Than You Think" },
];

import reelTitanic from "@/assets/reel-titanic.jpg";
import reelEgypt from "@/assets/reel-egypt.jpg";
import reelMars from "@/assets/reel-mars.jpg";
import reelVikings from "@/assets/reel-vikings.jpg";
import reelTokyo from "@/assets/reel-tokyo.jpg";
import reelOcean from "@/assets/reel-ocean.jpg";

const features = [
  { img: reelTitanic, icon: Link2, tag: "Article to Video", t: "Turn any link into a video", d: "Paste a news story or blog post. Vydora pulls out the key points, keeps the sources, and builds a full video.", to: "/from-url" },
  { img: reelEgypt, icon: Layers, tag: "Series", t: "Plan a whole series at once", d: "Pick a topic and get a run of connected episodes with a shared look, each one ready to generate.", to: "/series" },
  { img: reelMars, icon: Search, tag: "Real facts", t: "Scripts backed by sources", d: "Switch on real facts and the script is researched from the web, with every source listed for you to check.", to: "/create" },
  { img: reelVikings, icon: Film, tag: "Animation & B-roll", t: "Bring scenes to life", d: "Animate any scene with AI or drop in free stock footage to keep viewers watching.", to: "/create" },
  { img: reelTokyo, icon: Smartphone, tag: "Shorts remix", t: "One video, two formats", d: "Remix any widescreen video into a vertical Short in one click, using the same scenes and voice.", to: "/create" },
  { img: reelOcean, icon: Music, tag: "Branding & sound", t: "Make it yours", d: "Add your logo, intro and outro cards, background music and the narrator voice and accent you like.", to: "/create" },
];

const steps = [
  { n: "01", t: "Drop an idea", d: "“The rise and fall of Blockbuster” or “5 habits of ancient Stoics.” One line is enough." },
  { n: "02", t: "AI writes & shoots", d: "Vydora writes a hook-first script, then creates a cinematic image for every scene." },
  { n: "03", t: "Voice it, ship it", d: "A natural voiceover is recorded per scene. Preview, tweak, and download your video." },
];

const niches = [
  { t: "History & mystery", d: "Documentary-style videos on unsolved cases, lost civilisations and famous events, with optional real-fact research and sources." },
  { t: "Finance, tech & crypto", d: "Clear explainers on markets, Bitcoin, AI and gadgets, turned from a single idea or a news article link." },
  { t: "Science & space", d: "Visual stories about planets, the deep sea and big discoveries, with AI images or stock B-roll for every scene." },
  { t: "Shorts & quick facts", d: "Vertical 9:16 videos for YouTube Shorts, or remix any long video into a Short without paying again." },
];

const allInOne = [
  "AI script writing from an idea, a brief or an article link",
  "An image for every scene, plus optional animation or free stock B-roll",
  "Natural AI voiceover with adjustable speed and accent",
  "Captions, background music, intro and outro cards with your logo",
  "Export a YouTube-ready MP4 in 16:9 or 9:16, right in your browser",
];

const faqs = [
  { q: "How does Vydora make a video from one sentence?", a: "You type an idea. Vydora writes a script, splits it into scenes, creates an image and voiceover for each scene and times them together. You can edit any scene, swap images or narration, then download the finished video." },
  { q: "Can I turn an article or blog post into a video?", a: "Yes. Paste a link into Article to Video and Vydora reads the page, writes a narrated script from it and builds the scenes, keeping a link to the original source." },
  { q: "Can I make YouTube Shorts?", a: "Yes. Create videos in vertical 9:16, or use Remix for Shorts to turn an existing video into a Short using the same media, at no extra credit cost." },
  { q: "Do I need video editing experience or software?", a: "No. Everything runs in your web browser. There is nothing to install, and the editor is built for beginners as well as experienced creators." },
  { q: "Can I monetise videos made with Vydora?", a: "You own the videos you create. YouTube decides monetisation based on its own policies, which favour original, valuable content and ask creators to disclose realistic AI content, so add your own ideas, research and voice to every video." },
  { q: "Can Vydora use real facts and sources?", a: "Turn on Use real facts and Vydora researches the topic on the web before writing, then lists the sources so you can check them." },
  { q: "How much does it cost?", a: "There is a free plan with 30 credits every month. Creator is £19 a month with 600 credits and Pro is £49 a month with 2,000 credits. You can also buy credit top-ups at any time." },
];

export default function Landing() {
  const { user } = useAuth();
  const cta = user ? "/create" : "/auth?mode=signup";
  // 0 = VYDORA in dots, 1 = dot grid, 2 = thumbnail reel, 3 = AI studio
  const [mode, setMode] = useState(2);
  const headRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const secs = [12000, 8000, 8000, 9000, 9000];
    const id = window.setTimeout(() => setMode((m) => (m + 1) % 5), secs[mode]);
    return () => clearTimeout(id);
  }, [mode]);
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-glow" />
          <div className={`absolute inset-0 transition-opacity duration-[1500ms] ${mode === 1 ? "opacity-100" : "opacity-0"}`}><HeroBackground /></div>
          <div className={`absolute inset-0 transition-opacity duration-[1500ms] ${mode === 2 ? "opacity-100" : "opacity-0"}`}><HeroReel /></div>
          <div className={`absolute inset-0 transition-opacity duration-[1500ms] ${mode === 0 ? "opacity-100" : "opacity-0"}`}><HeroDotLogo active={mode === 0} target={headRef} /></div>
          <div className={`absolute inset-0 transition-opacity duration-[1500ms] ${mode === 3 ? "opacity-100" : "opacity-0"}`}><HeroStudio active={mode === 3} /></div>
          <div className={`absolute inset-0 transition-opacity duration-[1500ms] ${mode === 4 ? "opacity-100" : "opacity-0"}`}><HeroDotGrid /></div>
          <div className="container relative py-20 md:py-32">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" /> Faceless YouTube, made easy
            </p>
            <div ref={headRef} className={`transition-opacity duration-700 ${mode === 0 ? "invisible opacity-0" : "opacity-100"}`}>{mode !== 0 && <TypedHeadline />}{mode === 0 && <h1 className="text-5xl md:text-8xl font-extrabold leading-[0.95]" aria-label="Vydora"><span className="block">&nbsp;</span><span className="block">&nbsp;</span></h1>}</div>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Vydora turns a single sentence into a full YouTube video — script, scenes and voiceover — powered by AI.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button size="lg" className="h-12 px-8 text-base shadow-elevated" asChild><Link to={cta}>Create a video</Link></Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild><a href="#how">How it works</a></Button>
            </div>
          </div>
        </section>

        <section id="how" className="container py-20">
          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="bg-card p-8">
                <span className="font-display text-sm text-accent">{s.n}</span>
                <h3 className="mt-3 text-2xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container py-20">
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-extrabold md:text-5xl">Made with Vydora</h2>
            <p className="mt-3 text-muted-foreground">Example videos, each made from a single sentence.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {examples.map((e) => (
              <figure key={e.title} className="group overflow-hidden rounded-xl border border-border bg-card">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={e.img}
                    alt={e.title}
                    loading="lazy"
                    width={1280}
                    height={720}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-background/0 transition-colors group-hover:bg-background/30">
                    <Play className="h-10 w-10 text-primary opacity-0 transition-opacity group-hover:opacity-100" fill="currentColor" />
                  </span>
                </div>
                <figcaption className="p-4">
                  <p className="font-semibold leading-snug">{e.title}</p>
                </figcaption>
              </figure>
            ))}
          </div>

        </section>

        <CreationTimelapse />

        <section className="container py-20">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-widest text-accent">Everything in one studio</p>
            <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">More ways to make videos</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Link key={f.tag} to={user ? f.to : cta} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50">
                <div className="relative aspect-video overflow-hidden">
                  <img src={f.img} alt={f.t} loading="lazy" width={1280} height={720} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold backdrop-blur">
                    <f.icon className="h-3.5 w-3.5 text-primary" /> {f.tag}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-semibold">{f.t}</h3>
                  <p className="mt-2 text-muted-foreground">{f.d}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary">Try it <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="container py-20">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-widest text-accent">Built for faceless YouTube channels</p>
            <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">Videos for every niche</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Vydora is an AI YouTube video maker for creators who never show their face. Pick a topic, choose a style and get a narrated, scene-by-scene video ready to upload.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {niches.map((n) => (
              <div key={n.t} className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold">{n.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{n.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container py-20">
          <div className="grid gap-10 rounded-2xl border border-border bg-card p-8 md:grid-cols-2 md:p-12">
            <div>
              <p className="text-sm uppercase tracking-widest text-accent">One studio, not five tools</p>
              <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Replace your whole video workflow</h2>
              <p className="mt-4 text-muted-foreground">Making a faceless YouTube video usually means juggling a script writer, an image generator, a voiceover tool, stock footage sites and a video editor. Vydora puts every step in one place, so you go from idea to finished MP4 without copying files between apps.</p>
            </div>
            <ul className="space-y-3">
              {allInOne.map((a) => (
                <li key={a} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" /><span>{a}</span></li>
              ))}
            </ul>
          </div>
        </section>

        <section className="container max-w-3xl py-20">
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-extrabold md:text-5xl">Frequently asked questions</h2>
          </div>
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {faqs.map((f) => (
              <details key={f.q} className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  <h3 className="text-lg">{f.q}</h3>
                  <span className="text-2xl text-primary transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="container pb-24">
          <div className="rounded-2xl border border-border bg-card p-10 text-center md:p-16">
            <h2 className="text-4xl font-extrabold md:text-5xl">Your next video is one sentence away.</h2>
            <Button size="lg" className="mt-8 h-12 px-8" asChild><Link to={cta}>Start creating</Link></Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
