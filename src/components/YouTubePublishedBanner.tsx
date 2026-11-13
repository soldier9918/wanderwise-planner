import { useQuery } from "@tanstack/react-query";
import { Youtube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

/** Persistent badge for a project's latest successful YouTube upload. */
export default function YouTubePublishedBanner({ videoId }: { videoId: string }) {
  const { data } = useQuery({
    queryKey: ["youtube-upload", videoId],
    queryFn: async () => {
      const { data } = await supabase.from("youtube_uploads").select("youtube_video_id, privacy, created_at")
        .eq("video_id", videoId).eq("status", "uploaded").not("youtube_video_id", "is", null)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
  });
  if (!data?.youtube_video_id) return null;
  const yt = data.youtube_video_id;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm">
      <span className="inline-flex items-center gap-1.5 font-semibold text-primary"><Youtube className="h-4 w-4" />Published</span>
      <span className="text-muted-foreground">{new Date(data.created_at).toLocaleDateString()} · {data.privacy}</span>
      <div className="ml-auto flex flex-wrap gap-2">
        <Button asChild size="sm"><a href={`https://youtu.be/${yt}`} target="_blank" rel="noreferrer">Watch on YouTube</a></Button>
        <Button asChild size="sm" variant="outline"><a href={`https://studio.youtube.com/video/${yt}/edit`} target="_blank" rel="noreferrer">Open in Studio</a></Button>
      </div>
    </div>
  );
}
