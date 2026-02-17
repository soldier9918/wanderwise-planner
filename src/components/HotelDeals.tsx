import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/contexts/CurrencyContext";

const allDeals = [
  { city: "Lanzarote", country: "Spain", pricePerNightGBP: 42, image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=600&h=400&fit=crop" },
  { city: "Bali", country: "Indonesia", pricePerNightGBP: 28, image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop" },
  { city: "Santorini", country: "Greece", pricePerNightGBP: 65, image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&h=400&fit=crop" },
  { city: "Dubai", country: "UAE", pricePerNightGBP: 55, image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop" },
  { city: "London", country: "United Kingdom", pricePerNightGBP: 39, image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop" },
  { city: "Dublin", country: "Ireland", pricePerNightGBP: 18, image: "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=600&h=400&fit=crop" },
  { city: "Paris", country: "France", pricePerNightGBP: 48, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop" },
  { city: "Rome", country: "Italy", pricePerNightGBP: 35, image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=400&fit=crop" },
  { city: "Barcelona", country: "Spain", pricePerNightGBP: 31, image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=400&fit=crop" },
  { city: "Marrakech", country: "Morocco", pricePerNightGBP: 14, image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=600&h=400&fit=crop" },
  { city: "Amsterdam", country: "Netherlands", pricePerNightGBP: 52, image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&h=400&fit=crop" },
  { city: "Lisbon", country: "Portugal", pricePerNightGBP: 22, image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600&h=400&fit=crop" },
  { city: "Prague", country: "Czech Republic", pricePerNightGBP: 19, image: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=600&h=400&fit=crop" },
  { city: "New York", country: "USA", pricePerNightGBP: 72, image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop" },
  { city: "Maldives", country: "Maldives", pricePerNightGBP: 95, image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&h=400&fit=crop" },
  { city: "Bangkok", country: "Thailand", pricePerNightGBP: 12, image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&h=400&fit=crop" },
  { city: "Tokyo", country: "Japan", pricePerNightGBP: 45, image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop" },
  { city: "Vienna", country: "Austria", pricePerNightGBP: 38, image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600&h=400&fit=crop" },
];

const VISIBLE_COUNT = 6;
const TOTAL_SETS = Math.ceil(allDeals.length / VISIBLE_COUNT);

const HotelDeals = () => {
  const { formatPrice } = useCurrency();
  const [currentSet, setCurrentSet] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSet((prev) => (prev + 1) % TOTAL_SETS);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const visibleDeals = allDeals.slice(
    currentSet * VISIBLE_COUNT,
    currentSet * VISIBLE_COUNT + VISIBLE_COUNT
  );

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          Hotel deals to popular destinations
        </h2>
        <p className="text-muted-foreground text-lg mb-10">
          Compare prices across top booking sites — best rates per night
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSet}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {visibleDeals.map((deal) => (
              <div
                key={deal.city}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="h-44 overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.city}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{deal.city}</h3>
                      <p className="text-sm text-muted-foreground">{deal.country}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="text-xl font-bold text-foreground">{formatPrice(deal.pricePerNightGBP)}</p>
                      <p className="text-xs text-muted-foreground">a night</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Navigation dots */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: TOTAL_SETS }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSet(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === currentSet ? "bg-primary w-6" : "bg-border hover:bg-muted-foreground"
              }`}
              aria-label={`Show deals set ${i + 1}`}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-navy text-white font-semibold text-sm hover:bg-navy/90 transition-colors">
            See more deals <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HotelDeals;
