import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Coins, Gift, LogOut, Menu, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAccount } from "@/lib/account";
import { scrollToSection } from "@/components/ScrollToTop";
import ProfileMenu, { planLabel } from "@/components/ProfileMenu";

export function Logo({ name = "Vydora" }: { name?: string }) {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M8 5v14l11-7z" /></svg>
      </span>
      {name}
    </Link>
  );
}

export default function SiteHeader() {
  const { user, signOut } = useAuth();
  const { data: acct } = useAccount();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const on = (to: string) => (pathname === to || (to === "/dashboard" && pathname === "/my-videos") ? "text-primary" : "");
  const [open, setOpen] = useState(false);
  const navBtn = "h-9 px-4 text-sm whitespace-nowrap";
  const low = acct ? acct.balance <= 5 : false;
  const balancePill = "inline-flex h-9 items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 text-sm font-semibold tabular-nums";
  const close = () => setOpen(false);
  const doSignOut = async () => { close(); await signOut(); navigate("/"); };

  // From Billing itself the hash link would be a no-op, so scroll by hand.
  const onTopUpClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/billing") return;
    e.preventDefault();
    scrollToSection("top-ups", "smooth");
  };

  const mobileLink = "block rounded-md px-3 py-3 text-base font-medium hover:bg-muted";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-2">
        <Logo name="VYDORA.AI" />
        <nav className="hidden items-center gap-1 min-[1150px]:flex">
          {user ? (
            <>
              <Button asChild className={`${navBtn} ${pathname === "/create" ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}>
                <Link to="/create" className="inline-flex items-center gap-1.5">
                  <Plus className="h-4 w-4" />Create video
                </Link>
              </Button>
              <Button variant="ghost" asChild className={`${navBtn} ${on("/from-url")}`}><Link to="/from-url" aria-current={on("/from-url") ? "page" : undefined}>Article to video</Link></Button>
              <Button variant="ghost" asChild className={`${navBtn} ${on("/series")}`}><Link to="/series" aria-current={on("/series") ? "page" : undefined}>Series</Link></Button>
              <Button variant="ghost" asChild className={`${navBtn} ${on("/dashboard")}`}><Link to="/dashboard" aria-current={on("/dashboard") ? "page" : undefined}>My videos</Link></Button>
              <Button variant="ghost" asChild className={`${navBtn} ${on("/library")}`}><Link to="/library" aria-current={on("/library") ? "page" : undefined}>My Library</Link></Button>
              <Button variant="ghost" asChild className={`${navBtn} ${on("/pricing")}`}><Link to="/pricing" aria-current={on("/pricing") ? "page" : undefined}>Pricing</Link></Button>
              <Button variant="ghost" asChild className={`${navBtn} ${on("/billing")}`}><Link to="/billing" aria-current={on("/billing") ? "page" : undefined}>Plans &amp; Billing</Link></Button>
              <div className={`${balancePill} pr-1 ${low ? "border-primary/60 text-primary" : ""}`}>
                <Link to="/billing" aria-label="Credit balance" className="inline-flex items-center gap-1.5 hover:opacity-80">
                  <Coins className="h-4 w-4 text-primary" />
                  {acct ? acct.balance : "—"}<span className="font-medium text-muted-foreground">credits</span>
                </Link>
                <Link to="/billing#top-ups" onClick={onTopUpClick} aria-label="Top up credits" title="Top up credits" className="ml-1 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                </Link>
              </div>
              <ProfileMenu onSignOut={doSignOut} />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className={`${navBtn} ${on("/pricing")}`}><Link to="/pricing" aria-current={on("/pricing") ? "page" : undefined}>Pricing</Link></Button>
              <Button variant="ghost" asChild className={`${navBtn} ${on("/billing")}`}><Link to="/billing" aria-current={on("/billing") ? "page" : undefined}>Billing</Link></Button>
              <Button variant="ghost" asChild className={`${navBtn} ${on("/auth")}`}><Link to="/auth" aria-current={on("/auth") ? "page" : undefined}>Sign in</Link></Button>
              <Button asChild className={navBtn}><Link to="/auth?mode=signup">Start free</Link></Button>
            </>
          )}
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="min-[1150px]:hidden"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      {open && (
        <>
          <div className="fixed inset-0 top-16 z-30 bg-background/60 min-[1150px]:hidden" onClick={close} />
          <nav className="absolute inset-x-0 top-16 z-40 border-b border-border bg-background p-3 shadow-lg min-[1150px]:hidden">
            {user ? (
              <>
                <div className="mb-3 flex items-center gap-3 rounded-md border border-border/70 bg-card p-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-primary/60 font-display text-sm font-bold uppercase text-primary">{user.email?.charAt(0)}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.email}</p>
                    <p className="text-xs text-primary">{planLabel(acct)} plan</p>
                  </div>
                  <Link to="/billing#invite" onClick={close} className="ml-auto inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary"><Gift className="h-4 w-4" />Invite</Link>
                </div>
                <Link to="/create" onClick={close} className="mb-2 flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-3 font-semibold text-primary-foreground">
                  <Plus className="h-4 w-4" />Create video
                </Link>
                <Link to="/from-url" onClick={close} className={`${mobileLink} ${on("/from-url")}`}>Article to video</Link>
                <Link to="/series" onClick={close} className={`${mobileLink} ${on("/series")}`}>Series generator</Link>
                <Link to="/dashboard" onClick={close} className={`${mobileLink} ${on("/dashboard")}`}>My videos</Link>
                <Link to="/library" onClick={close} className={`${mobileLink} ${on("/library")}`}>My Library</Link>
                <Link to="/pricing" onClick={close} className={`${mobileLink} ${on("/pricing")}`}>Pricing</Link>
                <Link to="/billing" onClick={close} className={`${mobileLink} ${on("/billing")}`}>Plans &amp; Billing</Link>
                <div className="mb-2 flex items-center gap-2">
                  <Link to="/billing" onClick={close} className={`${balancePill} min-w-0 flex-1 justify-center ${low ? "border-primary/60 text-primary" : ""}`}>
                    <Coins className="h-4 w-4 text-primary" />
                    {acct ? acct.balance : "—"}<span className="font-medium text-muted-foreground">credits</span>
                  </Link>
                  <button onClick={close} aria-label="Close menu" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Link to="/billing#top-ups" onClick={(e) => { close(); onTopUpClick(e); }} className="mb-2 flex items-center justify-center gap-2 rounded-md border border-primary/60 px-3 py-2 font-semibold text-primary"><Plus className="h-4 w-4" />Top up credits</Link>
                <button onClick={doSignOut} className={`${mobileLink} flex w-full items-center gap-2 text-left text-muted-foreground`}>
                  <LogOut className="h-4 w-4" />Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/pricing" onClick={close} className={`${mobileLink} ${on("/pricing")}`}>Pricing</Link>
                <Link to="/billing" onClick={close} className={`${mobileLink} ${on("/billing")}`}>Billing</Link>
                <Link to="/auth" onClick={close} className={`${mobileLink} ${on("/auth")}`}>Sign in</Link>
                <Link to="/auth?mode=signup" onClick={close} className="mt-2 block rounded-md bg-primary px-3 py-3 text-center font-semibold text-primary-foreground">Start free</Link>
              </>
            )}
          </nav>
        </>
      )}
    </header>
  );
}
