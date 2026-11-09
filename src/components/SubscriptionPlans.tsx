import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount, STARTER_CREDITS } from "@/lib/account";
import { FREE_VOICES, FREE_MAX_SECONDS, FREE_MAX_SCENES } from "@/lib/tiers";

const FREE_MINUTES = FREE_MAX_SECONDS / 60;

const PLANS = [
  {
    name: "Free",
    price: "£0",
    credits: `${STARTER_CREDITS} starter credits once`,
    perks: [
      `${FREE_VOICES.length} narrators`,
      `Videos up to ${FREE_MINUTES} min · ${FREE_MAX_SCENES} scenes`,
      "720p HD · music, SFX & captions free",
      '“Made with Vydora” badge on downloads',
    ],
  },
  { name: "Creator", price: "£19", credits: "600 credits / month", perks: ["All narrators unlocked", "Videos up to 60 minutes", "No watermark", "1080p Full HD"] },
  { name: "Pro", price: "£49", credits: "2,000 credits / month", perks: ["Everything in Creator", "3× more credits", "Best for daily uploads"], featured: true },
];

export default function SubscriptionPlans() {
  const { data: acct } = useAccount();
  const paid = acct && !acct.watermark;
  return (
    <section id="subscriptions" className="mt-10 scroll-mt-24 border-t border-border pt-8">
      <h2 className="flex items-center gap-2 text-2xl font-bold"><Crown className="h-6 w-6 text-primary" />Subscriptions</h2>
      <p className="mt-2 text-sm text-muted-foreground">Current plan: <span className="font-semibold text-foreground">{paid ? "Paid" : "Free"}</span>. Subscribing will open once payments are connected.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((p) => (
          <div key={p.name} className={`rounded-xl border bg-card p-6 ${p.featured ? "border-primary" : "border-border"}`}>
            <p className="font-semibold text-muted-foreground">{p.name}</p>
            <p className="mt-2 font-display text-3xl font-extrabold">{p.price}<span className="text-base font-semibold text-muted-foreground">{p.name === "Free" ? "" : "/mo"}</span></p>
            <p className="mt-1 font-semibold text-primary">{p.credits}</p>
            <ul className="mt-4 grid gap-2 text-sm">
              {p.perks.map((k) => <li key={k} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{k}</li>)}
            </ul>
            {p.name === "Free" ? (
              <Button className="mt-5 w-full" variant="outline" disabled>{paid ? "Free tier" : "Current plan"}</Button>
            ) : (
              <Button className="mt-5 w-full" variant={p.featured ? "default" : "outline"} disabled>Subscribe — coming soon</Button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
