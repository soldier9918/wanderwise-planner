import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

const allDestinations = [
  { name: "Lanzarote", country: "Spain", price: "£289", image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=400&h=300&fit=crop" },
  { name: "Bali", country: "Indonesia", price: "£549", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop" },
  { name: "Santorini", country: "Greece", price: "£399", image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&h=300&fit=crop" },
  { name: "Dubai", country: "UAE", price: "£479", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop" },
  { name: "Maldives", country: "Maldives", price: "£899", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&h=300&fit=crop" },
  { name: "New York", country: "USA", price: "£529", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop" },
  { name: "Tenerife", country: "Spain", price: "£319", image: "https://images.unsplash.com/photo-1580746738099-78d6833ded99?w=400&h=300&fit=crop" },
  { name: "Cancún", country: "Mexico", price: "£649", image: "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=400&h=300&fit=crop" },
  { name: "Phuket", country: "Thailand", price: "£499", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&h=300&fit=crop" },
  { name: "Majorca", country: "Spain", price: "£259", image: "https://images.unsplash.com/photo-1591970175608-4b43b8fcf2b0?w=400&h=300&fit=crop" },
  { name: "Tokyo", country: "Japan", price: "£699", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop" },
  { name: "Crete", country: "Greece", price: "£349", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop" },
  { name: "Cape Town", country: "South Africa", price: "£579", image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&h=300&fit=crop" },
  { name: "Barcelona", country: "Spain", price: "£279", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop" },
  { name: "Marrakech", country: "Morocco", price: "£229", image: "https://images.unsplash.com/photo-1597211684565-dca64d72c5ac?w=400&h=300&fit=crop" },
  { name: "Rome", country: "Italy", price: "£309", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop" },
  { name: "Antalya", country: "Turkey", price: "£269", image: "https://images.unsplash.com/photo-1593352216840-1aee13f45818?w=400&h=300&fit=crop" },
  { name: "Lisbon", country: "Portugal", price: "£299", image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=400&h=300&fit=crop" },
];

const VISIBLE_COUNT = 6;

const FeaturedDestinations = () => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(allDestinations.length / VISIBLE_COUNT);

  useEffect(() => {
    const interval = setInterval(() => {
      setPage((prev) => (prev + 1) % totalPages);
    }, 20000);
    return () => clearInterval(interval);
  }, [totalPages]);

  const visibleDestinations = allDestinations.slice(
    page * VISIBLE_COUNT,
    page * VISIBLE_COUNT + VISIBLE_COUNT
  );

  return (
    <section id="trending-destinations" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Trending Destinations
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Prices compared across top booking sites — so you always get the best deal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 min-h-[420px]">
          <AnimatePresence mode="wait">
            {visibleDestinations.map((dest) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="group relative rounded-2xl overflow-hidden shadow-card cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={dest.image}
                    alt={`${dest.name}, ${dest.country}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="font-display text-xl font-extrabold text-white drop-shadow-md">
                        {dest.name}
                      </h3>
                      <p className="text-white/80 text-sm font-semibold">{dest.country}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/70 font-medium">From</p>
                      <p className="font-display text-xl font-extrabold text-white drop-shadow-md">
                        {dest.price}
                      </p>
                      <p className="text-xs text-white/70 font-medium">per person</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Page indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === page ? "bg-coral" : "bg-muted-foreground/30"
              }`}
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

export default FeaturedDestinations;
