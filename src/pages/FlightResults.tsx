import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Plane, Clock, ArrowLeftRight, Filter,
  AlertCircle, Loader2, ChevronDown, Globe, Sparkles, Search,
  SlidersHorizontal, ChevronRight, Info, X,
} from "lucide-react";
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
interface FlightItinerary {
  duration: string;
  segments: FlightSegment[];
}
interface FlightOffer {
  id: string;
  itineraries: FlightItinerary[];
  price: { total: string; currency: string; grandTotal: string };
  numberOfBookableSeats: number;
  validatingAirlineCodes: string[];
}
interface BookingLink {
  label: string;
  sublabel: string;
  url: string;
  icon: "skyscanner" | "kiwi" | "google" | "airline";
}

// ── Static data ────────────────────────────────────────────────────────────────
const airlineNames: Record<string, string> = {
  FR: "Ryanair", U2: "easyJet", W9: "Wizz Air", BA: "British Airways",
  EK: "Emirates", LH: "Lufthansa", AF: "Air France", KL: "KLM",
  IB: "Iberia", VY: "Vueling", LS: "Jet2", TOM: "TUI Airways",
  AA: "American Airlines", DL: "Delta", UA: "United Airlines", QR: "Qatar Airways",
  EY: "Etihad", SQ: "Singapore Airlines", CX: "Cathay Pacific", TK: "Turkish Airlines",
  DY: "Norwegian", SK: "SAS", AY: "Finnair", OS: "Austrian",
  LX: "Swiss", SN: "Brussels Airlines", TP: "TAP Air Portugal",
};

const airlineLogoUrl = (code: string) =>
  `https://www.gstatic.com/flights/airline_logos/70px/${code}.png`;

const directAirlineUrls: Record<string, string> = {
  FR: "https://www.ryanair.com/gb/en/trip/flights/select",
  U2: "https://www.easyjet.com/en/",
  BA: "https://www.britishairways.com/travel/book/public/en_gb",
  KL: "https://www.klm.com/en/",
  AF: "https://www.airfrance.co.uk/",
  LH: "https://www.lufthansa.com/gb/en/homepage",
  IB: "https://www.iberia.com/",
  VY: "https://www.vueling.com/en",
  TK: "https://www.turkishairlines.com/",
  QR: "https://www.qatarairways.com/",
  EK: "https://www.emirates.com/",
  EY: "https://www.etihad.com/",
  SQ: "https://www.singaporeair.com/",
};

const cabinSkyscanner: Record<string, string> = {
  ECONOMY: "economy", PREMIUM_ECONOMY: "premiumeconomy",
  BUSINESS: "business", FIRST: "first",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function toSkyscannerDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return y.slice(2) + m + d;
}
function toKiwiDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}
function parseDuration(iso: string) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  const h = parseInt(m?.[1] || "0");
  const min = parseInt(m?.[2] || "0");
  return h ? `${h}h ${min}m` : `${min}m`;
}
function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function formatDateLong(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function buildBookingLinks(
  from: string, to: string, depart: string, returnDate: string,
  adults: number, children: number, cabin: string, carrierCode: string,
): BookingLink[] {
  const depSS = toSkyscannerDate(depart);
  const retSS = returnDate ? toSkyscannerDate(returnDate) : "";
  const depKiwi = toKiwiDate(depart);
  const retKiwi = returnDate ? toKiwiDate(returnDate) : "";
  const cabinSS = cabinSkyscanner[cabin.toUpperCase().replace(" ", "_")] || "economy";

  const ssBase = returnDate
    ? `https://www.skyscanner.net/transport/flights/${from}/${to}/${depSS}/${retSS}/`
    : `https://www.skyscanner.net/transport/flights/${from}/${to}/${depSS}/`;
  const ssUrl = `${ssBase}?adults=${adults}&children=${children}&cabinclass=${cabinSS}`;
  const kiwiBase = returnDate
    ? `https://www.kiwi.com/en/search/results/${from}/${to}/${depKiwi}/${retKiwi}`
    : `https://www.kiwi.com/en/search/results/${from}/${to}/${depKiwi}`;
  const kiwiUrl = `${kiwiBase}?adults=${adults}&children=${children}`;
  const googleUrl = `https://www.google.com/travel/flights?q=Flights+from+${from}+to+${to}`;

  const links: BookingLink[] = [
    { label: "Kiwi.com", sublabel: "Best fare finder", url: kiwiUrl, icon: "kiwi" },
    { label: "Google Flights", sublabel: "Price overview", url: googleUrl, icon: "google" },
    { label: "Skyscanner", sublabel: "Compare & book", url: ssUrl, icon: "skyscanner" },
  ];

  if (directAirlineUrls[carrierCode]) {
    links.unshift({
      label: airlineNames[carrierCode] || carrierCode,
      sublabel: "Book direct",
      url: directAirlineUrls[carrierCode],
      icon: "airline",
    });
  }
  return links;
}

// ── Stop dot timeline ──────────────────────────────────────────────────────────
function StopDots({ stops }: { stops: number }) {
  if (stops === 0) return null;
  return (
    <div className="flex items-center gap-0.5 justify-center my-0.5">
      {Array.from({ length: stops }).map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
      ))}
    </div>
  );
}

