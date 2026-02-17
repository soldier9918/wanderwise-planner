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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0 border border-border rounded-xl overflow-hidden">
          <div className="relative lg:col-span-1 border-r border-border">
            <label className="absolute left-4 top-2.5 text-xs font-bold text-foreground">From</label>
            <input
              type="text"
              placeholder="City or airport"
              value={departureCity}
              onChange={(e) => setDepartureCity(e.target.value)}
              className="w-full px-4 pt-7 pb-2.5 bg-card text-foreground placeholder:text-muted-foreground text-sm outline-none transition-all focus:bg-primary/5"
            />
          </div>
          <div className="relative lg:col-span-1 border-r border-border">
            <label className="absolute left-4 top-2.5 text-xs font-bold text-foreground">To</label>
            <input
              type="text"
              placeholder="City or airport"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 pt-7 pb-2.5 bg-card text-foreground placeholder:text-muted-foreground text-sm outline-none transition-all focus:bg-primary/5"
            />
          </div>
          <div className="relative border-r border-border">
            <label className="absolute left-4 top-2.5 text-xs font-bold text-foreground">Depart</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-4 pt-7 pb-2.5 bg-card text-foreground text-sm outline-none transition-all focus:bg-primary/5"
            />
          </div>
          <div className="relative border-r border-border">
            <label className="absolute left-4 top-2.5 text-xs font-bold text-foreground">Return</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-4 pt-7 pb-2.5 bg-card text-foreground text-sm outline-none transition-all focus:bg-primary/5"
            />
          </div>
          <div className="relative flex">
            <div className="relative flex-1">
              <label className="absolute left-4 top-2.5 text-xs font-bold text-foreground">Travellers</label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full px-4 pt-7 pb-2.5 bg-card text-foreground text-sm outline-none transition-all focus:bg-primary/5 appearance-none"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "traveller" : "travellers"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-coral-light transition-colors flex items-center gap-2"
          >
            Search
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.form>
  );
};

export default SearchForm;
