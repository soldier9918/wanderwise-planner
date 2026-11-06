import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/hooks/useAuth";
import HeroBackground from "@/components/HeroBackground";
import TypedHeadline from "@/components/TypedHeadline";

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
        <section className="relative overflow-hidden bg-black">
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
