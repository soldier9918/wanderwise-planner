import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/hooks/useAuth";
import HeroBackground from "@/components/HeroBackground";
import HeroReel from "@/components/HeroReel";
import HeroDotLogo from "@/components/HeroDotLogo";
import { useEffect, useRef, useState } from "react";
import TypedHeadline from "@/components/TypedHeadline";
import { Star, Play } from "lucide-react";
import thumbMh370 from "@/assets/example-thumb-mh370.jpg";
import thumbRome from "@/assets/example-thumb-rome.jpg";
import thumbBitcoin from "@/assets/example-thumb-bitcoin.jpg";
import thumbSpace from "@/assets/example-thumb-space.jpg";
import thumbStoic from "@/assets/example-thumb-stoic.jpg";
import thumbAi from "@/assets/example-thumb-ai.jpg";

const examples = [
  { img: thumbMh370, title: "The MH370 Mystery: What Really Happened?", by: "Dark Skies Daily", views: "212K views" },
  { img: thumbRome, title: "The Rise of Rome in 10 Minutes", by: "Past Forward", views: "98K views" },
  { img: thumbBitcoin, title: "Bitcoin Explained Simply", by: "Money Mindset", views: "154K views" },
  { img: thumbSpace, title: "Black Holes: What's Inside?", by: "Cosmos Lab", views: "301K views" },
  { img: thumbStoic, title: "5 Stoic Habits That Changed My Life", by: "Quiet Strength", views: "87K views" },
  { img: thumbAi, title: "AI in 2030: The Future Is Closer Than You Think", by: "Tech Horizon", views: "176K views" },
];

type Review = { name: string; role: string; stars: number; text: string };

const reviews: Review[] = [
  { name: "Marcus T.", role: "True crime channel, 40K subscribers", stars: 5, text: "I typed one sentence about a cold case and had a full video with voiceover in under ten minutes. My watch time has doubled since I started posting daily." },
  { name: "Priya S.", role: "History teacher & creator", stars: 5, text: "The fact-checking with sources is what sold me. I can trust the scripts enough to use them in class, and the thumbnails genuinely get clicks." },
  { name: "Dan W.", role: "Faceless finance channel", stars: 4, text: "Background music, captions and camera motion are all built in. I went from one video a week to one a day without hiring an editor." },
  { name: "Aisha K.", role: "Sleep stories & ASMR, 12K subs", stars: 5, text: "The whisper tone and the soft female voices are perfect for bedtime content. I used to record everything myself at 2am — now I don't." },
  { name: "Tom B.", role: "Gaming Shorts channel", stars: 4, text: "Switching to portrait 9:16 and picking the hype tone took me from long uploads to daily Shorts. The random mix of transition sounds keeps it lively." },
  { name: "Lena M.", role: "Study-with-me channel", stars: 5, text: "I set the mood to lo-fi, drop my own timer footage in for one scene, and export at 1080p. It sounds like a produced video, not a screen recording." },
  { name: "Chris O.", role: "Tech reviews, 78K subscribers", stars: 5, text: "The fast tech review tone is uncanny — punchy, no waffle. I redo the script on a scene until the hook lands, then ship it." },
  { name: "Sofia R.", role: "Stoicism & motivation page", stars: 5, text: "Thumbnails used to be my bottleneck. Now I generate one, tweak the text size, and it's done. My click rate went up the week I switched." },
  { name: "Jake P.", role: "Sports stats channel", stars: 4, text: "Setting the video length is the killer feature. Four scenes, two minutes, and the narration actually fills the time instead of trailing off." },
  { name: "Nina F.", role: "Nature & travel channel", stars: 5, text: "When the AI drew a landmark wrong, I just uploaded my own photo for that scene. Much easier than regenerating and hoping." },
  { name: "Ben H.", role: "Personal finance shorts", stars: 5, text: "I checked the sources list before posting a video on interest rates and every figure was right. That's what keeps my comments section calm." },
  { name: "Grace L.", role: "Book summaries channel", stars: 5, text: "Twenty-two scenes for a full book summary, all written from one line. The sentence captions look clean and never crowd the screen." },
  { name: "Omar D.", role: "History of science, 25K subs", stars: 5, text: "Calm documentary tone plus the documentary music mood is exactly the feel I wanted. It costs nothing to try, so I make three versions and pick one." },
  { name: "Ruby S.", role: "Horror story channel", stars: 5, text: "The horror camera movements are unreal — flickering light, film scratches, a slow creeping zoom. My viewers think I bought an effect pack." },
  { name: "Kai M.", role: "Coding tutorials", stars: 4, text: "I put my own screenshots in the tricky scenes and keep the AI pictures for the intros. Uploads, captions and export all work in one place." },
  { name: "Ella V.", role: "Parenting tips channel", stars: 5, text: "I hate being on camera. Now I write the idea, choose a warm narrator, and the video is finished before my coffee goes cold." },
];

