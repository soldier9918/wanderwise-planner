import { Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { VoiceSampleButton } from "@/components/VoiceSampleButton";
import { VOICES } from "@/lib/videoApi";
import { voiceAllowed } from "@/lib/tiers";

/** Lets users hear a free sample of every narrator their plan includes. */
export function VoiceSampleList({ pro, accent, current, className }: { pro: boolean; accent?: string; current?: string; className?: string }) {
  const voices = VOICES.filter((v) => voiceAllowed(v.id, pro));
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" size="sm" variant="outline" className={className} title="Hear every narrator on your plan for free">
          <Headphones className="h-3.5 w-3.5" /> Hear all voices
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <div className="border-b border-border p-3">
          <p className="text-sm font-medium">Narrators on your plan</p>
          <p className="text-xs text-muted-foreground">Listening is free and never uses credits.{!pro && " Upgrade to Pro for more voices."}</p>
        </div>
        <ul className="max-h-80 overflow-y-auto p-1">
          {voices.map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50">
              <span className="text-sm">{v.label}{v.id === current && <span className="ml-1 text-xs text-primary">· selected</span>}</span>
              <VoiceSampleButton voice={v.id} accent={accent} className="h-7 shrink-0 text-xs" />
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
