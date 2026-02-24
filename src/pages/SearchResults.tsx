import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HotelCard from "@/components/HotelCard";
import LiveHotelCard, { LiveHotelCardSkeleton } from "@/components/LiveHotelCard";
import SearchFilters, { FilterState } from "@/components/SearchFilters";
import SearchResultsMap from "@/components/SearchResultsMap";
import { mockHotels } from "@/data/mockHotels";
import { LiveHotel } from "@/types/liveHotel";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const destination = searchParams.get("destination") || "Lanzarote";
  const cityCode = searchParams.get("cityCode");
  const checkInDate = searchParams.get("checkIn") || "";
  const checkOutDate = searchParams.get("checkOut") || "";
  const adults = searchParams.get("guests") || "2";
  const roomQuantity = searchParams.get("rooms") || "1";

  const [distanceUnit, setDistanceUnit] = useState<"km" | "mi">(
    (searchParams.get("unit") as "km" | "mi") || "km"
  );
  const [priceMode, setPriceMode] = useState<"night" | "person">("night");
  const [filters, setFilters] = useState<FilterState>({
    minStars: 0,
    boardType: "all",
    maxPrice: 2000,
    sortBy: "price-low",
    accommodationType: "all",
    flightType: "all",
    minRating: 0,
  });

  // Live data state
  const [liveHotels, setLiveHotels] = useState<LiveHotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch live data when cityCode is present
  useEffect(() => {
    if (!cityCode) return;
    const fetchLiveHotels = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ cityCode });
        if (checkInDate) params.set("checkInDate", checkInDate);
        if (checkOutDate) params.set("checkOutDate", checkOutDate);
        params.set("adults", adults);
        params.set("roomQuantity", roomQuantity);

        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/amadeus-hotel-search?${params}`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch hotels");
        setLiveHotels(data.hotels || []);
      } catch (err) {
        console.error("Live hotel fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load hotels");
      } finally {
        setLoading(false);
      }
    };
    fetchLiveHotels();
  }, [cityCode, checkInDate, checkOutDate, adults, roomQuantity]);

  // Filter/sort live hotels
  const filteredLive = useMemo(() => {
    let result = liveHotels.filter((h) => {
      const bestPrice = h.offers.length ? Math.min(...h.offers.map((o) => o.price)) : Infinity;
      if (filters.minStars && h.stars < filters.minStars) return false;
      if (bestPrice > filters.maxPrice) return false;
      return true;
    });
    result.sort((a, b) => {
      const aPrice = a.offers.length ? Math.min(...a.offers.map((o) => o.price)) : Infinity;
      const bPrice = b.offers.length ? Math.min(...b.offers.map((o) => o.price)) : Infinity;
      switch (filters.sortBy) {
        case "price-high": return bPrice - aPrice;
        case "stars": return b.stars - a.stars;
        case "rating": return b.rating - a.rating;
        default: return aPrice - bPrice;
      }
    });
    return result;
  }, [liveHotels, filters]);

  // Filter/sort mock hotels
  const filteredMock = useMemo(() => {
    let result = mockHotels.filter((h) => {
      const bestPrice = Math.min(...h.prices.map((p) => p.price));
      if (filters.minStars && h.stars < filters.minStars) return false;
      if (filters.boardType !== "all" && h.boardType !== filters.boardType) return false;
      if (filters.accommodationType !== "all" && h.accommodationType !== filters.accommodationType) return false;
      if (filters.flightType !== "all" && h.flightType !== filters.flightType) return false;
      if (filters.minRating && h.rating < filters.minRating) return false;
      if (bestPrice > filters.maxPrice) return false;
      return true;
    });
    result.sort((a, b) => {
      const aPrice = Math.min(...a.prices.map((p) => p.price));
      const bPrice = Math.min(...b.prices.map((p) => p.price));
      switch (filters.sortBy) {
        case "price-high": return bPrice - aPrice;
        case "rating": return b.rating - a.rating;
        case "stars": return b.stars - a.stars;
        default: return aPrice - bPrice;
      }
    });
    return result;
  }, [filters]);

  const isLiveMode = Boolean(cityCode);
  const displayName = destination || cityCode || "Hotels";
  const resultCount = isLiveMode ? filteredLive.length : filteredMock.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="px-4 lg:px-6 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Hotels in <span className="text-primary">{displayName}</span>
            </h1>
            {isLiveMode && (
              <span className="px-2.5 py-1 rounded-full bg-teal/10 text-teal text-xs font-semibold border border-teal/20">
                Live prices
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground text-sm">
              {loading ? "Searching for the best rates…" : `${resultCount} results found`}
            </p>
            {/* Price mode toggle */}
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${priceMode === "night" ? "text-foreground" : "text-muted-foreground"}`}>Per night</span>
              <Switch checked={priceMode === "person"} onCheckedChange={(v) => setPriceMode(v ? "person" : "night")} />
              <span className={`text-xs font-medium ${priceMode === "person" ? "text-foreground" : "text-muted-foreground"}`}>Per person</span>
            </div>
          </div>
        </motion.div>

        {error && isLiveMode && (
          <div className="flex items-center gap-2 mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Live hotel data is temporarily unavailable. Showing sample data instead.</span>
          </div>
        )}

        <div className="flex gap-6">
          <div className="w-64 shrink-0 hidden md:block">
            <SearchFilters onFilterChange={setFilters} distanceUnit={distanceUnit} onDistanceUnitChange={setDistanceUnit} hideMockFilters={isLiveMode} />
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {loading && Array.from({ length: 5 }).map((_, i) => <LiveHotelCardSkeleton key={i} index={i} />)}

            {!loading && isLiveMode && !error && filteredLive.map((hotel, i) => (
              <LiveHotelCard key={hotel.hotelId} hotel={hotel} index={i} cityName={displayName} priceMode={priceMode} adults={parseInt(adults)} />
            ))}

            {!loading && (!isLiveMode || error) && filteredMock.map((hotel, i) => (
              <HotelCard key={hotel.id} hotel={hotel} distanceUnit={distanceUnit} index={i} />
            ))}

            {!loading && isLiveMode && !error && filteredLive.length === 0 && (
              <div className="text-center py-20"><p className="text-muted-foreground text-lg">No hotels found. Try adjusting your dates or filters.</p></div>
            )}
            {!loading && !isLiveMode && filteredMock.length === 0 && (
              <div className="text-center py-20"><p className="text-muted-foreground text-lg">No hotels match your filters.</p></div>
            )}
          </div>

          <div className="w-[420px] shrink-0 hidden lg:block sticky top-24 self-start h-[calc(100vh-8rem)]">
            <SearchResultsMap hotels={isLiveMode && !error ? filteredLive : filteredMock} isLive={isLiveMode && !error} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchResults;
