import { Link, useNavigate } from "react-router-dom";
import { LogOut, Plus } from "lucide-react";
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
  const navBtn = "h-8 px-2.5 text-sm sm:h-9 sm:px-4";
  const doSignOut = async () => { await signOut(); navigate("/"); };
  const goToCreateForm = () =>
    document.getElementById("new-video")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container flex min-h-16 flex-wrap items-center justify-between gap-x-2 gap-y-1 py-2">
        <Logo />
        {/* phones: sign out sits beside the logo so the links keep their own row */}
        {user && (
          <Button variant="outline" className={`${navBtn} sm:hidden`} aria-label="Sign out" onClick={doSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        )}
        <nav className="flex w-full flex-wrap items-center justify-end gap-1 sm:w-auto">
          {user && (
            <Button asChild className="h-8 px-3 text-sm sm:h-9 sm:px-4" onClick={goToCreateForm}>
              <Link to="/dashboard#new-video" className="inline-flex items-center gap-1.5">
                <Plus className="h-4 w-4" />Create<span className="hidden sm:inline"> video</span>
              </Link>
            </Button>
          )}
          <Button variant="ghost" asChild className={navBtn}><Link to="/pricing">Pricing</Link></Button>
          <Button variant="ghost" asChild className={navBtn}><Link to="/billing">Billing</Link></Button>
          {user ? (
            <>
              <Button variant="ghost" asChild className={navBtn}><Link to="/dashboard">My videos</Link></Button>
              <Button variant="ghost" asChild className={`hidden md:inline-flex ${navBtn}`}><Link to="/from-url">Article to video</Link></Button>
              <Button variant="outline" className={`hidden sm:inline-flex ${navBtn}`} onClick={doSignOut}>Sign out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className={navBtn}><Link to="/auth">Sign in</Link></Button>
              <Button asChild className={navBtn}><Link to="/auth?mode=signup">Start free</Link></Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
