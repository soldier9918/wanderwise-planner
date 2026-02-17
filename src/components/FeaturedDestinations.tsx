import { motion } from "framer-motion";

const destinations = [
  { name: "Lanzarote", country: "Spain", price: "£289", image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=400&h=300&fit=crop" },
  { name: "Bali", country: "Indonesia", price: "£549", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop" },
  { name: "Santorini", country: "Greece", price: "£399", image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&h=300&fit=crop" },
  { name: "Dubai", country: "UAE", price: "£479", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop" },
  { name: "Maldives", country: "Maldives", price: "£899", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&h=300&fit=crop" },
  { name: "New York", country: "USA", price: "£529", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop" },
];

const FeaturedDestinations = () => {
  return (
    <section className="py-20">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
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
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;
