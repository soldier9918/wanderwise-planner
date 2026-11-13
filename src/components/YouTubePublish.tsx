import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Status = { configured: boolean; connection: { channel_id: string; channel_title: string; channel_thumbnail: string | null } | null };

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session && (session.expires_at ?? 0) * 1000 < Date.now() + 60_000) await supabase.auth.refreshSession().catch(() => {});
  const { data, error } = await supabase.functions.invoke("youtube", { body });
  if (error) {
    let msg = error.message;
    try { const j = await (error as { context?: Response }).context?.json(); if (j?.error) msg = j.error; } catch { /* ignore */ }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export async function youtubeStatus(): Promise<Status> {
  // Wait for the signed-in session; never let a status check crash the page.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { configured: true, connection: null };
  try { return await call<Status>({ action: "status" }); }
  catch { return { configured: true, connection: null }; }
}

export async function connectYouTube() {
  const { url } = await call<{ url: string }>({ action: "auth_url", returnTo: window.location.href.split("?")[0] });
  window.location.href = url;
}

/** Builds publish defaults from the video's saved SEO pack only (no regeneration). Hashtags are appended to the description if missing. */
export function youtubeDefaults(seo: { titles?: string[]; description?: string; hashtags?: string[]; tags?: string[] } | null, fallbackTitle?: string | null) {
  const body = (seo?.description ?? "").trim();
  const missing = (seo?.hashtags ?? []).filter((h) => h && !body.toLowerCase().includes(h.toLowerCase()));
  const description = [body, missing.join(" ")].filter(Boolean).join("\n\n");
  return { title: seo?.titles?.[0] ?? fallbackTitle ?? "", description, tags: (seo?.tags ?? []).join(", ") };
}

export default function YouTubePublish({ videoId, title, description, tags, hasExport, disabled, onSeoRequested }: {
  videoId: string; title: string; description: string; tags: string; hasExport: boolean; disabled?: boolean; onSeoRequested?: () => void;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [askSeo, setAskSeo] = useState(false);
  const { data: status } = useQuery({ queryKey: ["youtube-status"], queryFn: youtubeStatus, staleTime: 60_000, retry: false });
  const [form, setForm] = useState({ title, description, tags, privacy: "private", synthetic: true, kids: false });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ url: string; studioUrl: string } | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const yt = p.get("youtube");
    if (!yt) return;
    const msgs: Record<string, string> = { connected: "YouTube channel connected.", cancelled: "YouTube connection cancelled.", nochannel: "That Google account has no YouTube channel.", expired: "That took too long — please connect again.", error: "Couldn't connect YouTube. Please try again." };
    (yt === "connected" ? toast.success : toast.error)(msgs[yt] ?? msgs.error);
    p.delete("youtube");
    window.history.replaceState(null, "", `${window.location.pathname}${p.toString() ? `?${p}` : ""}`);
    qc.invalidateQueries({ queryKey: ["youtube-status"] });
    if (yt === "connected") setOpen(true);
  }, [qc]);

  // Fill from saved SEO once per video; never overwrite what the user typed.
  const filledFor = useRef<string | null>(null);
  const edited = useRef({ title: false, description: false, tags: false });
  useEffect(() => {
    if (filledFor.current !== videoId) { filledFor.current = videoId; edited.current = { title: false, description: false, tags: false }; setForm((f) => ({ ...f, title, description, tags })); }
  }, [videoId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (filledFor.current === videoId) setForm((f) => ({ ...f, title: edited.current.title ? f.title : title, description: edited.current.description ? f.description : description, tags: edited.current.tags ? f.tags : tags })); }, [title, description, tags, videoId]);
  useEffect(() => { if (open) setResult(null); }, [open]);
  // Opened from My Videos with ?publish=1: start the same flow as clicking the button.
  const autoOpened = useRef(false);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (autoOpened.current || p.get("publish") !== "1") return;
    autoOpened.current = true;
    p.delete("publish");
    window.history.replaceState(null, "", `${window.location.pathname}${p.toString() ? `?${p}` : ""}`);
    if (disabled) { toast.error("This video is over your plan's length limit. Fix it below, then publish."); return; }
    if (description.trim()) setOpen(true); else setAskSeo(true);
  }, [disabled, description]);

  const publish = async () => {
    setBusy(true);
    try {
      const r = await call<{ url: string; studioUrl: string }>({ action: "publish", videoId, title: form.title, description: form.description, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean), privacy: form.privacy, synthetic: form.synthetic, madeForKids: form.kids });
      setResult(r);
      toast.success("Published to YouTube!");
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  const disconnect = async () => {
    await call({ action: "disconnect" }).catch((e) => toast.error((e as Error).message));
    qc.invalidateQueries({ queryKey: ["youtube-status"] });
  };

  const conn = status?.connection;
  return (
    <>
      <Button variant="outline" disabled={disabled} onClick={() => (description.trim() ? setOpen(true) : setAskSeo(true))}>▶ Publish to YouTube</Button>
      <AlertDialog open={askSeo} onOpenChange={setAskSeo}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No SEO details yet</AlertDialogTitle>
            <AlertDialogDescription>Do you want to generate SEO description, tags and Title for your video before proceeding?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setAskSeo(false); setOpen(true); }}>No</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setAskSeo(false); onSeoRequested?.(); }}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Publish to YouTube</DialogTitle>
            <DialogDescription>Send your finished video straight to your own channel.</DialogDescription>
          </DialogHeader>
          {status && !status.configured ? (
            <p className="text-sm text-muted-foreground">YouTube publishing is coming soon.</p>
          ) : !conn ? (
            <div className="grid gap-3">
              <p className="text-sm text-muted-foreground">Connect your YouTube channel once. Vydora can only upload videos you choose to publish — it can't delete or change anything else.</p>
              <Button onClick={() => connectYouTube().catch((e) => toast.error((e as Error).message))}>Connect YouTube channel</Button>
            </div>
          ) : result ? (
            <div className="grid gap-3 text-sm">
              <p>Your video is on YouTube. It may take a few minutes to finish processing.</p>
              <div className="flex flex-wrap gap-2">
                <Button asChild><a href={result.url} target="_blank" rel="noreferrer">Watch on YouTube</a></Button>
                <Button asChild variant="outline"><a href={result.studioUrl} target="_blank" rel="noreferrer">Open in YouTube Studio</a></Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 text-sm">
                  {conn.channel_thumbnail && <img src={conn.channel_thumbnail} alt="" className="h-8 w-8 rounded-full" />}
                  <span className="font-semibold">{conn.channel_title}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={disconnect}>Disconnect</Button>
              </div>
              {!hasExport && <p role="alert" className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm">Download the video first — we publish your latest download.</p>}
              <label className="grid gap-1 text-xs font-semibold text-muted-foreground">Title
                <Input maxLength={100} value={form.title} onChange={(e) => { edited.current.title = true; setForm({ ...form, title: e.target.value }); }} />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-muted-foreground">Description
                <Textarea rows={5} maxLength={5000} value={form.description} onChange={(e) => { edited.current.description = true; setForm({ ...form, description: e.target.value }); }} />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-muted-foreground">Tags (comma separated)
                <Input value={form.tags} onChange={(e) => { edited.current.tags = true; setForm({ ...form, tags: e.target.value }); }} />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-muted-foreground">Visibility
                <select value={form.privacy} onChange={(e) => setForm({ ...form, privacy: e.target.value })} className="h-10 rounded-md border border-input bg-background px-2 text-sm text-foreground">
                  <option value="private">Private (only you)</option>
                  <option value="unlisted">Unlisted (anyone with the link)</option>
                  <option value="public">Public</option>
                </select>
              </label>
              <label className="flex items-start gap-2 text-sm"><Checkbox checked={form.synthetic} onCheckedChange={(v) => setForm({ ...form, synthetic: v === true })} /> <span>Mark as altered or synthetic content (YouTube's AI disclosure)</span></label>
              <label className="flex items-start gap-2 text-sm"><Checkbox checked={form.kids} onCheckedChange={(v) => setForm({ ...form, kids: v === true })} /> <span>Made for kids</span></label>
              <Button onClick={publish} disabled={busy || !hasExport || !form.title.trim()}>{busy ? "Uploading to YouTube…" : "Publish"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
