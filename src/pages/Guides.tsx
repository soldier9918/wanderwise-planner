import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { GUIDES } from "@/lib/guides";

export default function Guides() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container max-w-5xl py-14">
        <p className="text-xs uppercase tracking-widest text-primary">Creator hub</p>
        <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">Guides for growing a YouTube channel with AI</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">Practical, no-fluff articles on niches, monetisation, Shorts, repurposing and series planning.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {GUIDES.map((g) => (
            <Link key={g.slug} to={`/guides/${g.slug}`} className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary">
              <p className="text-xs text-muted-foreground">{g.readMins} {g.readMins === 1 ? "minute" : "minutes"} read</p>
              <h2 className="mt-2 text-xl font-bold group-hover:text-primary">{g.h1}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{g.description}</p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
