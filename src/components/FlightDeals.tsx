import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/contexts/CurrencyContext";

interface FlightLeg {
  date: string;
  route: string;
  airline: string;
  airlineLogo: string;
  type: string;
}

interface FlightDeal {
  city: string;
  country: string;
  image: string;
  legs: FlightLeg[];
  priceFromGBP: number;
}

const allDeals: FlightDeal[] = [
  {
    city: "Malaga",
    country: "Spain",
    image: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=600&h=400&fit=crop",
    legs: [
      { date: "Fri, 28 Feb", route: "STN – AGP", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
      { date: "Fri, 7 Mar", route: "AGP – STN", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
    ],
    priceFromGBP: 29,
  },
  {
    city: "Alicante",
    country: "Spain",
    image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&h=400&fit=crop",
    legs: [
      { date: "Tue, 4 Mar", route: "LTN – ALC", airline: "Wizz Air UK", airlineLogo: "W", type: "Direct" },
      { date: "Tue, 11 Mar", route: "ALC – LTN", airline: "Wizz Air UK", airlineLogo: "W", type: "Direct" },
    ],
    priceFromGBP: 24,
  },
  {
    city: "Milan",
    country: "Italy",
    image: "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=600&h=400&fit=crop",
    legs: [
      { date: "Sat, 22 Feb", route: "STN – BGY", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
      { date: "Thu, 6 Mar", route: "MXP – STN", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
    ],
    priceFromGBP: 26,
  },
  {
    city: "Lisbon",
    country: "Portugal",
    image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600&h=400&fit=crop",
    legs: [
      { date: "Wed, 26 Feb", route: "LGW – LIS", airline: "easyJet", airlineLogo: "🟠", type: "Direct" },
      { date: "Wed, 5 Mar", route: "LIS – LGW", airline: "easyJet", airlineLogo: "🟠", type: "Direct" },
    ],
    priceFromGBP: 35,
  },
  {
    city: "Dublin",
    country: "Ireland",
    image: "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=600&h=400&fit=crop",
    legs: [
      { date: "Mon, 24 Feb", route: "STN – DUB", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
      { date: "Fri, 28 Feb", route: "DUB – STN", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
    ],
    priceFromGBP: 19,
  },
  {
    city: "Barcelona",
    country: "Spain",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=400&fit=crop",
    legs: [
      { date: "Thu, 27 Feb", route: "LGW – BCN", airline: "Vueling", airlineLogo: "V", type: "Direct" },
      { date: "Thu, 6 Mar", route: "BCN – LGW", airline: "Vueling", airlineLogo: "V", type: "Direct" },
    ],
    priceFromGBP: 32,
  },
  {
    city: "Rome",
    country: "Italy",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=400&fit=crop",
    legs: [
      { date: "Sat, 1 Mar", route: "STN – FCO", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
      { date: "Sat, 8 Mar", route: "FCO – STN", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
    ],
    priceFromGBP: 31,
  },
  {
    city: "Amsterdam",
    country: "Netherlands",
    image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&h=400&fit=crop",
    legs: [
      { date: "Fri, 28 Feb", route: "LHR – AMS", airline: "KLM", airlineLogo: "K", type: "Direct" },
      { date: "Mon, 3 Mar", route: "AMS – LHR", airline: "KLM", airlineLogo: "K", type: "Direct" },
    ],
    priceFromGBP: 42,
  },
  {
    city: "Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop",
    legs: [
      { date: "Sun, 2 Mar", route: "LGW – CDG", airline: "easyJet", airlineLogo: "🟠", type: "Direct" },
      { date: "Thu, 6 Mar", route: "CDG – LGW", airline: "easyJet", airlineLogo: "🟠", type: "Direct" },
    ],
    priceFromGBP: 38,
  },
  {
    city: "Prague",
    country: "Czech Republic",
    image: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=600&h=400&fit=crop",
    legs: [
      { date: "Wed, 5 Mar", route: "STN – PRG", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
      { date: "Sun, 9 Mar", route: "PRG – STN", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
    ],
    priceFromGBP: 22,
  },
  {
    city: "Athens",
    country: "Greece",
    image: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=600&h=400&fit=crop",
    legs: [
      { date: "Mon, 3 Mar", route: "LGW – ATH", airline: "easyJet", airlineLogo: "🟠", type: "Direct" },
      { date: "Mon, 10 Mar", route: "ATH – LGW", airline: "easyJet", airlineLogo: "🟠", type: "Direct" },
    ],
    priceFromGBP: 45,
  },
  {
    city: "Berlin",
    country: "Germany",
    image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&h=400&fit=crop",
    legs: [
      { date: "Tue, 4 Mar", route: "STN – BER", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
      { date: "Sat, 8 Mar", route: "BER – STN", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
    ],
    priceFromGBP: 27,
  },
  {
    city: "Porto",
    country: "Portugal",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&h=400&fit=crop",
    legs: [
      { date: "Thu, 6 Mar", route: "STN – OPO", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
      { date: "Mon, 10 Mar", route: "OPO – STN", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
    ],
    priceFromGBP: 28,
  },
  {
    city: "Budapest",
    country: "Hungary",
    image: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=600&h=400&fit=crop",
    legs: [
      { date: "Fri, 7 Mar", route: "LTN – BUD", airline: "Wizz Air UK", airlineLogo: "W", type: "Direct" },
      { date: "Tue, 11 Mar", route: "BUD – LTN", airline: "Wizz Air UK", airlineLogo: "W", type: "Direct" },
    ],
    priceFromGBP: 21,
  },
  {
    city: "Krakow",
    country: "Poland",
    image: "https://images.unsplash.com/photo-1562124638-724e13052daf?w=600&h=400&fit=crop",
    legs: [
      { date: "Sat, 1 Mar", route: "LTN – KRK", airline: "Wizz Air UK", airlineLogo: "W", type: "Direct" },
      { date: "Wed, 5 Mar", route: "KRK – LTN", airline: "Wizz Air UK", airlineLogo: "W", type: "Direct" },
    ],
    priceFromGBP: 18,
  },
  {
    city: "Copenhagen",
    country: "Denmark",
    image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=600&h=400&fit=crop",
    legs: [
      { date: "Sun, 2 Mar", route: "LGW – CPH", airline: "easyJet", airlineLogo: "🟠", type: "Direct" },
      { date: "Thu, 6 Mar", route: "CPH – LGW", airline: "easyJet", airlineLogo: "🟠", type: "Direct" },
    ],
    priceFromGBP: 36,
  },
  {
    city: "Marrakech",
    country: "Morocco",
    image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=600&h=400&fit=crop",
    legs: [
      { date: "Wed, 5 Mar", route: "STN – RAK", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
      { date: "Wed, 12 Mar", route: "RAK – STN", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
    ],
    priceFromGBP: 33,
  },
  {
    city: "Vienna",
    country: "Austria",
    image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600&h=400&fit=crop",
    legs: [
      { date: "Mon, 3 Mar", route: "STN – VIE", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
      { date: "Fri, 7 Mar", route: "VIE – STN", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
    ],
    priceFromGBP: 30,
  },
];

const VISIBLE_COUNT = 6;
const TOTAL_SETS = Math.ceil(allDeals.length / VISIBLE_COUNT);

const FlightDeals = () => {
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
          Deals to popular destinations
        </h2>
        <p className="text-muted-foreground text-lg mb-10">
          Cheapest return flights from London airports
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
                  <h3 className="text-xl font-bold text-foreground">{deal.city}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{deal.country}</p>

                  <div className="space-y-2.5">
                    {deal.legs.map((leg, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                            {leg.airlineLogo}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-foreground">{leg.date}</p>
                            <p className="text-xs text-muted-foreground">{leg.route} with {leg.airline}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-foreground bg-secondary px-2 py-0.5 rounded-full">
                          {leg.type}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-end">
                    <span className="text-primary font-bold text-base flex items-center gap-1">
                      from {formatPrice(deal.priceFromGBP)} <ArrowRight className="w-4 h-4" />
                    </span>
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

export default FlightDeals;
