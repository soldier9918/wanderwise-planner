import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HotelCard from "@/components/HotelCard";
import SearchFilters, { FilterState } from "@/components/SearchFilters";
import { mockHotels } from "@/data/mockHotels";
import { motion } from "framer-motion";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const destination = searchParams.get("destination") || "Lanzarote";
  const [distanceUnit, setDistanceUnit] = useState<"km" | "mi">(
    (searchParams.get("unit") as "km" | "mi") || "km"
  );
  const [filters, setFilters] = useState<FilterState>({
    minStars: 0,
    boardType: "all",
    maxPrice: 2000,
    sortBy: "price-low",
  });

  const filtered = useMemo(() => {
    let result = mockHotels.filter((h) => {
      const bestPrice = Math.min(...h.prices.map((p) => p.price));
      if (filters.minStars && h.stars < filters.minStars) return false;
      if (filters.boardType !== "all" && h.boardType !== filters.boardType) return false;
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Hotels in <span className="text-primary">{destination}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} results found — prices compared across top booking sites
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 shrink-0">
            <SearchFilters
              onFilterChange={setFilters}
              distanceUnit={distanceUnit}
              onDistanceUnitChange={setDistanceUnit}
            />
          </div>

          <div className="flex-1 space-y-4">
            {filtered.map((hotel, i) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                distanceUnit={distanceUnit}
                index={i}
              />
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  No hotels match your filters. Try adjusting your search.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchResults;
