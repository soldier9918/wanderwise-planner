import { useState } from "react";
import { Check, ChevronDown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { VoiceSampleButton } from "@/components/VoiceSampleButton";
import { VOICES } from "@/lib/videoApi";
import { voiceAllowed } from "@/lib/tiers";
import { cn } from "@/lib/utils";

/** Narrator picker: every name in the list has its own free play button. */
export function VoiceSelect({ value, onChange, pro, accent, disabled, className, triggerClassName }: {
  value: string;
  onChange: (voice: string) => void;
  pro: boolean;
  accent?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = VOICES.find((v) => v.id === value);

  return (
    <Popover open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            triggerClassName,
          )}
        >
          <span className="truncate text-left">{current?.label ?? value}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-80 p-0">
        <div className="border-b border-border px-3 py-2">
          <p className="text-xs font-semibold text-muted-foreground">Narrators</p>
          <p className="text-[11px] text-muted-foreground">Press play to hear any voice — free, no credits used.</p>
        </div>
        <ul className="max-h-80 overflow-y-auto p-1">
          {VOICES.map((v) => {
            const allowed = voiceAllowed(v.id, pro) || v.id === value;
            const selected = v.id === value;
            return (
              <li key={v.id} className="flex items-center gap-1 rounded-md pr-1 hover:bg-muted/60">
                <button
                  type="button"
                  disabled={!allowed}
                  onClick={() => { onChange(v.id); setOpen(false); }}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <span className="min-w-0 flex-1 truncate">{v.label}</span>
                  {!allowed && <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />}
                  {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>
                <VoiceSampleButton voice={v.id} accent={accent} iconOnly className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground" />
              </li>
            );
          })}
        </ul>
        {!pro && <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">Locked voices need a subscription — you can still listen to them.</p>}
      </PopoverContent>
    </Popover>
  );
}
