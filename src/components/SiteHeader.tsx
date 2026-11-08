import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M8 5v14l11-7z" /></svg>
      </span>
      Vydora
    </Link>
  );
}

export default function SiteHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container flex min-h-16 flex-wrap items-center justify-between gap-2 py-2">
        <Logo />
        <nav className="flex flex-wrap items-center gap-1">
          <Button variant="ghost" asChild><Link to="/pricing">Pricing</Link></Button>
          <Button variant="ghost" asChild><Link to="/billing">Billing</Link></Button>
          {user ? (
            <>
              <Button variant="ghost" asChild><Link to="/dashboard">My videos</Link></Button>
              <Button variant="ghost" asChild className="hidden md:inline-flex"><Link to="/from-url">Article to video</Link></Button>
              <Button variant="outline" onClick={async () => { await signOut(); navigate("/"); }}>Sign out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild><Link to="/auth">Sign in</Link></Button>
              <Button asChild><Link to="/auth?mode=signup">Start free</Link></Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
