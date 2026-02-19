import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, MapPin, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import RangeDatePickerCalendar from "@/components/RangeDatePickerCalendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface CitySuggestion {
  name: string;
  countryCode: string;
  cityCode: string;
}

const COUNTRY_NAMES: Record<string, string> = {
  FR: "France", ES: "Spain", GB: "United Kingdom", US: "United States",
  IT: "Italy", DE: "Germany", PT: "Portugal", NL: "Netherlands",
  GR: "Greece", TH: "Thailand", JP: "Japan", AU: "Australia",
  AE: "UAE", TR: "Turkey", MX: "Mexico", BR: "Brazil",
  IN: "India", CN: "China", SG: "Singapore", ZA: "South Africa",
  AR: "Argentina", EG: "Egypt", MA: "Morocco", ID: "Indonesia",
  MY: "Malaysia", PH: "Philippines", VN: "Vietnam", HK: "Hong Kong",
  NZ: "New Zealand", CA: "Canada", MV: "Maldives", BE: "Belgium",
  SE: "Sweden", NO: "Norway", DK: "Denmark", FI: "Finland",
  CH: "Switzerland", AT: "Austria", PL: "Poland", CZ: "Czechia",
  HU: "Hungary", RO: "Romania", HR: "Croatia", BA: "Bosnia",
  RS: "Serbia", BG: "Bulgaria", SK: "Slovakia", SI: "Slovenia",
};

