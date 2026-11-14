import { Link } from "react-router-dom";
import { Logo } from "@/components/SiteHeader";
import { LEGAL_DOCS } from "@/lib/legal";
import { FEATURE_PAGES } from "@/lib/featurePages";
import { GUIDES } from "@/lib/guides";

const GUIDE_LABELS: Record<string, string> = {
  "youtube-monetization-faceless-ai-channels": "Monetising AI channels",
  "best-faceless-youtube-niches": "Best faceless niches",
  "youtube-shorts-hooks": "Hooks for Shorts",
  "turn-blog-posts-into-youtube-videos": "Blog posts to videos",
  "how-to-plan-a-youtube-series": "Planning a series",
  "automate-youtube-channel-with-ai": "Automating your channel",
  "ai-product-video-ads": "AI product video ads",
};

export default function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Vydora turns one sentence into a YouTube video — script, scenes, captions and voiceover, made with AI.
          </p>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Built for faceless channels, educators, bloggers and Shorts creators. Start free with 30 credits every month.
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Create</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="transition-colors hover:text-primary" to="/create">Create video</Link></li>
            <li><Link className="transition-colors hover:text-primary" to="/from-url">Article to video</Link></li>
            <li><Link className="transition-colors hover:text-primary" to="/series">Series planner</Link></li>
            <li><Link className="transition-colors hover:text-primary" to="/dashboard">My videos</Link></li>
            <li><Link className="transition-colors hover:text-primary" to="/pricing">Pricing &amp; costs</Link></li>
            <li><Link className="transition-colors hover:text-primary" to="/billing">Billing</Link></li>
            <li><Link className="transition-colors hover:text-primary" to="/#how">How it works</Link></li>
            <li><Link className="transition-colors hover:text-primary" to="/auth?mode=signup">Start free</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Features</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {FEATURE_PAGES.map((p) => (
              <li key={p.slug}><Link className="transition-colors hover:text-primary" to={`/${p.slug}`}>{p.eyebrow}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Creator hub</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {GUIDES.map((g) => (
              <li key={g.slug}><Link className="transition-colors hover:text-primary" to={`/guides/${g.slug}`}>{GUIDE_LABELS[g.slug] ?? g.h1}</Link></li>
            ))}
            <li><Link className="font-semibold text-primary hover:underline" to="/guides">All guides →</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Legal</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {LEGAL_DOCS.map((doc) => (
              <li key={doc.slug}>
                <Link className="transition-colors hover:text-primary" to={`/${doc.slug}`}>{doc.title}</Link>
              </li>
            ))}
          </ul>
          <h3 className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">Help &amp; contact</h3>
          <a className="mt-4 block text-sm transition-colors hover:text-primary" href="mailto:contact@vydora.ai">contact@vydora.ai</a>
        </div>
      </div>

      <div className="border-t border-border/60 py-6">
        <p className="container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Vydora · All rights reserved
        </p>
      </div>
    </footer>
  );
}
