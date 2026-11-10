import { useEffect, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import {
  CARD_MAX_SECS,
  CARD_MIN_SECS,
  fetchCards,
  loadCards,
  storeCard,
  type BrandCard,
  type BrandCards,
} from "@/lib/brandCards";

type Clip = { name: string; path: string; url?: string };

type Props = { clips: Clip[]; onUpload?: (f: File) => Promise<string | null> };

export default function BrandCardsSettings({ clips, onUpload }: Props) {
  const { user } = useAuth();
  const [cards, setCards] = useState<BrandCards>(() => loadCards(user?.id));
  const [busy, setBusy] = useState<keyof BrandCards | null>(null);
  const [saving, setSaving] = useState<keyof BrandCards | null>(null);
  const introIn = useRef<HTMLInputElement>(null);
  const outroIn = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let on = true;
    fetchCards(user?.id).then((c) => on && setCards(c));
    return () => { on = false; };
  }, [user?.id]);

  const set = (k: keyof BrandCards, patch: Partial<BrandCard>) =>
    setCards((c) => ({ ...c, [k]: { ...c[k], ...patch } }));

  const pick = async (k: keyof BrandCards, f?: File) => {
    if (!f || !onUpload) return;
    if (!f.type.startsWith("video/")) { toast.error("Please choose a video file (MP4 or WebM)"); return; }
    setBusy(k);
    const path = await onUpload(f);
    setBusy(null);
    if (path) {
      set(k, { mode: "clip", clipPath: path, enabled: true });
      toast.success(`${k === "intro" ? "Intro" : "Outro"} clip uploaded — press Save to keep it`);
    }
  };

  const save = async (k: keyof BrandCards) => {
    if (!user) return;
    setSaving(k);
    try {
      await storeCard(user.id, k, cards[k]);
      toast.success(`${k === "intro" ? "Intro" : "Outro"} saved to your account — it'll attach to every export`);
    } catch {
      toast.error(`Couldn't save your ${k}. Please try again.`);
    } finally {
      setSaving(null);
    }
  };

  const editor = (k: keyof BrandCards, label: string, blurb: string) => {
    const c = cards[k];
    return (
      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold">{label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            Attach to every export
            <Switch checked={c.enabled} onCheckedChange={(v) => set(k, { enabled: v })} />
          </label>
        </div>

        <div className="mt-4 space-y-3">
          <Select value={c.mode} onValueChange={(v) => set(k, { mode: v as BrandCard["mode"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="card">Branded title card</SelectItem>
              <SelectItem value="clip">Clip from my library</SelectItem>
            </SelectContent>
          </Select>

          {c.mode === "card" ? (
            <>
              <div><Label>Headline</Label><Input value={c.title} maxLength={60} onChange={(e) => set(k, { title: e.target.value })} /></div>
              <div><Label>Call to action</Label><Input value={c.subtitle} maxLength={80} onChange={(e) => set(k, { subtitle: e.target.value })} /></div>
              <div><Label>Length (seconds)</Label><Input type="number" min={CARD_MIN_SECS} max={CARD_MAX_SECS} value={c.seconds} onChange={(e) => set(k, { seconds: Number(e.target.value) })} /></div>
            </>
          ) : (
            <div className="space-y-3">
              <input
                ref={k === "intro" ? introIn : outroIn}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => { pick(k, e.target.files?.[0]); e.target.value = ""; }}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={busy === k}
                onClick={() => (k === "intro" ? introIn : outroIn).current?.click()}
              >
                {busy === k ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload {label.toLowerCase()} video
              </Button>
              {clips.length > 0 && (
                <Select value={c.clipPath ?? ""} onValueChange={(v) => set(k, { clipPath: v })}>
                  <SelectTrigger><SelectValue placeholder="…or choose one already in your library" /></SelectTrigger>
                  <SelectContent>{clips.map((f) => <SelectItem key={f.path} value={f.path}>{f.name}</SelectItem>)}</SelectContent>
                </Select>
              )}
              {(() => {
                const sel = clips.find((f) => f.path === c.clipPath);
                return sel?.url
                  ? <div><p className="mb-1 text-xs text-muted-foreground">Current {label.toLowerCase()}: {sel.name}</p><video src={sel.url} controls preload="metadata" className="aspect-video w-full rounded-md bg-muted object-contain" /></div>
                  : <p className="text-xs text-muted-foreground">No {label.toLowerCase()} video chosen yet.</p>;
              })()}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={() => save(k)} disabled={saving === k}>
            {saving === k ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save {label.toLowerCase()}
          </Button>
        </div>
      </section>
    );
  };

  return (
    <>
      {editor("intro", "Intro card", "Plays before your first scene in every video you download.")}
      {editor("outro", "Outro card", "Plays after your last scene in every video you download.")}
    </>
  );
}
