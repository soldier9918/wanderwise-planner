import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Hotel } from "@/data/mockHotels";

interface HotelCardProps {
  hotel: Hotel;
  distanceUnit: "km" | "mi";
  index: number;
}

const toMiles = (km: number) => (km * 0.621371).toFixed(1);

const HotelCard = ({ hotel, distanceUnit, index }: HotelCardProps) => {
  const bestPrice = Math.min(...hotel.prices.map((p) => p.price));
  const bestProvider = hotel.prices.find((p) => p.price === bestPrice)!;
  const dist = (km: number) =>
    distanceUnit === "mi" ? `${toMiles(km)} mi` : `${km} km`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Link
        to={`/hotel/${hotel.id}`}
        className="block bg-gradient-card rounded-2xl overflow-hidden border border-border shadow-card hover:border-primary/30 transition-all hover:shadow-elevated group"
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-72 h-48 md:h-auto overflow-hidden relative">
            <img
              src={hotel.image}
              alt={hotel.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
              {hotel.boardType}
            </span>
          </div>

          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {hotel.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{hotel.location}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {Array.from({ length: hotel.stars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span>✈ Airport: {dist(hotel.distanceToAirport)}</span>
                <span>🏖 Beach: {dist(hotel.distanceToBeach)}</span>
                <span>🏙 Centre: {dist(hotel.distanceToCenter)}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {hotel.amenities.slice(0, 5).map((a) => (
                  <span
                    key={a}
                    className="px-2 py-0.5 rounded-md bg-secondary text-xs text-secondary-foreground"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-end justify-between border-t border-border pt-3 mt-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-md bg-teal text-teal-foreground text-xs font-bold">
                  {hotel.rating}
                </span>
                <span className="text-xs text-muted-foreground">
                  {hotel.reviewCount.toLocaleString()} reviews
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  Best: {bestProvider.provider}
                </p>
                <p className="font-display text-2xl font-bold text-primary">
                  £{bestPrice}
                </p>
                <p className="text-xs text-muted-foreground">per person</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default HotelCard;
