import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Plane, AlertCircle, Loader2, ChevronDown,
  Sparkles, Search, SlidersHorizontal, X, ChevronUp, ChevronLeft,
  Luggage, Briefcase, BaggageClaim, Plus, Minus, CalendarIcon, Users,
} from "lucide-react";
import { addDays, format, parseISO } from "date-fns";
import AirportAutocompleteInput from "@/components/AirportAutocompleteInput";
import RangeDatePickerCalendar from "@/components/RangeDatePickerCalendar";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import PriceAlertButton from "@/components/PriceAlertButton";

// ── Types ──────────────────────────────────────────────────────────────────────
interface FlightSegment {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
  carrierCode: string;
  number: string;
  duration: string;
}
interface FlightItinerary { duration: string; segments: FlightSegment[]; }
interface FlightOffer {
  id: string;
  itineraries: FlightItinerary[];
  price: { total: string; currency: string; grandTotal: string };
  numberOfBookableSeats: number;
  validatingAirlineCodes: string[];
}
interface BookingLink { label: string; sublabel: string; url: string; icon: "kiwi" | "google" | "airline"; }

// ── Static data ────────────────────────────────────────────────────────────────
const airlineNames: Record<string, string> = {
  FR: "Ryanair", U2: "easyJet", W9: "Wizz Air", BA: "British Airways",
  EK: "Emirates", LH: "Lufthansa", AF: "Air France", KL: "KLM",
  IB: "Iberia", VY: "Vueling", LS: "Jet2", TOM: "TUI Airways",
  AA: "American Airlines", DL: "Delta", UA: "United Airlines", QR: "Qatar Airways",
  EY: "Etihad", SQ: "Singapore Airlines", CX: "Cathay Pacific", TK: "Turkish Airlines",
  DY: "Norwegian", SK: "SAS", AY: "Finnair", OS: "Austrian",
  LX: "Swiss", SN: "Brussels Airlines", TP: "TAP Air Portugal",
  VS: "Virgin Atlantic", B6: "JetBlue",
};

const airlineLogoUrl = (code: string) =>
  `https://www.gstatic.com/flights/airline_logos/70px/${code}.png`;

const directAirlineUrls: Record<string, string> = {
  FR: "https://www.ryanair.com", U2: "https://www.easyjet.com",
  BA: "https://www.britishairways.com", KL: "https://www.klm.com",
  AF: "https://www.airfrance.co.uk", LH: "https://www.lufthansa.com",
  IB: "https://www.iberia.com", VY: "https://www.vueling.com",
  TK: "https://www.turkishairlines.com", QR: "https://www.qatarairways.com",
  EK: "https://www.emirates.com", EY: "https://www.etihad.com",
  SQ: "https://www.singaporeair.com",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function parseDuration(iso: string) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  const h = parseInt(m?.[1] || "0"); const min = parseInt(m?.[2] || "0");
  return h ? `${h}h ${min}m` : `${min}m`;
}
function parseDurationMinutes(iso: string) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  return parseInt(m?.[1] || "0") * 60 + parseInt(m?.[2] || "0");
}
function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
function formatDateShort(isoDate: string) {
  try { return format(parseISO(isoDate), "EEE d MMM"); } catch { return isoDate; }
}
function shiftDate(isoDate: string, days: number): string {
  try { return format(addDays(parseISO(isoDate), days), "yyyy-MM-dd"); } catch { return isoDate; }
}
function toKiwiDate(d: string) { const [y, m, dd] = d.split("-"); return `${dd}/${m}/${y}`; }
function timeToMinutes(dateStr: string) {
  const d = new Date(dateStr); return d.getHours() * 60 + d.getMinutes();
}

function buildBookingLinks(
  from: string, to: string, depart: string, returnDate: string,
  adults: number, children: number, carrierCode: string,
): BookingLink[] {
  const depKiwi = toKiwiDate(depart);
  const retKiwi = returnDate ? toKiwiDate(returnDate) : "";
  const kiwiBase = returnDate
    ? `https://www.kiwi.com/en/search/results/${from}/${to}/${depKiwi}/${retKiwi}`
    : `https://www.kiwi.com/en/search/results/${from}/${to}/${depKiwi}`;
  const googleUrl = `https://www.google.com/travel/flights?q=Flights+from+${from}+to+${to}`;
  const links: BookingLink[] = [
    { label: "Kiwi.com", sublabel: "Best fare finder", url: `${kiwiBase}?adults=${adults}&children=${children}`, icon: "kiwi" },
    { label: "Google Flights", sublabel: "Price overview", url: googleUrl, icon: "google" },
  ];
  if (directAirlineUrls[carrierCode]) {
    links.unshift({ label: airlineNames[carrierCode] || carrierCode, sublabel: "Book direct", url: directAirlineUrls[carrierCode], icon: "airline" });
  }
  return links;
}

// ── Airline Logo ───────────────────────────────────────────────────────────────
function AirlineLogo({ code, name }: { code: string; name: string }) {
  const [err, setErr] = useState(false);
  if (err) return (
    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border shrink-0">
      {code.slice(0, 2)}
    </div>
  );
  return (
    <img src={airlineLogoUrl(code)} alt={name}
      className="w-8 h-8 rounded-lg object-contain bg-card p-0.5 border border-border shrink-0"
      onError={() => setErr(true)} />
  );
}

