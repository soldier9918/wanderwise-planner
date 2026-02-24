import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Plane, MapPin, Loader2, Globe } from "lucide-react";
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

// Group airports under their city, like Skyscanner's "London (Any)"
interface GroupedSuggestion {
  type: "city-group" | "single";
  cityName: string;
  countryName: string;
  // For city-group: the city-level IATA (e.g. LON) or first airport's city code
  cityIata: string;
  airports: AirportSuggestion[];
}

function groupSuggestions(suggestions: AirportSuggestion[]): GroupedSuggestion[] {
  const cityMap = new Map<string, AirportSuggestion[]>();
  const cityOrder: string[] = [];

  for (const s of suggestions) {
    // Normalise city key: use cityName if available, else name
    const cityKey = (s.cityName || s.name).trim().toUpperCase();
    if (!cityMap.has(cityKey)) {
      cityMap.set(cityKey, []);
      cityOrder.push(cityKey);
    }
    cityMap.get(cityKey)!.push(s);
  }

  const groups: GroupedSuggestion[] = [];
  for (const cityKey of cityOrder) {
    const airports = cityMap.get(cityKey)!;
    const city = airports[0];
    // Separate CITY subtype entries from AIRPORT entries
    const cityEntry = airports.find((a) => a.subType === "CITY");
    const airportEntries = airports.filter((a) => a.subType === "AIRPORT");

    if (airportEntries.length > 1) {
      // Multiple airports → show city "(Any)" group first
      groups.push({
        type: "city-group",
        cityName: city.cityName || city.name,
        countryName: city.countryName,
        cityIata: cityEntry?.iataCode || airportEntries[0].iataCode,
        airports: airportEntries,
      });
    } else if (airportEntries.length === 1 && cityEntry) {
      // One airport + city entry → just show the airport
      groups.push({
        type: "single",
        cityName: city.cityName || city.name,
        countryName: city.countryName,
        cityIata: airportEntries[0].iataCode,
        airports: airportEntries,
      });
    } else {
      // Anything else — show as individual entries
      for (const s of airports) {
        groups.push({
          type: "single",
          cityName: s.cityName || s.name,
          countryName: s.countryName,
          cityIata: s.iataCode,
          airports: [s],
        });
      }
    }
  }
  return groups;
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
      // Use fixed positioning (viewport-relative) since portal renders at document.body
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
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
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
      const all: AirportSuggestion[] = data.suggestions || [];
      // Client-side filter: only keep entries where name, city, IATA or country STARTS WITH the keyword
      const kw = keyword.trim().toLowerCase();
      const filtered = all.filter((s) =>
        s.iataCode?.toLowerCase().startsWith(kw) ||
        (s.cityName || "").toLowerCase().startsWith(kw) ||
        s.name?.toLowerCase().startsWith(kw)
      );
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

  const handleSelectAirport = (s: AirportSuggestion) => {
    const cityPart = s.cityName && s.cityName !== s.name ? s.cityName : s.name;
    const display = `${cityPart} (${s.iataCode})`;
    setIataSelected(true);
    setShowDropdown(false);
    setSuggestions([]);
    onChange(display);
    onSelect(s.iataCode, display);
  };

  const handleSelectCityGroup = (group: GroupedSuggestion) => {
    // "London (Any)" → use the city IATA
    const display = `${group.cityName} (Any)`;
    setIataSelected(true);
    setShowDropdown(false);
    setSuggestions([]);
    onChange(display);
    onSelect(group.cityIata, display);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIataSelected(false);
    onChange(e.target.value);
  };

  const grouped = groupSuggestions(suggestions);

  const dropdownContent = (
    <div
      style={{
        position: "fixed",
        top: dropdownTop,
        left: dropdownLeft,
        minWidth: dropdownWidth,
        width: "max-content",
        maxWidth: "460px",
        zIndex: 99999,
      }}
      className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground text-sm px-5">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          Searching airports…
        </div>
      ) : grouped.length === 0 ? (
        <div className="py-4 px-5 text-sm text-muted-foreground text-center">
          No results found
        </div>
      ) : (
        <ul className="max-h-80 overflow-y-auto">
          {grouped.map((group, gi) => (
            <li key={`g-${gi}`}>
              {group.type === "city-group" ? (
                <>
                  {/* City (Any) row */}
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleSelectCityGroup(group); }}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-primary/5 transition-colors border-b border-border/50"
                  >
                    <Globe className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">
                          {group.cityName} (Any)
                        </span>
                        <span className="shrink-0 text-xs font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {group.cityIata}
                        </span>
                      </div>
                      {group.countryName && (
                        <p className="text-xs text-muted-foreground mt-0.5">{group.countryName}</p>
                      )}
                    </div>
                  </button>
                  {/* Individual airports indented */}
                  {group.airports.map((s, ai) => (
                    <button
                      key={`${s.iataCode}-${ai}`}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); handleSelectAirport(s); }}
                      className="w-full flex items-start gap-3 pl-10 pr-4 py-2.5 text-left hover:bg-primary/5 transition-colors border-b border-border/30 last:border-b border-border/50"
                    >
                      <Plane className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground text-sm">{s.name}</span>
                          <span className="shrink-0 text-xs font-bold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                            {s.iataCode}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleSelectAirport(group.airports[0]); }}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-primary/5 transition-colors border-b border-border/50 last:border-0"
                >
                  {group.airports[0]?.subType === "CITY" ? (
                    <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  ) : (
                    <Plane className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">{group.cityName}</span>
                      <span className="shrink-0 text-xs font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        {group.airports[0]?.iataCode}
                      </span>
                    </div>
                    {group.countryName && (
                      <p className="text-xs text-muted-foreground mt-0.5">{group.countryName}</p>
                    )}
                  </div>
                </button>
              )}
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
        className="w-full px-5 pt-10 pb-4 bg-card text-foreground placeholder:text-muted-foreground text-lg outline-none transition-all focus:bg-primary/5 active:bg-primary/5"
        autoComplete="off"
      />
      {showDropdown && createPortal(dropdownContent, document.body)}
    </div>
  );
};

export default AirportAutocompleteInput;
