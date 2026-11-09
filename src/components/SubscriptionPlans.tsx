import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/lib/account";

const PLANS = [
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
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {PLANS.map((p) => (
          <div key={p.name} className={`rounded-xl border bg-card p-6 ${p.featured ? "border-primary" : "border-border"}`}>
            <p className="font-semibold text-muted-foreground">{p.name}</p>
            <p className="mt-2 font-display text-3xl font-extrabold">{p.price}<span className="text-base font-semibold text-muted-foreground">/mo</span></p>
            <p className="mt-1 font-semibold text-primary">{p.credits}</p>
            <ul className="mt-4 grid gap-2 text-sm">
              {p.perks.map((k) => <li key={k} className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" />{k}</li>)}
            </ul>
            <Button className="mt-5 w-full" variant={p.featured ? "default" : "outline"} disabled>Subscribe — coming soon</Button>
          </div>
        ))}
      </div>
    </section>
  );
}