// ── Luggage Icons ──────────────────────────────────────────────────────────────
function LuggageIcons({ includedCheckedBags }: { includedCheckedBags?: number }) {
  const hasChecked = includedCheckedBags != null ? includedCheckedBags > 0 : false;
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <div className="flex flex-col items-center gap-0.5" title="Personal item included">
        <Briefcase className="w-4 h-4 text-primary" />
        <span className="text-[9px] text-primary font-semibold leading-none">Item</span>
      </div>
      <div className="flex flex-col items-center gap-0.5" title="Cabin bag included">
        <Luggage className="w-4 h-4 text-primary" />
        <span className="text-[9px] text-primary font-semibold leading-none">Cabin</span>
      </div>
      <div className="flex flex-col items-center gap-0.5 relative" title={hasChecked ? "Checked bag included" : "Checked bag not included"}>
        <BaggageClaim className={`w-4 h-4 ${hasChecked ? "text-primary" : "text-muted-foreground/40"}`} />
        {!hasChecked && (
          <div className="absolute inset-0 flex items-start justify-end">
            <div className="w-4 h-[1.5px] bg-destructive/70 rotate-[-45deg] translate-y-[6px] -translate-x-[1px]" />
          </div>
        )}
        <span className={`text-[9px] font-semibold leading-none ${hasChecked ? "text-primary" : "text-muted-foreground/40"}`}>
          {hasChecked ? "Hold" : "No hold"}
        </span>
      </div>
    </div>
  );
}

// ── Itinerary Row ──────────────────────────────────────────────────────────────
function ItineraryRow({ itinerary, carrierCode, includedCheckedBags }: {
  itinerary: FlightItinerary;
  carrierCode: string;
  includedCheckedBags?: number;
}) {
  const first = itinerary.segments[0];
  const last = itinerary.segments[itinerary.segments.length - 1];
  const stops = itinerary.segments.length - 1;
  const airline = airlineNames[carrierCode] || carrierCode;

  return (
    <div className="flex items-center gap-0 w-full">
      <div className="shrink-0 mr-3 flex flex-col items-center gap-0.5">
        <AirlineLogo code={carrierCode} name={airline} />
        <p className="text-[9px] text-muted-foreground text-center max-w-[40px] leading-tight truncate">{airline}</p>
      </div>
      <div className="text-center shrink-0 w-14">
        <p className="text-xl font-black text-foreground leading-none">{formatTime(first.departure.at)}</p>
        <p className="text-sm font-bold text-muted-foreground mt-0.5">{first.departure.iataCode}</p>
      </div>
      <div className="flex-1 flex flex-col items-center gap-0.5 px-3 min-w-0">
        <p className="text-sm text-muted-foreground">{parseDuration(itinerary.duration)}</p>
        <div className="relative w-full flex items-center">
          <div className="h-px w-full bg-border" />
          <div className="absolute inset-0 flex items-center justify-end pr-0">
            <div className="bg-card pr-0.5">
              <Plane className="w-3 h-3 text-muted-foreground/50 rotate-90" />
            </div>
          </div>
        </div>
        {stops === 0 ? (
          <p className="text-sm font-semibold text-success">Direct</p>
        ) : (
          <p className="text-sm font-semibold text-warning">{stops} stop{stops > 1 ? "s" : ""}</p>
        )}
      </div>
      <div className="text-center shrink-0 w-14">
        <p className="text-xl font-black text-foreground leading-none">{formatTime(last.arrival.at)}</p>
        <p className="text-sm font-bold text-muted-foreground mt-0.5">{last.arrival.iataCode}</p>
        <LuggageIcons includedCheckedBags={includedCheckedBags} />
      </div>
    </div>
  );
}

// ── Flight Card ────────────────────────────────────────────────────────────────
function FlightCard({ offer, index, from, to, depart, returnDate, adults, children, cabin, isExpanded, onToggle }: {
  offer: FlightOffer; index: number;
  from: string; to: string; depart: string; returnDate: string;
  adults: number; children: number; cabin: string;
  isExpanded: boolean; onToggle: () => void;
}) {
  const outbound = offer.itineraries[0];
  const inbound = offer.itineraries[1];
  const carrierCode = offer.validatingAirlineCodes[0];
  const airline = airlineNames[carrierCode] || carrierCode;
  const priceGBP = parseFloat(offer.price.grandTotal);
  const bookingLinks = buildBookingLinks(from, to, depart, returnDate, adults, children, carrierCode);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.4), duration: 0.22 }}
      className={`bg-card border rounded-2xl overflow-hidden transition-all duration-200 ${
        isExpanded ? "border-primary/40 shadow-elevated" : "border-border hover:shadow-card"
      }`}
    >
      <div className="flex items-stretch cursor-pointer" onClick={onToggle}>
        <div className="flex-1 min-w-0 p-3 px-4 space-y-2">
          <ItineraryRow itinerary={outbound} carrierCode={carrierCode} />
          {inbound && (
            <div className="pt-2 border-t border-border/60">
              <ItineraryRow itinerary={inbound} carrierCode={carrierCode} />
            </div>
          )}
        </div>
        <div className="shrink-0 w-36 border-l border-border flex flex-col items-stretch justify-center p-3 gap-2">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">from</p>
            <p className="text-3xl font-black text-foreground">£{priceGBP.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">per person</p>
          </div>
          {offer.numberOfBookableSeats <= 5 && (
            <span className="text-[10px] font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded-full w-fit">
              {offer.numberOfBookableSeats} seats left
            </span>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`w-full flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-bold transition-all ${
              isExpanded
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            Select <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <div onClick={(e) => e.stopPropagation()}>
            <PriceAlertButton from={from} to={to} depart={depart} returnDate={returnDate || undefined} adults={adults} cabin={cabin} currentPrice={priceGBP} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Choose where to book</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {bookingLinks.map((link) => (
                  <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-secondary/50 hover:border-primary/40 hover:bg-primary/5 transition-all">
                    {link.icon === "airline" && <Plane className="w-4 h-4 text-primary" />}
                    {link.icon === "kiwi" && <Sparkles className="w-4 h-4 text-success" />}
                    {link.icon === "google" && <Search className="w-4 h-4 text-foreground" />}
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{link.label}</span>
                    <span className="text-[10px] text-muted-foreground text-center">{link.sublabel}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Filter section wrapper ─────────────────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border py-4 last:border-0">
      <button onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left">
        <span className="text-sm font-bold text-foreground">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="mt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckRow({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer group py-1">
      <div onClick={() => onChange(!checked)}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
          checked ? "border-primary bg-primary" : "border-border group-hover:border-primary/60"
        }`}>
        {checked && (
          <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 4l2.5 2.5L9 1" />
          </svg>
        )}
      </div>
      <div>
        <p className="text-sm text-foreground leading-tight">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </label>
  );
}

