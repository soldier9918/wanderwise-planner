import { useParams, Link } from "react-router-dom";
import { mockHotels } from "@/data/mockHotels";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HotelMap from "@/components/HotelMap";
import HotelImageCarousel from "@/components/HotelImageCarousel";
import NearbyPOIs, { POILocation } from "@/components/NearbyPOIs";
import WeatherForecast from "@/components/WeatherForecast";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import { Star, ArrowLeft, ExternalLink, MapPin, Building2, Plane } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Switch } from "@/components/ui/switch";

const HotelDetail = () => {
  const { formatPrice } = useCurrency();
  const { id } = useParams();
  const hotel = mockHotels.find((h) => h.id === id);
  const [distanceUnit, setDistanceUnit] = useState<"km" | "mi">("km");
  const [activePOI, setActivePOI] = useState<POILocation | null>(null);
  const [priceMode, setPriceMode] = useState<"night" | "person">("person");

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

  const mapDestination = activePOI
    ? { lat: activePOI.lat, lng: activePOI.lng, name: activePOI.name }
    : null;

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
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="rounded-2xl overflow-hidden shadow-card h-64 md:h-96">
                <HotelImageCarousel hotelName={hotel.name} cityName={hotel.location} className="w-full h-full" />
              </div>

              <div className="mt-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{hotel.name}</h1>
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

                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="px-2.5 py-1 rounded-lg bg-teal text-teal-foreground text-sm font-bold">{hotel.rating}</span>
                  <span className="text-sm font-semibold text-foreground">{hotel.reviewScore}</span>
                  <span className="text-sm text-muted-foreground">{hotel.reviewCount.toLocaleString()} reviews</span>
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">{hotel.boardType}</span>
                  <span className="px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold flex items-center gap-1">
                    <Building2 className="w-3 h-3" />{hotel.accommodationType}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold flex items-center gap-1">
                    <Plane className="w-3 h-3" />{hotel.flightType} · {hotel.airline}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Price History */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-border p-5 shadow-card">
              <PriceHistoryChart basePrice={bestPrice} hotelName={hotel.name} />
            </motion.div>

            {/* Weather */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="bg-card rounded-2xl border border-border p-5 shadow-card">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Weather</h2>
              <WeatherForecast lat={hotel.lat} lng={hotel.lng} cityName={hotel.location} />
            </motion.div>

            {/* Map */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-card rounded-2xl border border-border p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-foreground">Location & Nearby</h2>
                <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
                  {(["km", "mi"] as const).map((u) => (
                    <button key={u} onClick={() => setDistanceUnit(u)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        distanceUnit === u ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}>{u.toUpperCase()}</button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl overflow-hidden mb-4 h-72">
                <HotelMap lat={hotel.lat} lng={hotel.lng} name={hotel.name} destination={mapDestination} />
              </div>
              <NearbyPOIs hotelLat={hotel.lat} hotelLng={hotel.lng} distanceUnit={distanceUnit} dist={dist}
                onSelectPOI={setActivePOI} activePOI={activePOI} />
            </motion.div>

            {/* Amenities */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-5 shadow-card">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.map((a) => (
                  <span key={a} className="px-3 py-1.5 rounded-xl bg-secondary text-sm text-secondary-foreground">{a}</span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Price comparison sidebar */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-card rounded-2xl border border-border p-5 shadow-card sticky top-24">
              <h2 className="font-display text-lg font-semibold text-foreground mb-1">Price Comparison</h2>
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs text-muted-foreground">Including flights</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium ${priceMode === "night" ? "text-foreground" : "text-muted-foreground"}`}>Per night</span>
                  <Switch checked={priceMode === "person"} onCheckedChange={(v) => setPriceMode(v ? "person" : "night")} />
                  <span className={`text-[10px] font-medium ${priceMode === "person" ? "text-foreground" : "text-muted-foreground"}`}>Per person</span>
                </div>
              </div>
              <div className="space-y-2">
                {hotel.prices.sort((a, b) => a.price - b.price).map((p, i) => {
                  const displayPrice = priceMode === "night" ? p.price * 0.7 : p.price;
                  return (
                    <a key={p.provider} href={p.url} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                        i === 0 ? "bg-primary/10 border border-primary/30" : "bg-secondary hover:bg-secondary/80"
                      }`}>
                      <div className="flex items-center gap-2">
                        {i === 0 && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded">BEST</span>}
                        <span className="text-sm font-medium text-foreground">{p.provider}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-display text-lg font-bold ${i === 0 ? "text-primary" : "text-foreground"}`}>{formatPrice(displayPrice)}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </a>
                  );
                })}
              </div>
              <div className="mt-5 pt-4 border-t border-border text-center">
                <p className="text-xs text-muted-foreground mb-1">You could save</p>
                <p className="font-display text-2xl font-bold text-primary">{formatPrice(Math.max(...hotel.prices.map((p) => p.price)) - bestPrice)}</p>
                <p className="text-xs text-muted-foreground">vs. most expensive option</p>
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
