import { useState, useEffect } from "react";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/contexts/CurrencyContext";

interface HotelDeal {
  name: string;
  location: string;
  country: string;
  stars: number;
  rating: number;
  reviewCount: number;
  reviewLabel: string;
  pricePerNightGBP: number;
  image: string;
}

const allDeals: HotelDeal[] = [
  { name: "Hotel Lanzarote Village", location: "Puerto del Carmen, Spain", country: "Spain", stars: 4, rating: 8.4, reviewCount: 2341, reviewLabel: "Very Good", pricePerNightGBP: 67, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop" },
  { name: "Seaside Los Jameos Playa", location: "Puerto del Carmen, Spain", country: "Spain", stars: 4, rating: 8.9, reviewCount: 1876, reviewLabel: "Excellent", pricePerNightGBP: 85, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop" },
  { name: "Santorini Palace Hotel", location: "Fira, Greece", country: "Greece", stars: 5, rating: 9.2, reviewCount: 1057, reviewLabel: "Exceptional", pricePerNightGBP: 178, image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&h=400&fit=crop" },
  { name: "Jumeirah Beach Residence", location: "Dubai Marina, UAE", country: "UAE", stars: 5, rating: 9.0, reviewCount: 3420, reviewLabel: "Exceptional", pricePerNightGBP: 145, image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop" },
  { name: "The Strand Palace", location: "London, United Kingdom", country: "UK", stars: 4, rating: 8.1, reviewCount: 4512, reviewLabel: "Very Good", pricePerNightGBP: 39, image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop" },
  { name: "The Shelbourne Hotel", location: "Dublin, Ireland", country: "Ireland", stars: 5, rating: 9.1, reviewCount: 2890, reviewLabel: "Exceptional", pricePerNightGBP: 94, image: "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=600&h=400&fit=crop" },
  { name: "Hôtel Plaza Athénée", location: "Paris, France", country: "France", stars: 5, rating: 9.4, reviewCount: 1823, reviewLabel: "Exceptional", pricePerNightGBP: 210, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop" },
  { name: "Hotel Artemide", location: "Rome, Italy", country: "Italy", stars: 4, rating: 8.7, reviewCount: 3156, reviewLabel: "Excellent", pricePerNightGBP: 52, image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=400&fit=crop" },
  { name: "Hotel Arts Barcelona", location: "Barcelona, Spain", country: "Spain", stars: 5, rating: 9.0, reviewCount: 2764, reviewLabel: "Exceptional", pricePerNightGBP: 115, image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=400&fit=crop" },
  { name: "Riad Kniza", location: "Marrakech, Morocco", country: "Morocco", stars: 4, rating: 8.8, reviewCount: 987, reviewLabel: "Excellent", pricePerNightGBP: 34, image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=600&h=400&fit=crop" },
  { name: "Waldorf Astoria Amsterdam", location: "Amsterdam, Netherlands", country: "Netherlands", stars: 5, rating: 9.3, reviewCount: 1654, reviewLabel: "Exceptional", pricePerNightGBP: 165, image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&h=400&fit=crop" },
  { name: "Bairro Alto Hotel", location: "Lisbon, Portugal", country: "Portugal", stars: 4, rating: 8.5, reviewCount: 2103, reviewLabel: "Very Good", pricePerNightGBP: 48, image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600&h=400&fit=crop" },
  { name: "The Grand Mark Prague", location: "Prague, Czech Republic", country: "Czech Republic", stars: 5, rating: 9.1, reviewCount: 1432, reviewLabel: "Exceptional", pricePerNightGBP: 72, image: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=600&h=400&fit=crop" },
  { name: "The Plaza Hotel", location: "New York, USA", country: "USA", stars: 5, rating: 9.2, reviewCount: 5678, reviewLabel: "Exceptional", pricePerNightGBP: 195, image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop" },
  { name: "Soneva Fushi Resort", location: "Baa Atoll, Maldives", country: "Maldives", stars: 5, rating: 9.5, reviewCount: 876, reviewLabel: "Exceptional", pricePerNightGBP: 320, image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&h=400&fit=crop" },
  { name: "Mandarin Oriental Bangkok", location: "Bangkok, Thailand", country: "Thailand", stars: 5, rating: 9.3, reviewCount: 3245, reviewLabel: "Exceptional", pricePerNightGBP: 58, image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&h=400&fit=crop" },
  { name: "Park Hyatt Tokyo", location: "Tokyo, Japan", country: "Japan", stars: 5, rating: 9.1, reviewCount: 2890, reviewLabel: "Exceptional", pricePerNightGBP: 142, image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop" },
  { name: "Hotel Sacher Wien", location: "Vienna, Austria", country: "Austria", stars: 5, rating: 9.0, reviewCount: 1987, reviewLabel: "Exceptional", pricePerNightGBP: 125, image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600&h=400&fit=crop" },
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
                key={deal.name}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                {/* Image with location overlay and Hotel badge */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Hotel badge */}
                  <span className="absolute top-3 right-3 bg-foreground/80 text-background text-xs font-semibold px-3 py-1 rounded-md">
                    Hotel
                  </span>
                  {/* Location overlay */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-sm font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    {deal.location}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-base font-bold text-foreground mb-1.5 truncate">{deal.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: deal.stars }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded">
                      {deal.rating}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {deal.reviewLabel} ({deal.reviewCount.toLocaleString()})
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-muted-foreground">from</span>
                    <span className="text-2xl font-bold text-foreground">{formatPrice(deal.pricePerNightGBP)}</span>
                    <span className="text-sm text-muted-foreground">per night</span>
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