function TimeLabel({ minutes }: { minutes: number }) {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return <span>{h}:{m}</span>;
}

// ── Filter state ───────────────────────────────────────────────────────────────
interface FilterState {
  stopsDirect: boolean; stopsOne: boolean; stopsTwo: boolean;
  maxPrice: number;
  outboundTimeMax: number;
  returnTimeMax: number;
  maxDuration: number;
  airlines: Record<string, boolean>;
  baggageCabin: boolean;
  baggageChecked: boolean;
}

function FilterSidebar({
  filters, setFilters, priceRange, durationRange, airlineOptions, hasReturn, onClose,
  stopPrices,
}: {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  priceRange: [number, number];
  durationRange: [number, number];
  airlineOptions: { code: string; name: string; minPrice: number }[];
  hasReturn: boolean;
  onClose?: () => void;
  stopPrices: { direct: number | null; one: number | null; two: number | null };
}) {
  const set = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="font-bold text-foreground">Filters</h2>
        {onClose && <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>}
      </div>
      <div className="px-5 divide-y divide-border">

        {/* Stops — with price labels */}
        <FilterSection title="Stops" defaultOpen={true}>
          <div className="space-y-0.5">
            <CheckRow
              checked={filters.stopsDirect}
              onChange={(v) => set("stopsDirect", v)}
              label="Direct"
              sub={stopPrices.direct != null ? `from £${stopPrices.direct}` : undefined}
            />
            <CheckRow
              checked={filters.stopsOne}
              onChange={(v) => set("stopsOne", v)}
              label="1 stop"
              sub={stopPrices.one != null ? `from £${stopPrices.one}` : undefined}
            />
            <CheckRow
              checked={filters.stopsTwo}
              onChange={(v) => set("stopsTwo", v)}
              label="2+ stops"
              sub={stopPrices.two != null ? `from £${stopPrices.two}` : undefined}
            />
          </div>
        </FilterSection>

        {/* Price */}
        <FilterSection title="Price per person" defaultOpen={true}>
          <p className="text-xs text-muted-foreground mb-2">
            Up to <span className="font-bold text-foreground">£{filters.maxPrice}</span>
          </p>
          <input type="range" min={priceRange[0]} max={priceRange[1]} value={filters.maxPrice}
            onChange={(e) => set("maxPrice", Number(e.target.value))}
            className="w-full accent-primary h-1.5" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>£{priceRange[0]}</span><span>£{priceRange[1]}</span>
          </div>
        </FilterSection>

        {/* Baggage */}
        <FilterSection title="Baggage" defaultOpen={false}>
          <div className="space-y-0.5">
            <CheckRow checked={filters.baggageCabin} onChange={(v) => set("baggageCabin", v)} label="Cabin bag" />
            <CheckRow checked={filters.baggageChecked} onChange={(v) => set("baggageChecked", v)} label="Checked bag" />
          </div>
        </FilterSection>

        {/* Departure times */}
        <FilterSection title="Departure times" defaultOpen={false}>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">Outbound</p>
              <p className="text-xs text-muted-foreground mb-2">
                00:00 – <TimeLabel minutes={filters.outboundTimeMax} />
              </p>
              <input type="range" min={0} max={1439} value={filters.outboundTimeMax}
                onChange={(e) => set("outboundTimeMax", Number(e.target.value))}
                className="w-full accent-primary h-1.5" />
            </div>
            {hasReturn && (
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">Return</p>
                <p className="text-xs text-muted-foreground mb-2">
                  00:00 – <TimeLabel minutes={filters.returnTimeMax} />
                </p>
                <input type="range" min={0} max={1439} value={filters.returnTimeMax}
                  onChange={(e) => set("returnTimeMax", Number(e.target.value))}
                  className="w-full accent-primary h-1.5" />
              </div>
            )}
          </div>
        </FilterSection>

        {/* Journey duration */}
        <FilterSection title="Journey duration" defaultOpen={false}>
          <p className="text-xs text-muted-foreground mb-2">
            Up to <span className="font-bold text-foreground">{Math.floor(filters.maxDuration / 60)}h {filters.maxDuration % 60}m</span>
          </p>
          <input type="range" min={durationRange[0]} max={durationRange[1]} value={filters.maxDuration}
            onChange={(e) => set("maxDuration", Number(e.target.value))}
            className="w-full accent-primary h-1.5" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{Math.floor(durationRange[0] / 60)}h {durationRange[0] % 60}m</span>
            <span>{Math.floor(durationRange[1] / 60)}h {durationRange[1] % 60}m</span>
          </div>
        </FilterSection>

        {/* Airlines */}
        {airlineOptions.length > 0 && (
          <FilterSection title="Airlines" defaultOpen={false}>
            <div className="flex gap-2 mb-2">
              <button onClick={() => {
                const all: Record<string, boolean> = {};
                airlineOptions.forEach((a) => { all[a.code] = true; });
                set("airlines", all);
              }} className="text-xs text-primary underline underline-offset-2">Select all</button>
              <span className="text-muted-foreground text-xs">·</span>
              <button onClick={() => {
                const none: Record<string, boolean> = {};
                airlineOptions.forEach((a) => { none[a.code] = false; });
                set("airlines", none);
              }} className="text-xs text-muted-foreground underline underline-offset-2">Clear all</button>
            </div>
            <div className="space-y-0.5 max-h-56 overflow-y-auto">
              {airlineOptions.map((a) => (
                <CheckRow key={a.code}
                  checked={filters.airlines[a.code] ?? true}
                  onChange={(v) => set("airlines", { ...filters.airlines, [a.code]: v })}
                  label={a.name}
                  sub={`from £${Math.floor(a.minPrice)}`} />
              ))}
            </div>
          </FilterSection>
        )}
      </div>
    </div>
  );
}

