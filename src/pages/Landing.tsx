import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/hooks/useAuth";
import HeroBackground from "@/components/HeroBackground";
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

const reviews = [
  { name: "Marcus T.", role: "True crime channel, 40K subscribers", stars: 5, text: "I typed one sentence about a cold case and had a full video with voiceover in under ten minutes. My watch time has doubled since I started posting daily." },
  { name: "Priya S.", role: "History teacher & creator", stars: 5, text: "The fact-checking with sources is what sold me. I can trust the scripts enough to use them in class, and the thumbnails genuinely get clicks." },
  { name: "Dan W.", role: "Faceless finance channel", stars: 4, text: "Background music, captions and camera motion are all built in. I went from one video a week to one a day without hiring an editor." },
];

const steps = [
  { n: "01", t: "Drop an idea", d: "“The rise and fall of Blockbuster” or “5 habits of ancient Stoics.” One line is enough." },
  { n: "02", t: "AI writes & shoots", d: "Vydora writes a hook-first script, then creates a cinematic image for every scene." },
  { n: "03", t: "Voice it, ship it", d: "A natural voiceover is recorded per scene. Preview, tweak, and download your video." },
];

export default function Landing() {
  const { user } = useAuth();
  const cta = user ? "/dashboard" : "/auth?mode=signup";
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-glow" />
          <HeroBackground />
          <div className="container relative py-20 md:py-32">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" /> Faceless YouTube, made easy
            </p>
            <TypedHeadline />
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

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {reviews.map((r) => (
              <blockquote key={r.name} className="rounded-xl border border-border bg-card p-6">
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
                <footer className="mt-4">
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-sm text-muted-foreground">{r.role}</p>
                </footer>
              </blockquote>
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
