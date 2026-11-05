import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ASPECT_RATIOS, shapeOf } from "@/lib/aspectRatio";

/** Format menu — each option is drawn in its own shape so the choice is obvious. */
export default function RatioSelect({ value, onChange, triggerClassName }: { value: string; onChange: (v: string) => void; triggerClassName?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue />
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