const rowA = reviews.slice(0, 8);
const rowB = reviews.slice(8);

function ReviewRow({ items, dir, secs }: { items: Review[]; dir: "left" | "right"; secs: number }) {
  return (
    <div className="marquee marquee-mask overflow-hidden">
      <div
        className={`marquee-track ${dir === "left" ? "animate-marquee-left" : "animate-marquee-right"}`}
        style={{ animationDuration: `${secs}s` }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-stretch" aria-hidden={copy === 1}>
            {items.map((r) => (
              <div key={r.name} className="w-[340px] shrink-0 pr-5">
                <blockquote className="flex h-full flex-col rounded-xl border border-border bg-card p-6">
                  <div className="flex gap-1" aria-label={`${r.stars} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={i < r.stars ? "h-4 w-4 text-star" : "h-4 w-4 text-muted-foreground/40"}
                        fill="currentColor"
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-muted-foreground">“{r.text}”</p>
                  <footer className="mt-auto pt-4">
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-sm text-muted-foreground">{r.role}</p>
                  </footer>
                </blockquote>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const steps = [
  { n: "01", t: "Drop an idea", d: "“The rise and fall of Blockbuster” or “5 habits of ancient Stoics.” One line is enough." },
  { n: "02", t: "AI writes & shoots", d: "Vydora writes a hook-first script, then creates a cinematic image for every scene." },
  { n: "03", t: "Voice it, ship it", d: "A natural voiceover is recorded per scene. Preview, tweak, and download your video." },
];

export default function Landing() {
  const { user } = useAuth();
  const cta = user ? "/dashboard" : "/auth?mode=signup";
  // 0 = dot grid, 1 = thumbnail reel, 2 = VYDORA in dots
  const [mode, setMode] = useState(0);
  const headRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const secs = [10000, 8000, 8000];
    const id = window.setTimeout(() => setMode((m) => (m + 1) % 3), secs[mode]);
    return () => clearTimeout(id);
  }, [mode]);
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-glow" />
          <div className={`absolute inset-0 transition-opacity duration-[1500ms] ${mode === 0 ? "opacity-100" : "opacity-0"}`}><HeroBackground /></div>
          <div className={`absolute inset-0 transition-opacity duration-[1500ms] ${mode === 1 ? "opacity-100" : "opacity-0"}`}><HeroReel /></div>
          <div className={`absolute inset-0 transition-opacity duration-[1500ms] ${mode === 2 ? "opacity-100" : "opacity-0"}`}><HeroDotLogo active={mode === 2} target={headRef} /></div>
          <div className="container relative py-20 md:py-32">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" /> Faceless YouTube, made easy
            </p>
            <div ref={headRef} className={`transition-opacity duration-700 ${mode === 2 ? "invisible opacity-0" : "opacity-100"}`}>{mode !== 2 && <TypedHeadline />}{mode === 2 && <h1 className="text-5xl md:text-8xl font-extrabold leading-[0.95]" aria-label="Vydora"><span className="block">&nbsp;</span><span className="block">&nbsp;</span></h1>}</div>
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
            <p className="mt-3 text-muted-foreground">Real-style videos our creators shipped from a single sentence.</p>
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
                  <p className="mt-1 text-sm text-muted-foreground">{e.by} · {e.views}</p>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-16">
            <p className="mb-6 text-center text-sm uppercase tracking-widest text-muted-foreground">
              What creators say
            </p>
            <div className="space-y-5">
              <ReviewRow items={rowA} dir="left" secs={62} />
              <ReviewRow items={rowB} dir="right" secs={74} />
            </div>
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
