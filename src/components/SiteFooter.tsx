import { Link } from "react-router-dom";
import { Logo } from "@/components/SiteHeader";
import { LEGAL_DOCS } from "@/lib/legal";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Vydora turns one sentence into a YouTube video — script, scenes, captions and voiceover, made with AI.
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Create</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="transition-colors hover:text-primary" to="/dashboard">New video</Link></li>
            <li><Link className="transition-colors hover:text-primary" to="/dashboard">My videos</Link></li>
            <li><Link className="transition-colors hover:text-primary" to="/#how">How it works</Link></li>
            <li><Link className="transition-colors hover:text-primary" to="/auth?mode=signup">Start free</Link></li>
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
