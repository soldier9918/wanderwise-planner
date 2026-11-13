import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { GUIDES, type Guide } from "@/lib/guides";

export default function GuideArticle({ guide }: { guide: Guide }) {
  const others = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container max-w-3xl py-14">
        <Link to="/guides" className="text-sm text-muted-foreground hover:text-primary">← All guides</Link>
        <article>
          <p className="mt-6 text-xs uppercase tracking-widest text-primary">Guide · {guide.readMins} {guide.readMins === 1 ? "minute" : "minutes"} read</p>
          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">{guide.h1}</h1>
          <p className="mt-5 text-lg text-muted-foreground">{guide.intro}</p>
          {guide.sections.map((s) => (
            <section key={s.heading} className="mt-10">
              <h2 className="text-2xl font-bold">{s.heading}</h2>
              {s.paras.map((p) => <p key={p} className="mt-4 leading-relaxed text-muted-foreground">{p}</p>)}
              {s.list && <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">{s.list.map((l) => <li key={l}>{l}</li>)}</ul>}
            </section>
          ))}
        </article>
        <section className="mt-14 rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-2xl font-bold">Put this into practice</h2>
          <p className="mt-2 text-muted-foreground">Free plan includes 30 credits every month.</p>
          <div className="mt-6"><Button size="lg" asChild><Link to={guide.related.to}>{guide.related.label}</Link></Button></div>
        </section>
        <section className="mt-12">
          <h2 className="text-lg font-bold">More guides</h2>
          <ul className="mt-3 space-y-2">{others.map((o) => <li key={o.slug}><Link className="text-muted-foreground hover:text-primary" to={`/guides/${o.slug}`}>{o.h1}</Link></li>)}</ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
