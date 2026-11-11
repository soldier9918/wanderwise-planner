import { useState } from "react";
import { toast } from "sonner";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { searchStock, applyStock, type StockClip } from "@/lib/videoApi";

export default function StockFootagePicker({ sceneId, sceneNo, defaultQuery, orientation, disabled, onDone }: {
  sceneId: string; sceneNo: number; defaultQuery: string; orientation: string; disabled?: boolean; onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(defaultQuery);
  const [results, setResults] = useState<StockClip[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [using, setUsing] = useState<number | null>(null);

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    try { setResults((await searchStock(q, orientation)).results); }
    catch (err) { toast.error((err as Error).message); }
    finally { setBusy(false); }
  };
  const pick = async (c: StockClip) => {
    setUsing(c.id);
    try {
      await applyStock(sceneId, c.id);
      toast.success(`Scene ${sceneNo} now uses stock footage by ${c.author}.`);
      setOpen(false);
      onDone();
    } catch (err) { toast.error((err as Error).message); }
    finally { setUsing(null); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o && !results && q.trim().length > 1) search(); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled title="Coming soon"><Film className="h-4 w-4" />Stock footage · Coming soon</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Stock footage for scene {sceneNo}</DialogTitle>
          <DialogDescription>Free, royalty-free real-world clips from Pixabay. The clip plays behind this scene's narration.</DialogDescription>
        </DialogHeader>
        <form onSubmit={search} className="flex gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. ocean waves at sunset" aria-label="Search stock footage" />
          <Button type="submit" disabled={busy || q.trim().length < 2}>{busy ? "Searching…" : "Search"}</Button>
        </form>
        <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
          {results?.length === 0 && <p className="col-span-full py-8 text-center text-sm text-muted-foreground">No clips found — try simpler words.</p>}
          {results?.map((c) => (
            <button key={c.id} type="button" disabled={using !== null} onClick={() => pick(c)}
              className="group relative overflow-hidden rounded-lg border border-border text-left hover:border-primary disabled:opacity-60">
              <video src={c.preview} poster={c.thumb} muted loop playsInline preload="none" className="aspect-video w-full object-cover"
                onMouseEnter={(e) => e.currentTarget.play().catch(() => {})} onMouseLeave={(e) => e.currentTarget.pause()} />
              <span className="block truncate px-2 py-1 text-xs text-muted-foreground">{using === c.id ? "Adding…" : `${c.duration}s · ${c.author}`}</span>
            </button>
          ))}
        </div>
        <a href="https://pixabay.com" target="_blank" rel="noreferrer" className="text-xs text-muted-foreground underline">Videos provided by Pixabay</a>
      </DialogContent>
    </Dialog>
  );
}
