import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Plane, Clock, ArrowLeftRight, Filter, AlertCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";

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

const airlineNames: Record<string, string> = {
  FR: "Ryanair", U2: "easyJet", W9: "Wizz Air", BA: "British Airways",
  EK: "Emirates", LH: "Lufthansa", AF: "Air France", KL: "KLM",
  IB: "Iberia", VY: "Vueling", LS: "Jet2", TOM: "TUI Airways",
  AA: "American Airlines", DL: "Delta", UA: "United", QR: "Qatar Airways",
  EY: "Etihad", SQ: "Singapore Airlines", CX: "Cathay Pacific", TK: "Turkish Airlines",
};

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
            adults,
            children,
            travelClass: cabin.toUpperCase().replace(" ", "_"),
            nonStop: direct,
            currencyCode: "GBP",
            max: 30,
          },
        });

        if (fnError) throw new Error(fnError.message);
        if (data?.error) throw new Error(data.error);

        setFlights(data?.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch flights");
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [from, to, depart, returnDate, adults, children, cabin, direct]);

  const sorted = [...flights]
    .filter((f) => {
      if (filterDirect) {
        return f.itineraries.every((it) => it.segments.length === 1);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price") return parseFloat(a.price.grandTotal) - parseFloat(b.price.grandTotal);
      if (sortBy === "duration") {
        const durA = a.itineraries[0].duration;
        const durB = b.itineraries[0].duration;
        return durA.localeCompare(durB);
      }
      // stops
      const stopsA = a.itineraries[0].segments.length - 1;
      const stopsB = b.itineraries[0].segments.length - 1;
      return stopsA - stopsB;
    });

  const cabinMap: Record<string, string> = {
    ECONOMY: "Economy", PREMIUM_ECONOMY: "Premium Economy",
    BUSINESS: "Business", FIRST: "First",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        {/* Search summary bar */}
        <div className="bg-card border-b border-border sticky top-16 z-30">
          <div className="container mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <span>{from.toUpperCase()}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span>{to.toUpperCase()}</span>
            </div>
            <span className="text-muted-foreground text-sm">{formatDate(depart)}{returnDate ? ` – ${formatDate(returnDate)}` : ""}</span>
            <span className="text-muted-foreground text-sm">{adults + children} traveller{adults + children !== 1 ? "s" : ""} · {cabinMap[cabin.toUpperCase().replace(" ", "_")] || cabin}</span>
            <button
              onClick={() => navigate(-1)}
              className="ml-auto text-sm text-primary hover:underline font-medium"
            >
              Modify search
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 pt-6">
          {/* Sort & filter bar */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Sort by:</span>
            </div>
            {(["price", "duration", "stops"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  sortBy === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:bg-secondary"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <button
              onClick={() => setFilterDirect(!filterDirect)}
              className={`ml-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                filterDirect
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:bg-secondary"
              }`}
            >
              Direct only
            </button>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-muted-foreground text-lg">Searching for the best flights…</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <p className="text-foreground font-semibold text-lg">Search failed</p>
              <p className="text-muted-foreground text-sm max-w-md text-center">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Go back and try again
              </button>
            </div>
          )}

          {!loading && !error && sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Plane className="w-12 h-12 text-muted-foreground" />
              <p className="text-foreground font-semibold text-lg">No flights found</p>
              <p className="text-muted-foreground text-sm max-w-md text-center">
                Try different dates, airports, or remove the "direct only" filter.
              </p>
            </div>
          )}

          {!loading && !error && sorted.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground mb-4">{sorted.length} flights found</p>
              <AnimatePresence>
                <div className="space-y-3">
                  {sorted.map((offer, i) => {
                    const outbound = offer.itineraries[0];
                    const inbound = offer.itineraries[1];
                    const firstSeg = outbound.segments[0];
                    const lastSeg = outbound.segments[outbound.segments.length - 1];
                    const stops = outbound.segments.length - 1;
                    const airline = airlineNames[offer.validatingAirlineCodes[0]] || offer.validatingAirlineCodes[0];
                    const priceGBP = parseFloat(offer.price.grandTotal);

                    return (
                      <motion.div
                        key={offer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.3 }}
                        className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-6 flex-wrap">
                          {/* Airline */}
                          <div className="w-32 shrink-0">
                            <p className="font-semibold text-foreground text-sm">{airline}</p>
                            <p className="text-xs text-muted-foreground">{offer.validatingAirlineCodes[0]} {firstSeg.number}</p>
                          </div>

                          {/* Outbound */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="text-center">
                                <p className="text-xl font-bold text-foreground">{formatTime(firstSeg.departure.at)}</p>
                                <p className="text-xs text-muted-foreground">{firstSeg.departure.iataCode}</p>
                              </div>
                              <div className="flex-1 flex flex-col items-center gap-1">
                                <p className="text-xs text-muted-foreground">{parseDuration(outbound.duration)}</p>
                                <div className="flex items-center gap-1 w-full">
                                  <div className="h-px flex-1 bg-border" />
                                  <Plane className="w-3 h-3 text-muted-foreground rotate-90" />
                                  <div className="h-px flex-1 bg-border" />
                                </div>
                                <p className={`text-xs font-medium ${stops === 0 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                                  {stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xl font-bold text-foreground">{formatTime(lastSeg.arrival.at)}</p>
                                <p className="text-xs text-muted-foreground">{lastSeg.arrival.iataCode}</p>
                              </div>
                            </div>

                            {/* Inbound row */}
                            {inbound && (() => {
                              const inFirst = inbound.segments[0];
                              const inLast = inbound.segments[inbound.segments.length - 1];
                              const inStops = inbound.segments.length - 1;
                              return (
                                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                                  <div className="text-center">
                                    <p className="text-base font-semibold text-foreground">{formatTime(inFirst.departure.at)}</p>
                                    <p className="text-xs text-muted-foreground">{inFirst.departure.iataCode}</p>
                                  </div>
                                  <div className="flex-1 flex flex-col items-center gap-1">
                                    <p className="text-xs text-muted-foreground">{parseDuration(inbound.duration)}</p>
                                    <div className="flex items-center gap-1 w-full">
                                      <div className="h-px flex-1 bg-border" />
                                      <ArrowLeftRight className="w-3 h-3 text-muted-foreground" />
                                      <div className="h-px flex-1 bg-border" />
                                    </div>
                                    <p className={`text-xs font-medium ${inStops === 0 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                                      {inStops === 0 ? "Direct" : `${inStops} stop${inStops > 1 ? "s" : ""}`}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-base font-semibold text-foreground">{formatTime(inLast.arrival.at)}</p>
                                    <p className="text-xs text-muted-foreground">{inLast.arrival.iataCode}</p>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Price + CTA */}
                          <div className="flex flex-col items-end gap-2 ml-auto shrink-0">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">{formatPrice(priceGBP)}</p>
                              <p className="text-xs text-muted-foreground">per person total</p>
                            </div>
                            {offer.numberOfBookableSeats <= 5 && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                Only {offer.numberOfBookableSeats} seats left!
                              </p>
                            )}
                            <button className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-1.5">
                              Select <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FlightResults;