// ── Airline Logo ───────────────────────────────────────────────────────────────
function AirlineLogo({ code, name }: { code: string; name: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border shrink-0">
        {code.slice(0, 2)}
      </div>
    );
  }
  return (
    <img
      src={airlineLogoUrl(code)}
      alt={name}
      className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 border border-border shrink-0"
      onError={() => setErr(true)}
    />
  );
}

// ── Itinerary Row ──────────────────────────────────────────────────────────────
function ItineraryRow({ itinerary, label }: { itinerary: FlightItinerary; label?: string }) {
  const first = itinerary.segments[0];
  const last = itinerary.segments[itinerary.segments.length - 1];
  const stops = itinerary.segments.length - 1;

  return (
    <div className="flex items-center gap-4 flex-1 min-w-0">
      {/* Depart time + code */}
      <div className="text-center shrink-0 w-16">
        <p className="text-lg font-bold text-foreground leading-tight">{formatTime(first.departure.at)}</p>
        <p className="text-xs text-muted-foreground font-medium">{first.departure.iataCode}</p>
      </div>

      {/* Duration + line */}
      <div className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
        <p className="text-xs text-muted-foreground">{parseDuration(itinerary.duration)}</p>
        <div className="relative w-full flex items-center">
          <div className="h-px w-full bg-border" />
          {stops === 0 ? (
            <Plane className="absolute left-1/2 -translate-x-1/2 w-3 h-3 text-muted-foreground/60 rotate-90 bg-card" />
          ) : (
            <div className="absolute left-1/2 -translate-x-1/2 flex gap-0.5 bg-card px-0.5">
              {Array.from({ length: stops }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full border-2 border-warning bg-white" />
              ))}
            </div>
          )}
        </div>
        <p className={`text-xs font-semibold ${stops === 0 ? "text-success" : "text-warning"}`}>
          {stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Arrive time + code */}
      <div className="text-center shrink-0 w-16">
        <p className="text-lg font-bold text-foreground leading-tight">{formatTime(last.arrival.at)}</p>
        <p className="text-xs text-muted-foreground font-medium">{last.arrival.iataCode}</p>
      </div>
    </div>
  );
}

