import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Download, ImagePlus, Plus, Search, Trash2, Youtube } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { generateThumbnail, signedUrls } from "@/lib/videoApi";
import { CREDIT_COSTS } from "@/lib/credits";
import { estimateCredits } from "@/lib/credits";
import { duplicateVideo, useAccount, isReadOnlyAccount } from "@/lib/account";

type Kind = "normal" | "article" | "series";
const GROUPS: { kind: Kind; label: string }[] = [
  { kind: "normal", label: "Videos" },
  { kind: "article", label: "Article to video" },
  { kind: "series", label: "Series" },
];
// Series episodes are titled "<Series> [Part n/N]: ..." by the Series page; articles keep their link.
function videoKind(v: { title: string; source_url?: string | null }): Kind {
  if (/\[Part \d+\/\d+\]/.test(v.title)) return "series";
  if (v.source_url) return "article";
  return "normal";
}

export default function MyVideos() {
  const [thumbBusy, setThumbBusy] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Kind | "all">("all");
  const [q, setQ] = useState("");
  const [toDelete, setToDelete] = useState<{ id: string; title: string } | null>(null);
  const removeVideo = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("videos").delete().eq("id", toDelete.id);
    if (error) toast.error(error.message); else { toast.success("Video deleted"); queryClient.invalidateQueries({ queryKey: ["videos"] }); }
    setToDelete(null);
  };
  const { data: published } = useQuery({
    queryKey: ["youtube-uploads-list"],
    queryFn: async () => {
      const { data } = await supabase.from("youtube_uploads").select("video_id, youtube_video_id, status").not("youtube_video_id", "is", null);
      const m: Record<string, string> = {};
      (data ?? []).forEach((u) => { if (u.youtube_video_id) m[u.video_id] = u.youtube_video_id; });
      return m;
    },
  });
  const [dupBusy, setDupBusy] = useState<string | null>(null);
  const { data: account } = useAccount();
  const readOnly = isReadOnlyAccount(account);
  const duplicate = async (videoId: string) => {
    setDupBusy(videoId);
    try { const nid = await duplicateVideo(videoId); toast.success("Copy ready"); navigate(`/video/${nid}`); }
    catch (err) { toast.error((err as Error).message); }
    finally { setDupBusy(null); }
  };

  const makeThumbnail = async (videoId: string) => {
    setThumbBusy(videoId);
    try {
      await generateThumbnail(videoId);
      await queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.success("Thumbnail ready!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setThumbBusy(null);
    }
  };

  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("id, title, topic, style, aspect_ratio, thumbnail_path, created_at, sources, seo, quality, source_url")
        .order("created_at", { ascending: false });
      if (error) throw error;
      type VideoRow = (typeof data)[number] & { thumb: string | null; credits: number };
      if (!data.length) return [] as VideoRow[];

      // Fetch each video's scene 1 image and sign URLs for thumbnails.
      const { data: allScenes } = await supabase
        .from("video_scenes")
        .select("video_id, image_path, clip_path, clip_credit, position")
        .in("video_id", data.map((v) => v.id));
      const firstScenes = (allScenes ?? []).filter((s) => s.position === 0);
      const creditsFor = (v: (typeof data)[number]) => {
        const mine = (allScenes ?? []).filter((s) => s.video_id === v.id);
        return estimateCredits({
          scenes: mine.length,
          useFacts: Array.isArray(v.sources) && v.sources.length > 0,
          animated: mine.filter((s) => s.clip_path && !s.clip_credit).length,
          thumbnail: !!v.thumbnail_path,
          seo: !!v.seo,
          quality: v.quality,
        });
      };
      const paths = [
        ...firstScenes.map((s) => s.image_path),
        ...data.map((v) => v.thumbnail_path),
      ].filter((p): p is string => !!p);
      const urls = await signedUrls(paths);
      const thumbByVideo: Record<string, string> = {};
      firstScenes.forEach((s) => {
        if (s.image_path && urls[s.image_path]) thumbByVideo[s.video_id] = urls[s.image_path];
      });
      // A generated thumbnail wins over the scene 1 image.
      data.forEach((v) => {
        if (v.thumbnail_path && urls[v.thumbnail_path]) thumbByVideo[v.id] = urls[v.thumbnail_path];
      });
      return data.map((v): VideoRow => ({ ...v, thumb: thumbByVideo[v.id] ?? null, credits: creditsFor(v) }));
    },
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container max-w-7xl py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-4xl font-extrabold">My videos</h1>
            <p className="mt-2 text-muted-foreground">Everything you have made with Vydora. Open one to edit, export or remix it.</p>
          </div>
          <Button asChild className="shrink-0">
            <Link to="/create" className="inline-flex items-center gap-1.5"><Plus className="h-4 w-4" />Create video</Link>
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or prompt…" className="pl-8" />
          </div>
          {([["all", "All"], ...GROUPS.map((g) => [g.kind, g.label])] as [Kind | "all", string][]).map(([k, l]) => (
            <Button key={k} size="sm" variant={filter === k ? "default" : "outline"} onClick={() => setFilter(k)}>{l}</Button>
          ))}
        </div>

        <div className="mt-4">
          {isLoading && <p className="text-muted-foreground">Loading…</p>}
          {videos?.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <p className="text-muted-foreground">No videos yet — your finished projects will appear here.</p>
              <Button className="mt-4" asChild><Link to="/create">Create your first video</Link></Button>
            </div>
          )}
          {videos && videos.length > 0 && (() => {
            const term = q.trim().toLowerCase();
            const list = videos.filter((v) => (filter === "all" || videoKind(v) === filter) && (!term || v.title.toLowerCase().includes(term) || (v.topic ?? "").toLowerCase().includes(term)));
            return (
              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full min-w-[1000px] text-sm">
                  <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Output</th>
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Category</th>
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 font-medium">Query</th>
                      <th className="px-3 py-2 font-medium">Credits</th>
                      <th className="px-3 py-2 font-medium">YouTube</th>
                      <th className="px-3 py-2 font-medium">Created</th>
                      <th className="px-3 py-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.length === 0 && <tr><td colSpan={9} className="px-3 py-6 text-center text-muted-foreground">No videos match.</td></tr>}
                    {list.map((v) => {
                      const kind = videoKind(v);
                      const typeLabel = kind === "series" ? (v.title.match(/\[Part \d+\/\d+\]/)?.[0].slice(1, -1) ?? "Series")
                        : v.aspect_ratio === "9:16" ? "9:16 Short" : "16:9 Video";
                      const yt = published?.[v.id];
                      return (
                        <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                          <td className="px-3 py-2">
                            <Link to={`/video/${v.id}`}>
                              {v.thumb ? <img src={v.thumb} alt="" className="h-9 w-16 rounded object-cover" />
                                : <div className="flex h-9 w-16 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">No image</div>}
                            </Link>
                          </td>
                          <td className="max-w-[220px] px-3 py-2"><Link to={`/video/${v.id}`} className="line-clamp-2 font-semibold hover:text-primary">{v.title}</Link></td>
                          <td className="px-3 py-2"><span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${kind === "series" ? "bg-primary/15 text-primary" : kind === "article" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>{kind === "series" ? "Series" : kind === "article" ? "Article to video" : "Standard video"}</span></td>
                          <td className="px-3 py-2"><span className="whitespace-nowrap rounded-full border border-border px-2 py-0.5 text-xs">{typeLabel}</span></td>
                          <td className="max-w-[240px] px-3 py-2 text-muted-foreground"><span className="line-clamp-2" title={v.topic ?? ""}>{v.topic}</span></td>
                          <td className="whitespace-nowrap px-3 py-2 font-semibold text-primary">⚡ ~{v.credits}</td>
                          <td className="px-3 py-2">
                            {yt ? <><a href={`https://youtu.be/${yt}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary"><Youtube className="h-3.5 w-3.5" />Watch</a>
                              {" "}<a href={`https://studio.youtube.com/video/${yt}/edit`} target="_blank" rel="noreferrer" className="whitespace-nowrap text-xs text-muted-foreground underline hover:text-primary">Studio</a></>
                              : <Link to={`/video/${v.id}?publish=1`} className="whitespace-nowrap text-xs text-muted-foreground hover:text-primary">Not published · <span className="underline">Publish</span></Link>}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</td>
                          <td className="px-3 py-2">
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8" title={`${v.thumbnail_path ? "Regenerate" : "Generate"} thumbnail · ${CREDIT_COSTS.thumbnail} cr`} disabled={thumbBusy === v.id} onClick={() => makeThumbnail(v.id)}><ImagePlus className="h-4 w-4" /></Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" title="Download (opens the editor to export)" asChild><Link to={`/video/${v.id}`}><Download className="h-4 w-4" /></Link></Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" title="Publish to YouTube" asChild><Link to={`/video/${v.id}?publish=1`}><Youtube className="h-4 w-4" /></Link></Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" title="Duplicate" disabled={dupBusy === v.id || readOnly} onClick={() => duplicate(v.id)}><Copy className="h-4 w-4" /></Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" title="Delete" onClick={() => setToDelete({ id: v.id, title: v.title })}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
        <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this video?</AlertDialogTitle>
              <AlertDialogDescription>"{toDelete?.title}" will be removed from My videos. This can't be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={removeVideo}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
