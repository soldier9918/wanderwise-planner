import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { FEATURE_PAGES, type FeaturePage } from "@/lib/featurePages";

export default function FeatureLanding({ page }: { page: FeaturePage }) {
  const others = FEATURE_PAGES.filter((p) => p.slug !== page.slug);
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container max-w-4xl py-14">
        <p className="text-xs uppercase tracking-widest text-primary">{page.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">{page.h1}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{page.intro}</p>
        <div className="mt-8"><Button size="lg" asChild><Link to={page.cta.to}>{page.cta.label}</Link></Button></div>

        <section className="mt-16">
          <h2 className="text-2xl font-bold">How it works</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {page.steps.map((s, i) => (
              <li key={s.title} className="rounded-xl border border-border bg-card p-5">
                <span className="text-sm font-bold text-accent">0{i + 1}</span>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {page.sections.map((s) => (
          <section key={s.heading} className="mt-14">
            <h2 className="text-2xl font-bold">{s.heading}</h2>
            {s.paras.map((p) => <p key={p} className="mt-4 text-muted-foreground">{p}</p>)}
          </section>
        ))}

        <section className="mt-14">
          <h2 className="text-2xl font-bold">Questions</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {page.faqs.map(([q, a]) => (
              <div key={q} className="rounded-xl border border-border bg-card p-5"><h3 className="font-semibold">{q}</h3><p className="mt-2 text-sm text-muted-foreground">{a}</p></div>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-2xl font-bold">Ready to make your first video?</h2>
          <p className="mt-2 text-muted-foreground">Free plan includes 30 credits every month. <Link className="text-primary hover:underline" to="/pricing">See pricing</Link>.</p>
          <div className="mt-6"><Button size="lg" asChild><Link to={page.cta.to}>{page.cta.label}</Link></Button></div>
        </section>

        <nav className="mt-12 text-sm text-muted-foreground">
          Also see: {others.map((o, i) => <span key={o.slug}>{i > 0 && " · "}<Link className="hover:text-primary" to={`/${o.slug}`}>{o.eyebrow}</Link></span>)}
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}