const HotelSearchForm = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [selectedCityCode, setSelectedCityCode] = useState("");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [travellersOpen, setTravellersOpen] = useState(false);

  // Portal dropdown positioning
  const [dropdownTop, setDropdownTop] = useState(0);
  const [dropdownLeft, setDropdownLeft] = useState(0);
  const [dropdownWidth, setDropdownWidth] = useState(0);
  const destinationRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalGuests = adults + children;

  const updatePosition = useCallback(() => {
    if (destinationRef.current) {
      const r = destinationRef.current.getBoundingClientRect();
      setDropdownTop(r.bottom + 4);
      setDropdownLeft(r.left);
      setDropdownWidth(r.width);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showSuggestions) return;
    const onScroll = () => updatePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showSuggestions, updatePosition]);

  const fetchSuggestions = useCallback(async (keyword: string) => {
    updatePosition();
    setIsLoading(true);
    setShowSuggestions(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/amadeus-hotel-autocomplete?keyword=${encodeURIComponent(keyword)}`,
        {
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
        }
      );
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [updatePosition]);

  // Debounced fetch — triggers on 1+ chars
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (destination.length < 1 || selectedCityCode) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(destination), 150);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [destination, selectedCityCode, fetchSuggestions]);

  const handleSuggestionSelect = (suggestion: CitySuggestion) => {
    const countryName = COUNTRY_NAMES[suggestion.countryCode] || suggestion.countryCode;
    setDestination(`${suggestion.name}, ${countryName}`);
    setSelectedCityCode(suggestion.cityCode);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestination(e.target.value);
    if (selectedCityCode) setSelectedCityCode("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cityParam = selectedCityCode
      ? `cityCode=${encodeURIComponent(selectedCityCode)}`
      : `destination=${encodeURIComponent(destination)}`;
    navigate(
      `/results?${cityParam}&checkIn=${checkIn ? format(checkIn, "yyyy-MM-dd") : ""}&checkOut=${checkOut ? format(checkOut, "yyyy-MM-dd") : ""}&guests=${totalGuests}&rooms=${rooms}`
    );
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
        <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground text-sm px-5">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          Searching destinations…
        </div>
      ) : suggestions.length === 0 ? (
        <div className="py-4 px-5 text-sm text-muted-foreground text-center">
          No results found
        </div>
      ) : (
        <ul className="max-h-72 overflow-y-auto">
          {suggestions.map((s) => {
            const countryName = COUNTRY_NAMES[s.countryCode] || s.countryCode;
            return (
              <li key={s.cityCode}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSuggestionSelect(s);
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-primary/5 transition-colors text-left border-b border-border/50 last:border-0"
                >
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    <span className="font-semibold text-foreground text-sm">{s.name}</span>
                    <span className="text-muted-foreground text-xs ml-2">{countryName}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      onSubmit={handleSearch}
      className="w-full max-w-7xl mx-auto"
    >
      <div className="bg-navy/80 backdrop-blur-sm rounded-2xl p-4 shadow-elevated border border-white/10">
        <div className="bg-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl font-semibold text-foreground">
              Find your perfect stay
            </h3>
          </div>

          {/* Main Search Row */}
          <div className="flex items-stretch border border-border rounded-xl overflow-visible">
            {/* Destination with portal autocomplete */}
            <div ref={destinationRef} className="relative flex-[2] border-r border-border">
              <label className="absolute left-5 top-3 text-base font-bold text-foreground z-10 pointer-events-none">
                Where do you want to go?
              </label>
              <input
                type="text"
                placeholder="Enter a destination or hotel name"
                value={destination}
                onChange={handleDestinationChange}
                onFocus={() => {
                  if (!selectedCityCode && destination.length >= 1) fetchSuggestions(destination);
                }}
                autoComplete="off"
                className="w-full px-5 pt-10 pb-4 bg-card text-foreground placeholder:text-muted-foreground text-lg outline-none transition-all focus:bg-primary/5 rounded-l-xl"
              />
              {showSuggestions && createPortal(dropdownContent, document.body)}
            </div>

            {/* Check-in / Check-out — unified dual-month calendar */}
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="relative border-r border-border text-left flex-1 px-5 pt-10 pb-4 bg-card hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <span className="absolute left-5 top-3 text-base font-bold text-foreground">Check-in</span>
                  <span className={cn("text-lg", checkIn ? "text-foreground" : "text-muted-foreground")}>
                    {checkIn ? format(checkIn, "dd MMM yyyy") : "Add date"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-auto" align="start" sideOffset={8}>
                <RangeDatePickerCalendar
                  departDate={checkIn}
                  returnDate={checkOut}
                  onDepartChange={(d) => { setCheckIn(d); setCheckOut(undefined); }}
                  onReturnChange={(d) => setCheckOut(d)}
                  onApply={() => setDatePopoverOpen(false)}
                  hint="Select check-out date"
                />
              </PopoverContent>
            </Popover>

            {/* Check-out — opens same calendar */}
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="relative border-r border-border text-left flex-1 px-5 pt-10 pb-4 bg-card hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <span className="absolute left-5 top-3 text-base font-bold text-foreground">Check-out</span>
                  <span className={cn("text-lg", checkOut ? "text-foreground" : "text-muted-foreground")}>
                    {checkOut ? format(checkOut, "dd MMM yyyy") : "Add date"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-auto" align="start" sideOffset={8}>
                <RangeDatePickerCalendar
                  departDate={checkIn}
                  returnDate={checkOut}
                  onDepartChange={(d) => { setCheckIn(d); setCheckOut(undefined); }}
                  onReturnChange={(d) => setCheckOut(d)}
                  onApply={() => setDatePopoverOpen(false)}
                  hint="Select check-out date"
                />
              </PopoverContent>
            </Popover>

            {/* Guests and Rooms */}
            <Popover open={travellersOpen} onOpenChange={setTravellersOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="relative text-left flex-1 border-r border-border px-5 pt-10 pb-4 bg-card hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <span className="absolute left-5 top-3 text-base font-bold text-foreground">Guests & rooms</span>
                  <span className="text-lg text-foreground">
                    {totalGuests} {totalGuests === 1 ? "guest" : "guests"}, {rooms} {rooms === 1 ? "room" : "rooms"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
                <div className="p-5 space-y-5">
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-foreground">Adults</p>
                      <p className="text-sm text-muted-foreground">Aged 18+</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} disabled={adults <= 1} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-base font-semibold text-foreground w-6 text-center">{adults}</span>
                      <button type="button" onClick={() => setAdults(Math.min(9, adults + 1))} disabled={adults >= 9} className="w-9 h-9 rounded-lg border border-primary bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {/* Children */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-foreground">Children</p>
                      <p className="text-sm text-muted-foreground">Aged 0 to 17</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} disabled={children <= 0} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-base font-semibold text-foreground w-6 text-center">{children}</span>
                      <button type="button" onClick={() => setChildren(Math.min(6, children + 1))} disabled={children >= 6} className="w-9 h-9 rounded-lg border border-primary bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {/* Rooms */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-foreground">Rooms</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setRooms(Math.max(1, rooms - 1))} disabled={rooms <= 1} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-base font-semibold text-foreground w-6 text-center">{rooms}</span>
                      <button type="button" onClick={() => setRooms(Math.min(5, rooms + 1))} disabled={rooms >= 5} className="w-9 h-9 rounded-lg border border-primary bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTravellersOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Search Button */}
            <button
              type="submit"
              className="px-10 bg-primary text-primary-foreground font-bold text-xl hover:bg-coral-light transition-colors flex items-center gap-2 shrink-0 rounded-r-xl"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </motion.form>
  );
};

export default HotelSearchForm;
