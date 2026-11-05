import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { ASPECT_RATIOS, ratioOf, shapeOf } from "@/lib/aspectRatio";

/** Format menu — each option is drawn in its own shape so the choice is obvious. */
export default function RatioSelect({ value, onChange, triggerClassName }: { value: string; onChange: (v: string) => void; triggerClassName?: string }) {
  const selected = ratioOf(value);
  const sel = shapeOf(selected.value);
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={triggerClassName}>
        <span className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded-[2px] border border-current opacity-60" style={{ width: sel.w, height: sel.h }} />
          <span className="truncate">{selected.short}</span>
        </span>
      </SelectTrigger>
      <SelectContent>
        {ASPECT_RATIOS.map((r) => {
          const s = shapeOf(r.value);
          return (
            <SelectItem key={r.value} value={r.value}>
              <span className="flex items-center gap-2">
                <span className="shrink-0 rounded-[2px] border border-current opacity-60" style={{ width: s.w, height: s.h }} />
                <span>{r.label}</span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
