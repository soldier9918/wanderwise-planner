import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, ImagePlus, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { generateThumbnail, signedUrls } from "@/lib/videoApi";
import { estimateCredits } from "@/lib/credits";
import { duplicateVideo } from "@/lib/account";

export default function MyVideos() {
  const [thumbBusy, setThumbBusy] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [dupBusy, setDupBusy] = useState<string | null>(null);
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
        .select("id, title, topic, style, aspect_ratio, thumbnail_path, created_at, sources, seo, quality")
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
      <main className="container max-w-5xl py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-4xl font-extrabold">My videos</h1>
            <p className="mt-2 text-muted-foreground">Everything you have made with Vydora. Open one to edit, export or remix it.</p>
          </div>
          <Button asChild className="shrink-0">
            <Link to="/create" className="inline-flex items-center gap-1.5"><Plus className="h-4 w-4" />Create video</Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-3">
          {isLoading && <p className="text-muted-foreground">Loading…</p>}
          {videos?.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <p className="text-muted-foreground">No videos yet — your finished projects will appear here.</p>
              <Button className="mt-4" asChild><Link to="/create">Create your first video</Link></Button>
            </div>
          )}
          {videos?.map((v) => (
            <Link key={v.id} to={`/video/${v.id}`} className="group flex gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary">
              {v.thumb ? (
                <img src={v.thumb} alt="" className="h-20 w-32 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">No image</div>
              )}
              <div className="min-w-0">
                <p className="font-semibold group-hover:text-primary">{v.title}</p>
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{v.topic}</p>
                <p className="mt-2 text-xs text-muted-foreground">{v.style} · {v.aspect_ratio ?? "16:9"} · {new Date(v.created_at).toLocaleDateString()} · <span className="font-semibold text-primary">⚡ ~{v.credits} credits</span></p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  disabled={thumbBusy === v.id}
                  onClick={(e) => { e.preventDefault(); makeThumbnail(v.id); }}
                >
                  <ImagePlus className="h-4 w-4" />
                  {thumbBusy === v.id ? "Creating…" : v.thumbnail_path ? "Regenerate thumbnail" : "Generate thumbnail"}
                </Button>
                <Button type="button" variant="outline" size="sm" className="ml-2 mt-3" disabled={dupBusy === v.id}
                  onClick={(e) => { e.preventDefault(); duplicate(v.id); }}>
                  <Copy className="h-4 w-4" />{dupBusy === v.id ? "Duplicating…" : "Duplicate"}
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
