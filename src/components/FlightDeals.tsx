import { ArrowRight } from "lucide-react";

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
  priceFrom: string;
}

const deals: FlightDeal[] = [
  {
    city: "Malaga",
    country: "Spain",
    image: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=600&h=400&fit=crop",
    legs: [
      { date: "Fri, 28 Feb", route: "STN – AGP", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
      { date: "Fri, 7 Mar", route: "AGP – STN", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
    ],
    priceFrom: "£29",
  },
  {
    city: "Alicante",
    country: "Spain",
    image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&h=400&fit=crop",
    legs: [
      { date: "Tue, 4 Mar", route: "LTN – ALC", airline: "Wizz Air UK", airlineLogo: "W", type: "Direct" },
      { date: "Tue, 11 Mar", route: "ALC – LTN", airline: "Wizz Air UK", airlineLogo: "W", type: "Direct" },
    ],
    priceFrom: "£24",
  },
  {
    city: "Milan",
    country: "Italy",
    image: "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=600&h=400&fit=crop",
    legs: [
      { date: "Sat, 22 Feb", route: "STN – BGY", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
      { date: "Thu, 6 Mar", route: "MXP – STN", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
    ],
    priceFrom: "£26",
  },
  {
    city: "Lisbon",
    country: "Portugal",
    image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600&h=400&fit=crop",
    legs: [
      { date: "Wed, 26 Feb", route: "LGW – LIS", airline: "easyJet", airlineLogo: "🟠", type: "Direct" },
      { date: "Wed, 5 Mar", route: "LIS – LGW", airline: "easyJet", airlineLogo: "🟠", type: "Direct" },
    ],
    priceFrom: "£35",
  },
  {
    city: "Dublin",
    country: "Ireland",
    image: "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=600&h=400&fit=crop",
    legs: [
      { date: "Mon, 24 Feb", route: "STN – DUB", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
      { date: "Fri, 28 Feb", route: "DUB – STN", airline: "Ryanair", airlineLogo: "✈", type: "Direct" },
    ],
    priceFrom: "£19",
  },
  {
    city: "Barcelona",
    country: "Spain",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=400&fit=crop",
    legs: [
      { date: "Thu, 27 Feb", route: "LGW – BCN", airline: "Vueling", airlineLogo: "V", type: "Direct" },
      { date: "Thu, 6 Mar", route: "BCN – LGW", airline: "Vueling", airlineLogo: "V", type: "Direct" },
    ],
    priceFrom: "£32",
  },
];

const FlightDeals = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          Deals to popular destinations
        </h2>
        <p className="text-muted-foreground text-lg mb-10">
          Cheapest return flights from London airports
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
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
                    from {deal.priceFrom} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
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
