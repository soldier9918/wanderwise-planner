import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Zap } from "lucide-react";

export interface WhatIfState {
  dayShift: number;
  acceptStops: boolean;
  monthShift: number;
}

interface WhatIfSlidersProps {
  onChange: (state: WhatIfState) => void;
  isLoading?: boolean;
}

const WhatIfSliders = ({ onChange, isLoading }: WhatIfSlidersProps) => {
  const [dayShift, setDayShift] = useState(0);
  const [acceptStops, setAcceptStops] = useState(false);
  const [monthShift, setMonthShift] = useState(0);

  const handleChange = (updates: Partial<WhatIfState>) => {
    const state = { dayShift, acceptStops, monthShift, ...updates };
    if (updates.dayShift !== undefined) setDayShift(updates.dayShift);
    if (updates.acceptStops !== undefined) setAcceptStops(updates.acceptStops);
    if (updates.monthShift !== undefined) setMonthShift(updates.monthShift);
    onChange(state);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
      <h3 className="font-display text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        "What if?" Adjustments
      </h3>
      <p className="text-xs text-muted-foreground mb-5">
        Tweak constraints to see how recommendations change
      </p>

      <div className="space-y-6">
        {/* Day shift */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Fly earlier/later</label>
            <span className="text-sm font-bold text-primary">
              {dayShift === 0 ? "As planned" : `${dayShift > 0 ? "+" : ""}${dayShift} days`}
            </span>
          </div>
          <Slider
            value={[dayShift]}
            min={-3}
            max={3}
            step={1}
            onValueChange={([v]) => handleChange({ dayShift: v })}
          />
        </div>

        {/* Accept stops */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-foreground block">Accept 1 stop?</label>
            <p className="text-xs text-muted-foreground">Often cheaper but longer travel time</p>
          </div>
          <Switch
            checked={acceptStops}
            onCheckedChange={(v) => handleChange({ acceptStops: v })}
          />
        </div>

        {/* Month shift */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Shift travel month</label>
            <span className="text-sm font-bold text-primary">
              {monthShift === 0 ? "As planned" : `${monthShift > 0 ? "+" : ""}${monthShift} month${Math.abs(monthShift) > 1 ? "s" : ""}`}
            </span>
          </div>
          <Slider
            value={[monthShift]}
            min={-2}
            max={2}
            step={1}
            onValueChange={([v]) => handleChange({ monthShift: v })}
          />
        </div>
      </div>

      {isLoading && (
        <p className="text-xs text-primary animate-pulse mt-4 text-center">Re-evaluating recommendations…</p>
      )}
    </div>
  );
};

export default WhatIfSliders;
