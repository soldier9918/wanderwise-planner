import { useParams, Link } from "react-router-dom";
import { mockHotels } from "@/data/mockHotels";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HotelMap from "@/components/HotelMap";
import { Star, ArrowLeft, ExternalLink, MapPin, Plane, Train, Utensils, ShoppingBag, Palmtree } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const HotelDetail = () => {
  const { id } = useParams();
  const hotel = mockHotels.find((h) => h.id === id);
  const [distanceUnit, setDistanceUnit] = useState<"km" | "mi">("km");

  if (!hotel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Hotel not found.</p>
      </div>
    );
  }

  const toMiles = (km: number) => (km * 0.621371).toFixed(1);
  const dist = (km: number) =>
    distanceUnit === "mi" ? `${toMiles(km)} mi` : `${km} km`;

  const bestPrice = Math.min(...hotel.prices.map((p) => p.price));

  const nearbyPOIs = [
    { icon: Plane, label: "Nearest Airport", distance: hotel.distanceToAirport, name: "ACE Airport" },
    { icon: Train, label: "Public Transport", distance: 0.6, name: "Bus Stop L1" },
    { icon: Palmtree, label: "Tourist Hotspot", distance: 1.2, name: "Timanfaya National Park" },
    { icon: Utensils, label: "Restaurants", distance: 0.3, name: "La Tegala, El Golfo" },
    { icon: ShoppingBag, label: "Shopping", distance: 0.8, name: "Biosfera Shopping Centre" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <Link
          to="/results"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to results
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="rounded-2xl overflow-hidden shadow-card">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-64 md:h-96 object-cover"
                />
              </div>

              <div className="mt-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      {hotel.name}
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" /> {hotel.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {Array.from({ length: hotel.stars }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <span className="px-2.5 py-1 rounded-lg bg-teal text-teal-foreground text-sm font-bold">
                    {hotel.rating}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {hotel.reviewCount.toLocaleString()} reviews
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                    {hotel.boardType}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-card rounded-2xl border border-border p-5 shadow-card"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Location & Nearby
                </h2>
                <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
                  {(["km", "mi"] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => setDistanceUnit(u)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        distanceUnit === u
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {u.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl overflow-hidden mb-4 h-72">
                <HotelMap lat={hotel.lat} lng={hotel.lng} name={hotel.name} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nearbyPOIs.map((poi) => (
                  <div
                    key={poi.label}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <poi.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{poi.label}</p>
                      <p className="text-sm font-medium text-foreground">{poi.name}</p>
                      <p className="text-xs text-primary font-semibold">{dist(poi.distance)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-card rounded-2xl border border-border p-5 shadow-card"
            >
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.map((a) => (
                  <span
                    key={a}
                    className="px-3 py-1.5 rounded-xl bg-secondary text-sm text-secondary-foreground"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Price comparison sidebar */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-card rounded-2xl border border-border p-5 shadow-card sticky top-24"
            >
              <h2 className="font-display text-lg font-semibold text-foreground mb-1">
                Price Comparison
              </h2>
              <p className="text-xs text-muted-foreground mb-5">
                Per person, including flights
              </p>

              <div className="space-y-2">
                {hotel.prices
                  .sort((a, b) => a.price - b.price)
                  .map((p, i) => (
                    <a
                      key={p.provider}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
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
                        <span className="text-sm font-medium text-foreground">
                          {p.provider}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-display text-lg font-bold ${
                            i === 0 ? "text-primary" : "text-foreground"
                          }`}
                        >
                          £{p.price}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </a>
                  ))}
              </div>

              <div className="mt-5 pt-4 border-t border-border text-center">
                <p className="text-xs text-muted-foreground mb-1">You could save</p>
                <p className="font-display text-2xl font-bold text-primary">
                  £{Math.max(...hotel.prices.map((p) => p.price)) - bestPrice}
                </p>
                <p className="text-xs text-muted-foreground">
                  vs. most expensive option
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HotelDetail;
