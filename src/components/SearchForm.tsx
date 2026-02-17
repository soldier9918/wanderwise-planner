import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, Users, MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const SearchForm = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [departureCity, setDepartureCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [distanceUnit, setDistanceUnit] = useState<"km" | "mi">("km");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/results?destination=${encodeURIComponent(destination)}&from=${encodeURIComponent(departureCity)}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&unit=${distanceUnit}`
    );
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      onSubmit={handleSearch}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="bg-gradient-card rounded-2xl p-6 shadow-elevated border border-border">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Find your perfect trip
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Flying from..."
              value={departureCity}
              onChange={(e) => setDepartureCity(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Going to..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-secondary text-foreground text-sm border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-secondary text-foreground text-sm border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-secondary text-foreground text-sm border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-coral-light transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              Search
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.form>
  );
};

export default SearchForm;
