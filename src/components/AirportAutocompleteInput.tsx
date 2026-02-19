import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Plane, MapPin, Loader2 } from "lucide-react";
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
  const [dropdownTop, setDropdownTop] = useState(0);
  const [dropdownLeft, setDropdownLeft] = useState(0);
  const [dropdownWidth, setDropdownWidth] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (containerRef.current) {
      const r = containerRef.current.getBoundingClientRect();
      setDropdownTop(r.bottom + 4);
      setDropdownLeft(r.left);
      setDropdownWidth(r.width);
    }
  }, []);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  useEffect(() => {
    if (!showDropdown) return;
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showDropdown, updatePosition]);

  const fetchSuggestions = useCallback(async (keyword: string) => {
    updatePosition();
    setIsLoading(true);
    setShowDropdown(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/amadeus-airport-search?keyword=${encodeURIComponent(keyword)}`,
        { headers: { apikey: SUPABASE_ANON_KEY } }
      );
      const data = await res.json();
      const kw = keyword.trim().toLowerCase();
      const all: AirportSuggestion[] = data.suggestions || [];
      const filtered = all.filter((s) => {
        const city = (s.cityName || "").toLowerCase();
        const name = (s.name || "").toLowerCase();
        const iata = (s.iataCode || "").toLowerCase();
        return city.startsWith(kw) || name.startsWith(kw) || iata.startsWith(kw);
      });
      setSuggestions(filtered);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [updatePosition]);

  useEffect(() => {
    if (iataSelected) return;
    if (value.length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, iataSelected, fetchSuggestions]);

  const handleSelect = (s: AirportSuggestion) => {
    const cityPart = s.cityName && s.cityName !== s.name ? s.cityName : "";
    const display = cityPart
      ? `${cityPart} (${s.iataCode})`
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

  const dropdownContent = (
    <div
      style={{
        position: "fixed",
        top: dropdownTop,
        left: dropdownLeft,
        minWidth: dropdownWidth,
        width: "max-content",
        maxWidth: "420px",
        zIndex: 99999,
      }}
      className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground text-sm whitespace-nowrap px-5">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          Searching airports…
        </div>
      ) : suggestions.length === 0 ? (
        <div className="py-4 px-5 text-sm text-muted-foreground text-center whitespace-nowrap">
          No results found
        </div>
      ) : (
        <ul>
          {suggestions.map((s, i) => (
            <li key={`${s.iataCode}-${i}`}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(s);
                }}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-primary/5 transition-colors border-b border-border last:border-0"
              >
                {s.subType === "CITY" ? (
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                ) : (
                  <Plane className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground text-sm">
                      {s.cityName && s.cityName !== s.name ? s.cityName : s.name}
                    </span>
                    <span className="shrink-0 text-xs font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      {s.iataCode}
                    </span>
                    {s.subType === "AIRPORT" && s.cityName && s.cityName !== s.name && (
                      <span className="text-xs text-muted-foreground">· {s.name}</span>
                    )}
                  </div>
                  {s.countryName && (
                    <p className="text-xs text-muted-foreground mt-0.5">{s.countryName}</p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

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
          if (!iataSelected && value.length >= 1) {
            fetchSuggestions(value);
          }
        }}
        className="w-full px-5 pt-10 pb-4 bg-card text-foreground placeholder:text-muted-foreground text-lg outline-none transition-all focus:bg-primary/5"
        autoComplete="off"
      />
      {showDropdown && createPortal(dropdownContent, document.body)}
    </div>
  );
};

export default AirportAutocompleteInput;
