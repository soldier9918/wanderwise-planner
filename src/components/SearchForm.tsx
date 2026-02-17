import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const SearchForm = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [departureCity, setDepartureCity] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState("2");
  const [distanceUnit] = useState<"km" | "mi">("km");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/results?destination=${encodeURIComponent(destination)}&from=${encodeURIComponent(departureCity)}&checkIn=${checkIn ? format(checkIn, "yyyy-MM-dd") : ""}&checkOut=${checkOut ? format(checkOut, "yyyy-MM-dd") : ""}&guests=${guests}&unit=${distanceUnit}`
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

          {/* Depart */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="relative border-r border-border text-left w-full px-4 pt-7 pb-2.5 bg-card hover:bg-primary/5 transition-all cursor-pointer"
              >
                <span className="absolute left-4 top-2.5 text-xs font-bold text-foreground">Depart</span>
                <span className={cn("text-sm flex items-center gap-2", checkIn ? "text-foreground" : "text-muted-foreground")}>
                  <CalendarIcon className="w-4 h-4" />
                  {checkIn ? format(checkIn, "dd/MM/yyyy") : "Select date"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                disabled={(date) => date < new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          {/* Return */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="relative border-r border-border text-left w-full px-4 pt-7 pb-2.5 bg-card hover:bg-primary/5 transition-all cursor-pointer"
              >
                <span className="absolute left-4 top-2.5 text-xs font-bold text-foreground">Return</span>
                <span className={cn("text-sm flex items-center gap-2", checkOut ? "text-foreground" : "text-muted-foreground")}>
                  <CalendarIcon className="w-4 h-4" />
                  {checkOut ? format(checkOut, "dd/MM/yyyy") : "Select date"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                disabled={(date) => date < (checkIn || new Date())}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

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
