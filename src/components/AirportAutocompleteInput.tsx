import { useState, useEffect, useRef, useCallback } from "react";
import { Plane, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface AirportSuggestion {
  name: string;
  iataCode: string;
  subType: string;
  cityName: string;
  countryName: string;
  countryCode: string;
}

interface AirportAutocompleteInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (iataCode: string, displayLabel: string) => void;
  className?: string;
}

const AirportAutocompleteInput = ({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  className,
}: AirportAutocompleteInputProps) => {
  const [suggestions, setSuggestions] = useState<AirportSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [iataSelected, setIataSelected] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const fetchSuggestions = useCallback(async (keyword: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/amadeus-airport-search?keyword=${encodeURIComponent(keyword)}`,
        { headers: { apikey: SUPABASE_ANON_KEY } }
      );
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setShowDropdown(true);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (iataSelected) return;
    if (value.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, iataSelected, fetchSuggestions]);

  const handleSelect = (s: AirportSuggestion) => {
    const display = s.subType === "CITY"
      ? `${s.name} (${s.iataCode})`
      : `${s.name} (${s.iataCode})`;
    setIataSelected(true);
    setShowDropdown(false);
    setSuggestions([]);
    onChange(display);
    onSelect(s.iataCode, display);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIataSelected(false);
    onChange(e.target.value);
  };

  return (
    <div ref={containerRef} className={cn("relative flex-1 border-r border-border", className)}>
      <label className="absolute left-5 top-3 text-base font-bold text-foreground z-10 pointer-events-none">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          if (!iataSelected && value.length >= 2) {
            fetchSuggestions(value);
          }
        }}
        className="w-full px-5 pt-10 pb-4 bg-card text-foreground placeholder:text-muted-foreground text-lg outline-none transition-all focus:bg-primary/5"
        autoComplete="off"
      />

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-xl shadow-elevated overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching airports…
            </div>
          ) : suggestions.length === 0 ? (
            <div className="py-4 px-5 text-sm text-muted-foreground text-center">
              No results found
            </div>
          ) : (
            <ul>
              {suggestions.map((s, i) => (
                <li key={`${s.iataCode}-${i}`}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault(); // prevent blur before click
                      handleSelect(s);
                    }}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-primary/5 transition-colors border-b border-border last:border-0"
                  >
                    <Plane className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm truncate">
                          {s.name}
                        </span>
                        <span className="shrink-0 text-xs font-bold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                          {s.iataCode}
                        </span>
                      </div>
                      {(s.cityName || s.countryName) && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {[s.cityName, s.countryName].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AirportAutocompleteInput;
