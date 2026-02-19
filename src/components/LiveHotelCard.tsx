import { motion } from "framer-motion";
import { Star, ExternalLink, AlertCircle, Calendar } from "lucide-react";
import { LiveHotel } from "@/types/liveHotel";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Skeleton } from "@/components/ui/skeleton";

interface LiveHotelCardProps {
  hotel: LiveHotel;
  index: number;
  cityName?: string;
}

// Unsplash source image based on city name
const cityImage = (cityCode: string, cityName?: string) => {
  const query = encodeURIComponent(cityName || cityCode);
  return `https://source.unsplash.com/featured/480x320/?${query},hotel,city`;
};

const boardTypeBg: Record<string, string> = {
  "All Inclusive": "bg-primary",
  "Full Board": "bg-teal",
  "Half Board": "bg-primary/80",
  "Breakfast Included": "bg-secondary text-secondary-foreground",
  "Room Only": "bg-muted text-muted-foreground",
};

const LiveHotelCard = ({ hotel, index, cityName }: LiveHotelCardProps) => {
  const { formatPrice } = useCurrency();

  const cheapestOffer = hotel.offers.length
    ? hotel.offers.reduce((a, b) => (a.price < b.price ? a : b))
    : null;

  const boardType = cheapestOffer?.boardType || "Room Only";
  const badgeClass = boardTypeBg[boardType] || "bg-primary text-primary-foreground";

  const bookingUrl = `https://www.amadeus.com/en/portfolio/travel-agency/amadeus-hotels-and-accommodations`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <div className="flex flex-col md:flex-row bg-card rounded-2xl overflow-hidden border border-border shadow-card hover:border-primary/30 hover:shadow-elevated transition-all group">
        {/* Image */}
        <div className="md:w-72 h-48 md:h-auto overflow-hidden relative shrink-0">
          <img
            src={cityImage(hotel.cityCode, cityName)}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://source.unsplash.com/featured/480x320/?hotel`;
            }}
          />
          {/* Board type badge */}
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold text-primary-foreground ${badgeClass}`}
          >
            {boardType}
          </span>
          {/* Stars badge */}
          {hotel.stars > 0 && (
            <span className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-card/90 text-foreground text-[10px] font-semibold flex items-center gap-0.5">
              {Array.from({ length: Math.min(hotel.stars, 5) }).map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-gold text-gold" />
              ))}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  {hotel.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {hotel.cityCode}
                  {hotel.countryCode ? `, ${hotel.countryCode}` : ""}
                </p>
              </div>
              {hotel.stars === 0 && (
                <span className="shrink-0 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-lg">
                  Unrated
                </span>
              )}
            </div>

            {cheapestOffer ? (
              <div className="space-y-1.5 mb-3">
                <p className="text-sm text-muted-foreground">
                  {cheapestOffer.roomType}
                </p>
                {cheapestOffer.cancellationDeadline && (
                  <p className="text-xs text-teal flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Free cancellation until{" "}
                    {new Date(cheapestOffer.cancellationDeadline).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
                <AlertCircle className="w-3.5 h-3.5" />
                No availability for selected dates
              </div>
            )}
          </div>

          {/* Price row */}
          <div className="flex items-end justify-between border-t border-border pt-3 mt-1 gap-3">
            <div className="text-xs text-muted-foreground">
              Live pricing via Amadeus
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {cheapestOffer ? (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">from</p>
                  <p className="font-display text-2xl font-bold text-primary leading-none">
                    {formatPrice(cheapestOffer.price)}
                  </p>
                  <p className="text-xs text-muted-foreground">/ night</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No availability</p>
              )}

              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Book
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Skeleton loading state
export const LiveHotelCardSkeleton = ({ index = 0 }: { index?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.07 }}
    className="flex flex-col md:flex-row bg-card rounded-2xl overflow-hidden border border-border shadow-card"
  >
    <Skeleton className="md:w-72 h-48 md:h-40 shrink-0" />
    <div className="flex-1 p-5 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex justify-between items-end pt-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  </motion.div>
);

export default LiveHotelCard;
