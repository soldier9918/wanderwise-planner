import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Coins, LogOut, Menu, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAccount } from "@/lib/account";

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
  const { data: acct } = useAccount();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const navBtn = "h-9 px-4 text-sm";
  const low = acct ? acct.balance <= 5 : false;
  const balancePill = "inline-flex h-9 items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 text-sm font-semibold tabular-nums";
  const close = () => setOpen(false);
  const doSignOut = async () => { close(); await signOut(); navigate("/"); };

  const mobileLink = "block rounded-md px-3 py-3 text-base font-medium hover:bg-muted";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-2">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {user ? (
            <>
              <Button asChild className={navBtn}>
                <Link to="/create" className="inline-flex items-center gap-1.5">
                  <Plus className="h-4 w-4" />Create video
                </Link>
              </Button>
              <Button variant="ghost" asChild className={navBtn}><Link to="/from-url">Article to video</Link></Button>
              <Button variant="ghost" asChild className={navBtn}><Link to="/dashboard">My videos</Link></Button>
              <Button variant="ghost" asChild className={navBtn}><Link to="/library">My Library</Link></Button>
              <Button variant="ghost" asChild className={navBtn}><Link to="/pricing">Pricing</Link></Button>
              <Button variant="ghost" asChild className={navBtn}><Link to="/billing">Billing</Link></Button>
              <Button variant="outline" asChild className={`${balancePill} ${low ? "border-primary/60 text-primary" : ""}`}>
                <Link to="/billing" aria-label="Credit balance">
                  <Coins className="h-4 w-4 text-primary" />
                  {acct ? acct.balance : "—"}<span className="font-medium text-muted-foreground">credits</span>
                </Link>
              </Button>
              <Button variant="outline" className={navBtn} onClick={doSignOut}>Sign out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className={navBtn}><Link to="/pricing">Pricing</Link></Button>
              <Button variant="ghost" asChild className={navBtn}><Link to="/billing">Billing</Link></Button>
              <Button variant="ghost" asChild className={navBtn}><Link to="/auth">Sign in</Link></Button>
              <Button asChild className={navBtn}><Link to="/auth?mode=signup">Start free</Link></Button>
            </>
          )}
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
      {open && (
        <>
          <div className="fixed inset-0 top-16 z-30 bg-background/60 md:hidden" onClick={close} />
          <nav className="absolute inset-x-0 top-16 z-40 border-b border-border bg-background p-3 shadow-lg md:hidden">
            {user ? (
              <>
                <Link to="/create" onClick={close} className="mb-2 flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-3 font-semibold text-primary-foreground">
                  <Plus className="h-4 w-4" />Create video
                </Link>
                <Link to="/from-url" onClick={close} className={mobileLink}>Article to video</Link>
                <Link to="/dashboard" onClick={close} className={mobileLink}>My videos</Link>
                <Link to="/library" onClick={close} className={mobileLink}>My Library</Link>
                <Link to="/pricing" onClick={close} className={mobileLink}>Pricing</Link>
                <Link to="/billing" onClick={close} className={`${balancePill} mb-2 w-full justify-center ${low ? "border-primary/60 text-primary" : ""}`}>
                  <Coins className="h-4 w-4 text-primary" />
                  {acct ? acct.balance : "—"}<span className="font-medium text-muted-foreground">credits</span>
                </Link>
                <Link to="/billing" onClick={close} className={mobileLink}>Billing</Link>
                <button onClick={doSignOut} className={`${mobileLink} flex w-full items-center gap-2 text-left text-muted-foreground`}>
                  <LogOut className="h-4 w-4" />Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/pricing" onClick={close} className={mobileLink}>Pricing</Link>
                <Link to="/billing" onClick={close} className={mobileLink}>Billing</Link>
                <Link to="/auth" onClick={close} className={mobileLink}>Sign in</Link>
                <Link to="/auth?mode=signup" onClick={close} className="mt-2 block rounded-md bg-primary px-3 py-3 text-center font-semibold text-primary-foreground">Start free</Link>
              </>
            )}
          </nav>
        </>
      )}
    </header>
  );
}