// ── Booking Panel ──────────────────────────────────────────────────────────────
function BookingPanel({ links }: { links: BookingLink[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18 }}
      className="overflow-hidden"
    >
      <div className="border-t border-border mt-4 pt-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Choose where to book
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-secondary/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              {link.icon === "airline" && <Plane className="w-4 h-4 text-primary" />}
              {link.icon === "kiwi" && <Sparkles className="w-4 h-4 text-success" />}
              {link.icon === "google" && <Search className="w-4 h-4 text-primary" />}
              {link.icon === "skyscanner" && <Globe className="w-4 h-4 text-teal" />}
              <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{link.label}</span>
              <span className="text-[10px] text-muted-foreground text-center">{link.sublabel}</span>
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Flight Card ────────────────────────────────────────────────────────────────
function FlightCard({
  offer, index, from, to, depart, returnDate, adults, children, cabin,
  isExpanded, onToggle,
}: {
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
  const bookingLinks = buildBookingLinks(from, to, depart, returnDate, adults, children, cabin, carrierCode);
  const outStops = outbound.segments.length - 1;
  const firstSeg = outbound.segments[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025, duration: 0.25 }}
      className={`bg-card border rounded-2xl overflow-hidden transition-all ${isExpanded ? "border-primary/40 shadow-elevated" : "border-border hover:border-border/80 hover:shadow-card"}`}
    >
      {/* Main card row */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={onToggle}
      >
        {/* Airline logo + name */}
        <div className="flex flex-col items-center gap-1 shrink-0 w-14 text-center">
          <AirlineLogo code={carrierCode} name={airline} />
          <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{airline}</p>
        </div>

        {/* Itineraries */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <ItineraryRow itinerary={outbound} label="Outbound" />
          {inbound && (
            <div className="pt-2 border-t border-border/60">
              <ItineraryRow itinerary={inbound} label="Return" />
            </div>
          )}
        </div>

        {/* Price + CTA */}
        <div className="shrink-0 flex flex-col items-end gap-2 ml-2">
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground leading-tight">
              {/* Show in primary color */}
              <span className="text-primary">{/* formatPrice will handle currency */}</span>
              £{priceGBP.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">per person</p>
          </div>
          {offer.numberOfBookableSeats <= 5 && (
            <p className="text-[10px] font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded-full">
              {offer.numberOfBookableSeats} seats left
            </p>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              isExpanded
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            Select
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
          </button>
          <PriceAlertButton
            from={from} to={to} depart={depart}
            returnDate={returnDate || undefined}
            adults={adults} cabin={cabin} currentPrice={priceGBP}
          />
        </div>
      </div>

      {/* Booking panel */}
      <AnimatePresence>
        {isExpanded && (
          <div className="px-4 pb-4">
            <BookingPanel links={bookingLinks} />
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Filter Sidebar ─────────────────────────────────────────────────────────────
function FilterSidebar({
  filterDirect, setFilterDirect,
  maxPrice, setMaxPrice,
  priceRange,
  onClose,
}: {
  filterDirect: boolean;
  setFilterDirect: (v: boolean) => void;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  priceRange: [number, number];
  onClose?: () => void;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground text-sm">Filters</h2>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Stops */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Stops</p>
        <div className="space-y-2">
          {[
            { label: "Direct only", value: true },
            { label: "Any", value: false },
          ].map(({ label, value }) => (
            <label key={label} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  filterDirect === value ? "border-primary bg-primary" : "border-border group-hover:border-primary/50"
                }`}
                onClick={() => setFilterDirect(value)}
              >
                {filterDirect === value && <div className="w-2 h-2 rounded-sm bg-white" />}
              </div>
              <span className="text-sm text-foreground">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Max price: <span className="text-foreground font-bold">£{maxPrice}</span>
        </p>
        <input
          type="range"
          min={priceRange[0]}
          max={priceRange[1]}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>£{priceRange[0]}</span>
          <span>£{priceRange[1]}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
const cabinMap: Record<string, string> = {
  ECONOMY: "Economy", PREMIUM_ECONOMY: "Premium Economy",
  BUSINESS: "Business", FIRST: "First Class",
};

const FlightResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

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
  const [filterDirect, setFilterDirect] = useState(direct);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(9999);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (!from || !to || !depart) {
      setError("Missing search parameters. Please go back and search again.");
      setLoading(false);
      return;
    }
    const fetchFlights = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fnError } = await supabase.functions.invoke("amadeus-flight-search", {
          body: {
            originLocationCode: from.toUpperCase(),
            destinationLocationCode: to.toUpperCase(),
            departureDate: depart,
            returnDate: returnDate || undefined,
            adults, children,
            travelClass: cabin.toUpperCase().replace(" ", "_"),
            nonStop: direct,
            currencyCode: "GBP",
            max: 30,
          },
        });
        if (fnError) throw new Error(fnError.message);
        if (data?.error) throw new Error(data.error);
        const results: FlightOffer[] = data?.data || [];
        setFlights(results);
        if (results.length > 0) {
          const prices = results.map((f) => parseFloat(f.price.grandTotal));
          setMaxPrice(Math.ceil(Math.max(...prices)));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch flights");
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [from, to, depart, returnDate, adults, children, cabin, direct]);

  const prices = flights.map((f) => parseFloat(f.price.grandTotal));
  const priceRange: [number, number] = prices.length > 0
    ? [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
    : [0, 9999];

  const sorted = [...flights]
    .filter((f) => {
      if (filterDirect && !f.itineraries.every((it) => it.segments.length === 1)) return false;
      if (parseFloat(f.price.grandTotal) > maxPrice) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price") return parseFloat(a.price.grandTotal) - parseFloat(b.price.grandTotal);
      if (sortBy === "duration") return a.itineraries[0].duration.localeCompare(b.itineraries[0].duration);
      return (a.itineraries[0].segments.length - 1) - (b.itineraries[0].segments.length - 1);
    });

  const cheapest = sorted.length > 0 ? parseFloat(sorted[0].price.grandTotal) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">

        {/* ── Sticky search summary bar (Skyscanner-style) ── */}
        <div className="bg-card border-b border-border sticky top-16 z-30 shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-secondary hover:bg-muted rounded-xl px-4 py-2 text-sm font-semibold text-foreground transition-colors"
            >
              <span className="font-bold">{from.toUpperCase()}</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-bold">{to.toUpperCase()}</span>
            </button>

            <div className="flex items-center gap-1 bg-secondary rounded-xl px-4 py-2 text-sm text-foreground">
              <Clock className="w-3.5 h-3.5 text-muted-foreground mr-1" />
              <span>{depart ? formatDateLong(depart) : "–"}</span>
              {returnDate && (
                <>
                  <span className="text-muted-foreground mx-1">→</span>
                  <span>{formatDateLong(returnDate)}</span>
                </>
              )}
            </div>

            <div className="bg-secondary rounded-xl px-4 py-2 text-sm text-foreground">
              {adults + children} traveller{adults + children !== 1 ? "s" : ""} · {cabinMap[cabin.toUpperCase().replace(" ", "_")] || cabin}
            </div>

            <button
              onClick={() => navigate(-1)}
              className="ml-auto text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Edit search
            </button>
          </div>
        </div>

        {/* ── Sort bar ── */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-2.5 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">Sort:</span>
            {(["price", "duration", "stops"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  sortBy === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-muted"
                }`}
              >
                {s === "price" && cheapest ? `Cheapest · £${Math.floor(cheapest)}` : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border text-xs font-semibold text-foreground hover:bg-secondary transition-colors lg:hidden"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            </button>
          </div>
        </div>

        {/* ── Body: sidebar + results ── */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6 items-start">

            {/* ── Left sidebar (desktop) ── */}
            <aside className="hidden lg:block w-60 shrink-0 sticky top-36">
              <FilterSidebar
                filterDirect={filterDirect}
                setFilterDirect={setFilterDirect}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                priceRange={priceRange}
              />
            </aside>

            {/* ── Results column ── */}
            <div className="flex-1 min-w-0">

              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-32 gap-5">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <Plane className="w-5 h-5 text-primary absolute inset-0 m-auto" />
                  </div>
                  <div className="text-center">
                    <p className="text-foreground font-semibold text-lg">Searching {from.toUpperCase()} → {to.toUpperCase()}</p>
                    <p className="text-muted-foreground text-sm mt-1">Finding the best fares across all airlines…</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="text-foreground font-semibold text-lg">Search failed</p>
                  <p className="text-muted-foreground text-sm max-w-sm">{error}</p>
                  <button
                    onClick={() => navigate(-1)}
                    className="mt-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
                  >
                    Go back and try again
                  </button>
                </div>
              )}

              {/* No results */}
              {!loading && !error && sorted.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Plane className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-semibold text-lg">No flights found</p>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Try adjusting the filters, different dates, or removing "Direct only".
                  </p>
                </div>
              )}

              {/* Results */}
              {!loading && !error && sorted.length > 0 && (
                <>
                  <p className="text-sm text-muted-foreground mb-4 font-medium">
                    {sorted.length} result{sorted.length !== 1 ? "s" : ""} found
                    {filterDirect && " · Direct only"}
                  </p>
                  <div className="space-y-2.5">
                    {sorted.map((offer, i) => (
                      <FlightCard
                        key={offer.id}
                        offer={offer}
                        index={i}
                        from={from} to={to}
                        depart={depart} returnDate={returnDate}
                        adults={adults} children={children} cabin={cabin}
                        isExpanded={selectedOfferId === offer.id}
                        onToggle={() => setSelectedOfferId((prev) => prev === offer.id ? null : offer.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile filters drawer ── */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-background z-50 p-4 shadow-2xl lg:hidden overflow-y-auto"
            >
              <FilterSidebar
                filterDirect={filterDirect}
                setFilterDirect={setFilterDirect}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                priceRange={priceRange}
                onClose={() => setShowMobileFilters(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default FlightResults;
