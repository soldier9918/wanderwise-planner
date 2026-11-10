import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { CARD_MAX_SECS, CARD_MIN_SECS, loadCards, fetchCards, storeCards, type BrandCard, type BrandCards } from "@/lib/brandCards";

export default function BrandCardsSettings({ clips }: { clips: { name: string; path: string }[] }) {
  const { user } = useAuth();
  const [cards, setCards] = useState<BrandCards>(() => loadCards(user?.id));
  useEffect(() => { let on = true; fetchCards(user?.id).then((c) => on && setCards(c)); return () => { on = false; }; }, [user?.id]);
  const set = (k: keyof BrandCards, patch: Partial<BrandCard>) => setCards((c) => ({ ...c, [k]: { ...c[k], ...patch } }));
  const save = async () => { if (!user) return; try { await storeCards(user.id, cards); toast.success("Intro & outro saved to your account — they'll attach to every export"); } catch { toast.error("Couldn't save to your account. Please try again."); } };

  const editor = (k: keyof BrandCards, label: string) => {
    const c = cards[k];
    return (
      <div className="space-y-3 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between"><p className="font-semibold">{label}</p>
          <label className="flex items-center gap-2 text-sm">Attach to every export<Switch checked={c.enabled} onCheckedChange={(v) => set(k, { enabled: v })} /></label></div>
        <Select value={c.mode} onValueChange={(v) => set(k, { mode: v as BrandCard["mode"] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="card">Branded title card</SelectItem><SelectItem value="clip">Clip from my library</SelectItem></SelectContent>
        </Select>
        {c.mode === "card" ? (
          <>
            <div><Label>Headline</Label><Input value={c.title} maxLength={60} onChange={(e) => set(k, { title: e.target.value })} /></div>
            <div><Label>Call to action</Label><Input value={c.subtitle} maxLength={80} onChange={(e) => set(k, { subtitle: e.target.value })} /></div>
            <div><Label>Length (seconds)</Label><Input type="number" min={CARD_MIN_SECS} max={CARD_MAX_SECS} value={c.seconds} onChange={(e) => set(k, { seconds: Number(e.target.value) })} /></div>
          </>
        ) : clips.length ? (
          <Select value={c.clipPath ?? ""} onValueChange={(v) => set(k, { clipPath: v })}>
            <SelectTrigger><SelectValue placeholder="Choose a video clip" /></SelectTrigger>
            <SelectContent>{clips.map((f) => <SelectItem key={f.path} value={f.path}>{f.name}</SelectItem>)}</SelectContent>
          </Select>
        ) : <p className="text-sm text-muted-foreground">Upload a video clip to your library first.</p>}
      </div>
    );
  };

  return (
    <section className="mt-8 rounded-xl border border-border bg-card p-5">
      <h2 className="text-xl font-extrabold">Intro & outro cards</h2>
      <p className="mt-1 text-sm text-muted-foreground">Save a subscribe or call-to-action bumper once and it's added to the start or end of every video you download.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{editor("intro", "Intro")}{editor("outro", "Outro")}</div>
      <div className="mt-4 flex justify-end"><Button onClick={save}>Save cards</Button></div>
    </section>
  );
}
