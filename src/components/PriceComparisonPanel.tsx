import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface PriceComparisonPanelProps {
  basePrice: number;
  hotelName: string;
  cityName?: string;
}

const providers = [
  { name: "Booking.com", domain: "booking.com", variation: [0.98, 1.05] },
  { name: "Expedia", domain: "expedia.com", variation: [0.97, 1.08] },
  { name: "Hotels.com", domain: "hotels.com", variation: [0.99, 1.07] },
  { name: "lastminute.com", domain: "lastminute.com", variation: [0.95, 1.10] },
  { name: "loveholidays", domain: "loveholidays.com", variation: [0.93, 1.06] },
  { name: "Agoda", domain: "agoda.com", variation: [0.94, 1.04] },
  { name: "Trip.com", domain: "trip.com", variation: [0.96, 1.09] },
  { name: "On the Beach", domain: "onthebeach.co.uk", variation: [0.95, 1.08] },
  { name: "Travala", domain: "travala.com", variation: [0.92, 1.03] },
  { name: "Vio.com", domain: "vio.com", variation: [0.91, 1.06] },
  { name: "Prestigia", domain: "prestigia.com", variation: [1.02, 1.15] },
  { name: "Algotels", domain: "algotels.com", variation: [0.90, 1.04] },
  { name: "Destinia", domain: "destinia.com", variation: [0.96, 1.12] },
  { name: "Direct", domain: "directhotels.com", variation: [1.00, 1.10] },
];

// Deterministic pseudo-random from string
const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const PriceComparisonPanel = ({ basePrice, hotelName, cityName }: PriceComparisonPanelProps) => {
  const { formatPrice } = useCurrency();

  const prices = useMemo(() => {
    const seed = hashStr(hotelName + (cityName || ""));
    return providers
      .map((p, i) => {
        const range = p.variation[1] - p.variation[0];
        const factor = p.variation[0] + ((seed * (i + 1) * 7919) % 1000) / 1000 * range;
        const price = Math.round(basePrice * factor * 100) / 100;
        const query = encodeURIComponent(`${hotelName} ${cityName || ""}`);
        return {
          ...p,
          price,
          url: `https://www.${p.domain}/search?q=${query}`,
        };
      })
      .sort((a, b) => a.price - b.price);
  }, [basePrice, hotelName, cityName]);

  const savings = prices.length > 1
    ? Math.round((prices[prices.length - 1].price - prices[0].price) * 100) / 100
    : 0;

  return (
    <div className="space-y-2">
      <h3 className="font-display text-lg font-semibold text-foreground mb-1">Price Comparison</h3>
      <p className="text-xs text-muted-foreground mb-4">Per night, room only</p>

      <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
        {prices.map((p, i) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
              i === 0
                ? "bg-primary/10 border border-primary/30"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            <div className="flex items-center gap-2">
              {i === 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded">
                  BEST
                </span>
              )}
              <span className="text-sm font-medium text-foreground">{p.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-display text-base font-bold ${i === 0 ? "text-primary" : "text-foreground"}`}>
                {formatPrice(p.price)}
              </span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </div>
          </a>
        ))}
      </div>

      {savings > 0 && (
        <div className="mt-4 pt-3 border-t border-border text-center">
          <p className="text-xs text-muted-foreground mb-1">You could save</p>
          <p className="font-display text-xl font-bold text-primary">{formatPrice(savings)}</p>
          <p className="text-xs text-muted-foreground">vs. most expensive option</p>
        </div>
      )}
    </div>
  );
};

export default PriceComparisonPanel;
