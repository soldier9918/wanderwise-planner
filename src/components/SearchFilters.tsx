import { useState } from "react";
import { Star, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FiltersProps {
  onFilterChange: (filters: FilterState) => void;
  distanceUnit: "km" | "mi";
  onDistanceUnitChange: (unit: "km" | "mi") => void;
}

export interface FilterState {
  minStars: number;
  boardType: string;
  maxPrice: number;
  sortBy: string;
}

const SearchFilters = ({ onFilterChange, distanceUnit, onDistanceUnitChange }: FiltersProps) => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    minStars: 0,
    boardType: "all",
    maxPrice: 2000,
    sortBy: "price-low",
  });

  const update = (partial: Partial<FilterState>) => {
    const next = { ...filters, ...partial };
    setFilters(next);
    onFilterChange(next);
  };

  return (
    <div className="bg-gradient-card rounded-2xl border border-border p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm font-semibold text-foreground">Filters</h3>
        </div>
        <button
          className="md:hidden text-xs text-primary"
          onClick={() => setOpen(!open)}
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      <div className={`space-y-5 ${open ? "block" : "hidden md:block"}`}>
        {/* Distance Unit */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Distance Unit</label>
          <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
            {(["km", "mi"] as const).map((u) => (
              <button
                key={u}
                onClick={() => onDistanceUnitChange(u)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  distanceUnit === u
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {u === "km" ? "Kilometres" : "Miles"}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => update({ sortBy: e.target.value })}
            className="w-full py-2 px-3 rounded-xl bg-secondary text-foreground text-sm border border-border outline-none focus:border-primary"
          >
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating</option>
            <option value="stars">Star Rating</option>
          </select>
        </div>

        {/* Stars */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Min Stars</label>
          <div className="flex gap-1">
            {[0, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => update({ minStars: s })}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                  filters.minStars === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === 0 ? "All" : <>{s}<Star className="w-3 h-3" /></>}
              </button>
            ))}
          </div>
        </div>

        {/* Board Type */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Board Type</label>
          <div className="flex flex-col gap-1">
            {["all", "All Inclusive", "Half Board", "Bed & Breakfast", "Self Catering"].map((bt) => (
              <button
                key={bt}
                onClick={() => update({ boardType: bt })}
                className={`py-2 px-3 text-xs font-medium rounded-lg text-left transition-colors ${
                  filters.boardType === bt
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {bt === "all" ? "Any" : bt}
              </button>
            ))}
          </div>
        </div>

        {/* Max Price */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Max Price: £{filters.maxPrice}
          </label>
          <input
            type="range"
            min={100}
            max={2000}
            step={50}
            value={filters.maxPrice}
            onChange={(e) => update({ maxPrice: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
