import { Gift, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { REFERRAL_BONUS, useAccount } from "@/lib/account";

export default function InviteEarn() {
  const { data } = useAccount();
  if (!data?.code) return null;
  const link = `${window.location.origin}/auth?mode=signup&ref=${data.code}`;
  const earned = data.ledger.filter((l) => l.reason === "referral_invite").length;
  const msg = encodeURIComponent(`Make faceless YouTube videos with AI on Vydora — we both get ${REFERRAL_BONUS} free credits: ${link}`);
  return (
    <section id="invite" className="mt-10 scroll-mt-24 border-t border-border pt-8">
      <h2 className="flex items-center gap-2 text-2xl font-bold"><Gift className="h-6 w-6 text-primary" />Invite & earn</h2>
      <p className="mt-2 text-sm text-muted-foreground">Give {REFERRAL_BONUS} credits, get {REFERRAL_BONUS} credits. When a friend signs up with your link, you both get {REFERRAL_BONUS} credits.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <input readOnly value={link} aria-label="Your invite link" className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm" />
        <Button onClick={() => { navigator.clipboard.writeText(link); toast.success("Invite link copied"); }}><Copy className="h-4 w-4" />Copy</Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <Button variant="outline" size="sm" asChild><a href={`https://twitter.com/intent/tweet?text=${msg}`} target="_blank" rel="noreferrer">X / Twitter</a></Button>
        <Button variant="outline" size="sm" asChild><a href={`https://wa.me/?text=${msg}`} target="_blank" rel="noreferrer">WhatsApp</a></Button>
        <Button variant="outline" size="sm" asChild><a href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${msg}`} target="_blank" rel="noreferrer">Telegram</a></Button>
      </div>
      <p className="mt-3 text-sm">Your code <span className="font-mono font-semibold text-primary">{data.code}</span> · {earned} friend{earned === 1 ? "" : "s"} joined · +{earned * REFERRAL_BONUS} credits earned</p>
    </section>
  );
}
