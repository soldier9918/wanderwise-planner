import { useEffect, useRef, useState } from "react";
import { Loader2, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { voiceSample } from "@/lib/videoApi";

const cache = new Map<string, string>();
let currentStop: (() => void) | null = null;

/** Plays a short free sample of the chosen narrator (and accent). */
export function VoiceSampleButton({ voice, accent, className, iconOnly = false }: { voice: string; accent?: string; className?: string; iconOnly?: boolean }) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const audio = useRef<HTMLAudioElement | null>(null);
  const stop = () => { audio.current?.pause(); audio.current = null; setState("idle"); if (currentStop === stop) currentStop = null; };
  useEffect(() => stop, [voice, accent]);

  const play = async () => {
    if (state !== "idle") return stop();
    const key = `${voice}_${accent ?? "none"}`;
    try {
      setState("loading");
      currentStop?.();
      currentStop = stop;
      let url = cache.get(key);
      if (!url) { url = (await voiceSample(voice, accent)).url; cache.set(key, url); }
      const a = new Audio(url);
      audio.current = a;
      a.onended = stop;
      await a.play();
      setState("playing");
    } catch (e) {
      stop();
      toast.error(e instanceof Error ? e.message : "Couldn't play the preview.");
    }
  };

  const icon = state === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : state === "playing" ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />;

  if (iconOnly) {
    return (
      <Button type="button" size="icon" variant="ghost" className={className} onClick={play} title="Hear a free sample of this narrator" aria-label={state === "playing" ? "Stop the sample" : "Hear a free sample of this narrator"}>
        {icon}
      </Button>
    );
  }

  return (
    <Button type="button" size="sm" variant="outline" className={className} onClick={play} title="Hear a free sample of this narrator">
      {icon}
      {state === "playing" ? "Stop" : "Listen"}
    </Button>
  );
}