// ── Date Price Strip ───────────────────────────────────────────────────────────
function DatePriceStrip({
  centerDate,
  flights,
  onShift,
}: {
  centerDate: string;
  flights: FlightOffer[];
  onShift: (days: number) => void;
}) {
  const dates = [-3, -2, -1, 0, 1, 2, 3].map((d) => shiftDate(centerDate, d));
  const cheapestPrice = flights.length > 0
    ? Math.floor(parseFloat([...flights].sort((a, b) => parseFloat(a.price.grandTotal) - parseFloat(b.price.grandTotal))[0].price.grandTotal))
    : null;

  return (
    <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
      {dates.map((d, i) => {
        const offset = i - 3;
        const isCenter = offset === 0;
        const label = format(parseISO(d), "EEE d");
        return (
          <button
            key={d}
            onClick={() => onShift(offset)}
            className={cn(
              "flex-1 min-w-[80px] flex flex-col items-center py-2 px-1 border-b-2 transition-all text-center",
              isCenter
                ? "border-primary bg-primary/5"
                : "border-transparent hover:bg-secondary"
            )}
          >
            <span className={cn("text-xs font-semibold", isCenter ? "text-primary" : "text-muted-foreground")}>{label}</span>
            {isCenter && cheapestPrice != null ? (
              <span className="text-sm font-black text-primary mt-0.5">£{cheapestPrice}</span>
            ) : (
              <span className="text-[10px] text-muted-foreground mt-0.5">—</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Travellers Edit Popover ────────────────────────────────────────────────────
function TravellersPopover({
  adults, children: childCount, cabin,
  onApply,
}: {
  adults: number; children: number; cabin: string;
  onApply: (a: number, c: number, cab: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [a, setA] = useState(adults);
  const [c, setC] = useState(childCount);
  const [cab, setCab] = useState(cabin);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const cabinOptions = [
    { value: "ECONOMY", label: "Economy" },
    { value: "PREMIUM_ECONOMY", label: "Premium Economy" },
    { value: "BUSINESS", label: "Business" },
    { value: "FIRST", label: "First Class" },
  ];
  const cabinMap: Record<string, string> = { ECONOMY: "Economy", PREMIUM_ECONOMY: "Premium Economy", BUSINESS: "Business", FIRST: "First Class" };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setA(adults); setC(childCount); setCab(cabin); setOpen(!open); }}
        className="flex items-center gap-1.5 bg-secondary hover:bg-muted rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors"
      >
        <Users className="w-3.5 h-3.5 text-muted-foreground" />
        {adults + childCount} traveller{adults + childCount !== 1 ? "s" : ""} · {cabinMap[cabin.toUpperCase().replace(" ", "_")] || cabin}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 z-50 bg-card border border-border rounded-2xl shadow-2xl p-4 w-72"
          >
            {/* Adults */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="text-sm font-semibold text-foreground">Adults</p>
                <p className="text-xs text-muted-foreground">Age 16+</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setA(Math.max(1, a - 1))}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30"
                  disabled={a <= 1}>
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold text-foreground w-4 text-center">{a}</span>
                <button onClick={() => setA(Math.min(9, a + 1))}
                  className="w-8 h-8 rounded-full border border-primary bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors disabled:opacity-30"
                  disabled={a >= 9}>
                  <Plus className="w-3.5 h-3.5 text-primary" />
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="text-sm font-semibold text-foreground">Children</p>
                <p className="text-xs text-muted-foreground">Age 2–15</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setC(Math.max(0, c - 1))}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30"
                  disabled={c <= 0}>
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold text-foreground w-4 text-center">{c}</span>
                <button onClick={() => setC(Math.min(8, c + 1))}
                  className="w-8 h-8 rounded-full border border-primary bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors disabled:opacity-30"
                  disabled={c >= 8}>
                  <Plus className="w-3.5 h-3.5 text-primary" />
                </button>
              </div>
            </div>

            {/* Cabin class */}
            <div className="py-3">
              <p className="text-sm font-semibold text-foreground mb-2">Cabin class</p>
              <div className="grid grid-cols-2 gap-1.5">
                {cabinOptions.map((opt) => (
                  <button key={opt.value} onClick={() => setCab(opt.value)}
                    className={cn(
                      "py-2 px-3 rounded-xl text-xs font-semibold text-left transition-colors border",
                      cab === opt.value
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-secondary border-border text-foreground hover:border-primary/40"
                    )}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { onApply(a, c, cab); setOpen(false); }}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors mt-1"
            >
              Apply
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
const cabinMap: Record<string, string> = {
  ECONOMY: "Economy", PREMIUM_ECONOMY: "Premium Economy",
  BUSINESS: "Business", FIRST: "First Class",
};

const FlightResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const depart = searchParams.get("depart") || "";
  const returnDate = searchParams.get("return") || "";
  const adults = parseInt(searchParams.get("adults") || "1");
  const children = parseInt(searchParams.get("children") || "0");
  const cabin = searchParams.get("cabin") || "ECONOMY";
  const direct = searchParams.get("direct") === "true";

  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"price" | "duration" | "stops">("price");
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [editSearchOpen, setEditSearchOpen] = useState(false);

  // Inline edit form state
  const [editFrom, setEditFrom] = useState(from);
  const [editFromIata, setEditFromIata] = useState(from);
  const [editTo, setEditTo] = useState(to);
  const [editToIata, setEditToIata] = useState(to);
  const [editDepart, setEditDepart] = useState<Date | undefined>(() => { try { return depart ? parseISO(depart) : undefined; } catch { return undefined; } });
  const [editReturn, setEditReturn] = useState<Date | undefined>(() => { try { return returnDate ? parseISO(returnDate) : undefined; } catch { return undefined; } });
  const [editAdults, setEditAdults] = useState(adults);
  const [editCalOpen, setEditCalOpen] = useState(false);
  const editDepartBtnRef = useRef<HTMLButtonElement>(null);
  const [editCalTop, setEditCalTop] = useState(0);
  const [editCalLeft, setEditCalLeft] = useState(0);

  const openEditCal = useCallback(() => {
    if (editDepartBtnRef.current) {
      const r = editDepartBtnRef.current.getBoundingClientRect();
      const calH = 480;
      const spaceBelow = window.innerHeight - r.bottom - 8;
      const top = spaceBelow >= calH ? r.bottom + 6 : Math.max(8, r.top - calH - 6);
      setEditCalTop(top);
      setEditCalLeft(Math.max(8, Math.min(r.left, window.innerWidth - 680)));
    }
    setEditCalOpen(true);
  }, []);

  const handleEditSearch = () => {
    if (!editFromIata || !editToIata || !editDepart) return;
    const newParams = new URLSearchParams({
      from: editFromIata.toUpperCase(),
      to: editToIata.toUpperCase(),
      depart: format(editDepart, "yyyy-MM-dd"),
      adults: String(editAdults),
      children: String(children),
      cabin,
      direct: String(direct),
    });
    if (editReturn) newParams.set("return", format(editReturn, "yyyy-MM-dd"));
    setEditSearchOpen(false);
    setEditCalOpen(false);
    setSearchParams(newParams);
  };

  const [filters, setFilters] = useState<FilterState>({
    stopsDirect: true, stopsOne: true, stopsTwo: true,
    maxPrice: 99999,
    outboundTimeMax: 1439, returnTimeMax: 1439,
    maxDuration: 99999,
    airlines: {},
    baggageCabin: false, baggageChecked: false,
  });

  const shiftDates = (days: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (depart) newParams.set("depart", shiftDate(depart, days));
    if (returnDate) newParams.set("return", shiftDate(returnDate, days));
    setSearchParams(newParams);
  };

  useEffect(() => {
    if (!from || !to || !depart) { setError("Missing search parameters."); setLoading(false); return; }
    const fetch_ = async () => {
      setLoading(true); setError(null); setSelectedOfferId(null);
      try {
        const { data, error: fnError } = await supabase.functions.invoke("amadeus-flight-search", {
          body: {
            originLocationCode: from.toUpperCase(), destinationLocationCode: to.toUpperCase(),
            departureDate: depart, returnDate: returnDate || undefined,
            adults, children,
            travelClass: cabin.toUpperCase().replace(" ", "_"),
            nonStop: direct, currencyCode: "GBP", max: 30,
          },
        });
        if (fnError) throw new Error(fnError.message);
        if (data?.error) throw new Error(data.error);
        const results: FlightOffer[] = data?.data || [];
        setFlights(results);
        if (results.length > 0) {
          const prices = results.map((f) => parseFloat(f.price.grandTotal));
          const durs = results.map((f) => parseDurationMinutes(f.itineraries[0].duration));
          const codes: Record<string, boolean> = {};
          results.forEach((f) => { codes[f.validatingAirlineCodes[0]] = true; });
          setFilters((prev) => ({
            ...prev,
            maxPrice: Math.ceil(Math.max(...prices)),
            maxDuration: Math.ceil(Math.max(...durs)),
            airlines: codes,
          }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch flights");
      } finally { setLoading(false); }
    };
    fetch_();
  }, [from, to, depart, returnDate, adults, children, cabin, direct]);

  const { priceRange, durationRange, airlineOptions } = useMemo(() => {
    if (!flights.length) return { priceRange: [0, 9999] as [number, number], durationRange: [0, 1440] as [number, number], airlineOptions: [] };
    const prices = flights.map((f) => parseFloat(f.price.grandTotal));
    const durs = flights.map((f) => parseDurationMinutes(f.itineraries[0].duration));
    const airlineMin: Record<string, number> = {};
    flights.forEach((f) => {
      const code = f.validatingAirlineCodes[0];
      const p = parseFloat(f.price.grandTotal);
      if (!airlineMin[code] || p < airlineMin[code]) airlineMin[code] = p;
    });
    return {
      priceRange: [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))] as [number, number],
      durationRange: [Math.floor(Math.min(...durs)), Math.ceil(Math.max(...durs))] as [number, number],
      airlineOptions: Object.entries(airlineMin)
        .map(([code, minPrice]) => ({ code, name: airlineNames[code] || code, minPrice }))
        .sort((a, b) => a.minPrice - b.minPrice),
    };
  }, [flights]);

  // Stop-based minimum prices
  const stopPrices = useMemo(() => {
    const direct: number[] = [];
    const one: number[] = [];
    const two: number[] = [];
    flights.forEach((f) => {
      const stops = f.itineraries[0].segments.length - 1;
      const p = parseFloat(f.price.grandTotal);
      if (stops === 0) direct.push(p);
      else if (stops === 1) one.push(p);
      else two.push(p);
    });
    return {
      direct: direct.length ? Math.floor(Math.min(...direct)) : null,
      one: one.length ? Math.floor(Math.min(...one)) : null,
      two: two.length ? Math.floor(Math.min(...two)) : null,
    };
  }, [flights]);

  const sorted = useMemo(() => {
    return [...flights]
      .filter((f) => {
        const stops = f.itineraries[0].segments.length - 1;
        if (stops === 0 && !filters.stopsDirect) return false;
        if (stops === 1 && !filters.stopsOne) return false;
        if (stops >= 2 && !filters.stopsTwo) return false;
        if (parseFloat(f.price.grandTotal) > filters.maxPrice) return false;
        if (parseDurationMinutes(f.itineraries[0].duration) > filters.maxDuration) return false;
        const outMins = timeToMinutes(f.itineraries[0].segments[0].departure.at);
        if (outMins > filters.outboundTimeMax) return false;
        if (filters.airlines[f.validatingAirlineCodes[0]] === false) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price") return parseFloat(a.price.grandTotal) - parseFloat(b.price.grandTotal);
        if (sortBy === "duration") return parseDurationMinutes(a.itineraries[0].duration) - parseDurationMinutes(b.itineraries[0].duration);
        return (a.itineraries[0].segments.length - 1) - (b.itineraries[0].segments.length - 1);
      });
  }, [flights, filters, sortBy]);

  const cheapest = sorted.length > 0 ? Math.floor(parseFloat(sorted[0].price.grandTotal)) : null;
  const fastest = useMemo(() => {
    if (!flights.length) return null;
    const f = [...flights].sort((a, b) => parseDurationMinutes(a.itineraries[0].duration) - parseDurationMinutes(b.itineraries[0].duration))[0];
    return Math.floor(parseFloat(f.price.grandTotal));
  }, [flights]);

  const sidebar = (
    <FilterSidebar
      filters={filters} setFilters={setFilters}
      priceRange={priceRange} durationRange={durationRange}
      airlineOptions={airlineOptions}
      hasReturn={!!returnDate}
      stopPrices={stopPrices}
      onClose={() => setShowMobileFilters(false)}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">

        {/* ── Sticky search summary bar ── */}
        <div className="bg-card border-b border-border sticky top-16 z-30 shadow-sm">
          {/* Date price strip (below sticky bar) */}
          {!loading && !error && flights.length > 0 && depart && (
            <div className="border-b border-border bg-background">
              <div className="max-w-[1400px] mx-auto px-2">
                <DatePriceStrip
                  centerDate={depart}
                  flights={flights}
                  onShift={(days) => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set("depart", shiftDate(depart, days));
                    if (returnDate) newParams.set("return", shiftDate(returnDate, days));
                    setSearchParams(newParams);
                  }}
                />
              </div>
            </div>
          )}

          {/* Main pill row */}
          <div className="max-w-[1400px] mx-auto px-2 py-2 flex items-center gap-2 flex-wrap">
            {/* Route pill */}
            <button onClick={() => setEditSearchOpen(true)}
              className="flex items-center gap-2 bg-secondary hover:bg-muted rounded-xl px-4 py-2 text-sm font-bold text-foreground transition-colors">
              <span>{from.toUpperCase()}</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{to.toUpperCase()}</span>
            </button>

            {/* Depart with arrows */}
            {depart && (
              <div className="flex items-center bg-secondary rounded-xl overflow-hidden">
                <button onClick={() => shiftDates(-1)}
                  className="px-2 py-2 hover:bg-muted transition-colors">
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <span className="text-sm font-semibold text-foreground px-1">{formatDateShort(depart)}</span>
                <button onClick={() => shiftDates(1)}
                  className="px-2 py-2 hover:bg-muted transition-colors">
                  <ChevronDown className="w-4 h-4 text-muted-foreground rotate-[-90deg]" />
                </button>
              </div>
            )}

            {/* Return with arrows */}
            {returnDate && (
              <div className="flex items-center bg-secondary rounded-xl overflow-hidden">
                <button onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set("return", shiftDate(returnDate, -1));
                  setSearchParams(newParams);
                }} className="px-2 py-2 hover:bg-muted transition-colors">
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <span className="text-sm font-semibold text-foreground px-1">{formatDateShort(returnDate)}</span>
                <button onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set("return", shiftDate(returnDate, 1));
                  setSearchParams(newParams);
                }} className="px-2 py-2 hover:bg-muted transition-colors">
                  <ChevronDown className="w-4 h-4 text-muted-foreground rotate-[-90deg]" />
                </button>
              </div>
            )}

            {/* Travellers — editable popover */}
            <TravellersPopover
              adults={adults}
              children={children}
              cabin={cabin}
              onApply={(a, c, cab) => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set("adults", String(a));
                newParams.set("children", String(c));
                newParams.set("cabin", cab);
                setSearchParams(newParams);
              }}
            />

            {/* Sort pills — same row, right side */}
            {!loading && !error && flights.length > 0 && (
              <div className="flex items-center gap-1.5 ml-auto">
                {([
                  { key: "price" as const, label: "Cheapest", price: cheapest },
                  { key: "duration" as const, label: "Fastest", price: fastest },
                  { key: "stops" as const, label: "Fewer stops", price: null },
                ]).map((opt) => (
                  <button key={opt.key} onClick={() => setSortBy(opt.key)}
                    className={cn(
                      "flex items-center gap-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-all whitespace-nowrap",
                      sortBy === opt.key
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-card border-border text-foreground hover:bg-secondary"
                    )}>
                    <span>{opt.label}</span>
                    {opt.price != null && (
                      <span className={cn("font-bold text-xs", sortBy === opt.key ? "text-primary" : "text-muted-foreground")}>
                        £{opt.price}
                      </span>
                    )}
                  </button>
                ))}
                <button onClick={() => setEditSearchOpen(true)} className="text-sm font-semibold text-primary hover:text-primary/80 pl-2">
                  Edit search
                </button>
              </div>
            )}

            {/* Edit search fallback (when no flights yet) */}
            {(loading || error || flights.length === 0) && (
              <button onClick={() => setEditSearchOpen(true)} className="ml-auto text-sm font-semibold text-primary hover:text-primary/80">
                Edit search
              </button>
            )}
          </div>
        </div>

        {/* ── Body: sidebar + results + ad column ── */}
        <div className="max-w-[1400px] mx-auto px-2 py-5">
          <div className="flex gap-4 items-start">

            {/* Sidebar desktop */}
            <aside className="hidden lg:block w-56 shrink-0 sticky top-[8.5rem] max-h-[calc(100vh-8.5rem)] overflow-y-auto">
              {sidebar}
            </aside>

            {/* Results column */}
            <div className="flex-1 min-w-0">
              {loading && (
                <div className="flex flex-col items-center justify-center py-32 gap-5">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <Plane className="w-5 h-5 text-primary absolute inset-0 m-auto" />
                  </div>
                  <div className="text-center">
                    <p className="text-foreground font-semibold text-lg">{from.toUpperCase()} → {to.toUpperCase()}</p>
                    <p className="text-muted-foreground text-sm mt-1">Searching all airlines for the best fares…</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="text-foreground font-semibold text-lg">Search failed</p>
                  <p className="text-muted-foreground text-sm max-w-sm">{error}</p>
                  <button onClick={() => navigate(-1)}
                    className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
                    Go back and try again
                  </button>
                </div>
              )}

              {!loading && !error && sorted.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Plane className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-semibold text-lg">No flights found</p>
                  <p className="text-muted-foreground text-sm max-w-sm">Try adjusting the filters or searching different dates.</p>
                </div>
              )}

              {!loading && !error && sorted.length > 0 && (
                <>
                  <p className="text-sm text-muted-foreground mb-3 font-medium">
                    {sorted.length} result{sorted.length !== 1 ? "s" : ""}
                  </p>
                  <div className="space-y-2">
                    {sorted.map((offer, i) => (
                      <>
                        <FlightCard key={offer.id} offer={offer} index={i}
                          from={from} to={to} depart={depart} returnDate={returnDate}
                          adults={adults} children={children} cabin={cabin}
                          isExpanded={selectedOfferId === offer.id}
                          onToggle={() => setSelectedOfferId((p) => p === offer.id ? null : offer.id)}
                        />
                        {/* Ad slot every 5 results */}
                        {(i + 1) % 5 === 0 && i < sorted.length - 1 && (
                          <div key={`ad-${i}`} className="rounded-2xl border border-dashed border-border bg-secondary/30 flex items-center justify-center h-20 text-xs text-muted-foreground/50 font-medium tracking-wider uppercase select-none">
                            Advertisement
                          </div>
                        )}
                      </>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right ad column */}
            <div className="hidden xl:flex flex-col gap-4 w-[300px] shrink-0 sticky top-[8.5rem]">
              {/* Top ad slot */}
              <div className="rounded-2xl border border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center h-[250px] text-xs text-muted-foreground/50 font-medium tracking-wider uppercase select-none">
                <span>Advertisement</span>
                <span className="mt-1 text-[10px]">300 × 250</span>
              </div>
              {/* Tall ad slot */}
              <div className="rounded-2xl border border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center h-[600px] text-xs text-muted-foreground/50 font-medium tracking-wider uppercase select-none">
                <span>Advertisement</span>
                <span className="mt-1 text-[10px]">300 × 600</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Inline search edit overlay — Skyscanner-style ── */}
      <AnimatePresence>
        {editSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => { setEditSearchOpen(false); setEditCalOpen(false); }}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-full max-w-3xl mx-auto px-4"
            >
              <div className="bg-[hsl(var(--background))] rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Plane className="w-5 h-5 text-primary" />
                    <span className="font-bold text-foreground text-base">Edit your search</span>
                  </div>
                  <button onClick={() => { setEditSearchOpen(false); setEditCalOpen(false); }}
                    className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  {/* From / swap / To — full-width horizontal like Skyscanner */}
                  <div className="flex items-stretch gap-0 rounded-xl border border-border overflow-hidden">
                    <div className="flex-1 min-w-0">
                      <AirportAutocompleteInput
                        label="From"
                        placeholder="City or airport"
                        value={editFrom}
                        onChange={(v) => { setEditFrom(v); if (!v) setEditFromIata(""); }}
                        onSelect={(iata, display) => { setEditFrom(display); setEditFromIata(iata); }}
                      />
                    </div>
                    <div className="w-px bg-border" />
                    <button
                      type="button"
                      onClick={() => {
                        const tmpLabel = editFrom; const tmpIata = editFromIata;
                        setEditFrom(editTo); setEditFromIata(editToIata);
                        setEditTo(tmpLabel); setEditToIata(tmpIata);
                      }}
                      className="w-10 shrink-0 flex items-center justify-center bg-card hover:bg-secondary transition-colors border-x border-border"
                    >
                      <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                    </button>
                    <div className="w-px bg-border" />
                    <div className="flex-1 min-w-0">
                      <AirportAutocompleteInput
                        label="To"
                        placeholder="City or airport"
                        value={editTo}
                        onChange={(v) => { setEditTo(v); if (!v) setEditToIata(""); }}
                        onSelect={(iata, display) => { setEditTo(display); setEditToIata(iata); }}
                      />
                    </div>
                  </div>

                  {/* Dates + Adults row */}
                  <div className="flex gap-3">
                    <button
                      ref={editDepartBtnRef}
                      type="button"
                      onClick={openEditCal}
                      className="flex-1 flex flex-col items-start border border-border rounded-xl px-4 py-3 bg-card hover:bg-secondary transition-colors text-left"
                    >
                      <span className="text-xs text-muted-foreground font-semibold">Depart</span>
                      <span className={cn("text-sm font-bold mt-0.5", editDepart ? "text-foreground" : "text-muted-foreground")}>
                        {editDepart ? format(editDepart, "EEE, d MMM yyyy") : "Add date"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={openEditCal}
                      className="flex-1 flex flex-col items-start border border-border rounded-xl px-4 py-3 bg-card hover:bg-secondary transition-colors text-left"
                    >
                      <span className="text-xs text-muted-foreground font-semibold">Return</span>
                      <span className={cn("text-sm font-bold mt-0.5", editReturn ? "text-foreground" : "text-muted-foreground")}>
                        {editReturn ? format(editReturn, "EEE, d MMM yyyy") : "No return"}
                      </span>
                    </button>
                    {/* Adults counter */}
                    <div className="flex flex-col border border-border rounded-xl px-4 py-3 bg-card gap-1">
                      <span className="text-xs text-muted-foreground font-semibold">Adults</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <button type="button" onClick={() => setEditAdults(Math.max(1, editAdults - 1))}
                          className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30"
                          disabled={editAdults <= 1}>
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold text-foreground w-4 text-center">{editAdults}</span>
                        <button type="button" onClick={() => setEditAdults(Math.min(9, editAdults + 1))}
                          className="w-6 h-6 rounded-full border border-primary bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors disabled:opacity-30"
                          disabled={editAdults >= 9}>
                          <Plus className="w-3 h-3 text-primary" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Search button */}
                  <button
                    type="button"
                    onClick={handleEditSearch}
                    disabled={!editFromIata || !editToIata || !editDepart}
                    className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    Search flights
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Calendar portal inside overlay */}
            {editCalOpen && createPortal(
              <div
                id="edit-cal-portal"
                style={{ position: "fixed", top: editCalTop, left: editCalLeft, zIndex: 99999 }}
                onClick={(e) => e.stopPropagation()}
              >
                <RangeDatePickerCalendar
                  departDate={editDepart}
                  returnDate={editReturn}
                  onDepartChange={(d) => { setEditDepart(d); setEditReturn(undefined); }}
                  onReturnChange={(d) => setEditReturn(d)}
                  onApply={() => setEditCalOpen(false)}
                  hint="Select return date (optional)"
                />
              </div>,
              document.body
            )}
          </>
        )}
      </AnimatePresence>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setShowMobileFilters(false)} />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-72 bg-background z-50 shadow-2xl lg:hidden overflow-y-auto">
              {sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default FlightResults;
