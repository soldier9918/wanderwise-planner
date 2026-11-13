import { useEffect, useRef, useState } from "react";
import { Loader2, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { voiceSample } from "@/lib/videoApi";

const cache = new Map<string, string>();

/** Plays a short free sample of the chosen narrator (and accent). */
export function VoiceSampleButton({ voice, accent, className }: { voice: string; accent?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const audio = useRef<HTMLAudioElement | null>(null);
  const stop = () => { audio.current?.pause(); audio.current = null; setState("idle"); };
  useEffect(() => stop, [voice, accent]);

  const play = async () => {
    if (state !== "idle") return stop();
    const key = `${voice}_${accent ?? "none"}`;
    try {
      setState("loading");
      let url = cache.get(key);
      if (!url) { url = (await voiceSample(voice, accent)).url; cache.set(key, url); }
      const a = new Audio(url);
      audio.current = a;
      a.onended = () => setState("idle");
      await a.play();
      setState("playing");
    } catch (e) {
      setState("idle");
      toast.error(e instanceof Error ? e.message : "Couldn't play the preview.");
    }
  };

  return (
    <Button type="button" size="sm" variant="outline" className={className} onClick={play} title="Hear a free sample of this narrator">
      {state === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : state === "playing" ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      {state === "playing" ? "Stop" : "Listen"}
    </Button>
  );
}
