import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { findLegalDoc } from "@/lib/legal";

export default function Legal({ slug }: { slug: string }) {
  const doc = findLegalDoc(slug);

  if (!doc) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="container py-24 text-center">
          <h1 className="text-4xl font-extrabold">That page isn't here</h1>
          <p className="mt-3 text-muted-foreground">This legal document doesn't exist.</p>
          <Button className="mt-8" asChild><Link to="/">Go home</Link></Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container max-w-3xl py-14 md:py-20">
        <nav className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-primary">Home</Link>
          <span aria-hidden>/</span>
          <span className="text-foreground">Legal</span>
        </nav>

        <h1 className="mt-6 text-4xl font-extrabold md:text-6xl">{doc.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: {doc.updated}</p>
        <p className="mt-6 text-lg text-muted-foreground">{doc.intro}</p>

        <section className="mt-10 rounded-xl border border-border bg-card p-6">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">On this page</h2>
          <ol className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {doc.sections.map((section, i) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="flex gap-2 transition-colors hover:text-primary">
                  <span className="font-display text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span>{section.heading}</span>
                </a>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-12 space-y-12">
          {doc.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-2xl font-semibold">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-muted-foreground">
                {section.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            These documents are a plain-language summary of how Vydora works. They are not legal advice — if you
            need to rely on them commercially, have a lawyer check them against the laws that apply to you.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="outline" asChild><Link to="/">Back to home</Link></Button>
            <Button variant="ghost" asChild><Link to="/dashboard">Go to my videos</Link></Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
