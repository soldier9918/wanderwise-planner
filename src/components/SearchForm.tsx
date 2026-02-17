import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeftRight, CalendarIcon, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [cabinClass, setCabinClass] = useState("Economy");
  const [tripType, setTripType] = useState("Return");
  const [nearbyFrom, setNearbyFrom] = useState(false);
  const [nearbyTo, setNearbyTo] = useState(false);
  const [directFlights, setDirectFlights] = useState(false);
  const [addHotel, setAddHotel] = useState(true);
  const [distanceUnit] = useState<"km" | "mi">("km");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/results?destination=${encodeURIComponent(destination)}&from=${encodeURIComponent(departureCity)}&checkIn=${checkIn ? format(checkIn, "yyyy-MM-dd") : ""}&checkOut=${checkOut ? format(checkOut, "yyyy-MM-dd") : ""}&guests=${guests}&unit=${distanceUnit}&cabin=${cabinClass}&direct=${directFlights}`
    );
  };

  const swapCities = () => {
    setDepartureCity(destination);
    setDestination(departureCity);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      onSubmit={handleSearch}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="bg-navy/80 backdrop-blur-sm rounded-2xl p-4 shadow-elevated border border-white/10">
       <div className="bg-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl font-semibold text-foreground">
            Find your perfect trip
          </h3>
        </div>

        {/* Trip Type Selector */}
        <div className="mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                {tripType}
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-36 p-1" align="start">
              {["Return", "One way", "Multi-city"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTripType(type)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                    tripType === type
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-secondary"
                  )}
                >
                  {type}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {/* Main Search Row */}
        <div className="flex items-stretch border border-border rounded-xl overflow-hidden">
          {/* From */}
          <div className="relative flex-1 border-r border-border">
            <label className="absolute left-4 top-2.5 text-sm font-bold text-foreground">From</label>
            <input
              type="text"
              placeholder="City or airport"
              value={departureCity}
              onChange={(e) => setDepartureCity(e.target.value)}
              className="w-full px-4 pt-8 pb-3 bg-card text-foreground placeholder:text-muted-foreground text-base outline-none transition-all focus:bg-primary/5"
            />
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={swapCities}
            className="flex items-center justify-center w-12 bg-card border-r border-border hover:bg-secondary transition-colors shrink-0"
            title="Swap cities"
          >
            <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* To */}
          <div className="relative flex-1 border-r border-border">
            <label className="absolute left-4 top-2.5 text-sm font-bold text-foreground">To</label>
            <input
              type="text"
              placeholder="Country, city or airport"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 pt-8 pb-3 bg-card text-foreground placeholder:text-muted-foreground text-base outline-none transition-all focus:bg-primary/5"
            />
          </div>

          {/* Depart */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="relative border-r border-border text-left flex-1 px-4 pt-8 pb-3 bg-card hover:bg-primary/5 transition-all cursor-pointer"
              >
                <span className="absolute left-4 top-2.5 text-sm font-bold text-foreground">Depart</span>
                <span className={cn("text-base flex items-center gap-2", checkIn ? "text-foreground" : "text-muted-foreground")}>
                  <CalendarIcon className="w-4 h-4" />
                  {checkIn ? format(checkIn, "dd/MM/yyyy") : "Add date"}
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
          {tripType !== "One way" && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="relative border-r border-border text-left flex-1 px-4 pt-8 pb-3 bg-card hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <span className="absolute left-4 top-2.5 text-sm font-bold text-foreground">Return</span>
                  <span className={cn("text-base flex items-center gap-2", checkOut ? "text-foreground" : "text-muted-foreground")}>
                    <CalendarIcon className="w-4 h-4" />
                    {checkOut ? format(checkOut, "dd/MM/yyyy") : "Add date"}
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
          )}

          {/* Travellers & Cabin Class */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="relative text-left flex-1 px-4 pt-8 pb-3 bg-card hover:bg-primary/5 transition-all cursor-pointer"
              >
                <span className="absolute left-4 top-2.5 text-sm font-bold text-foreground">Travellers & cabin class</span>
                <span className="text-base text-foreground">
                  {guests} {Number(guests) === 1 ? "Adult" : "Adults"}, {cabinClass}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="end">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Travellers</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm border border-border outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Adult" : "Adults"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Cabin class</label>
                  <select
                    value={cabinClass}
                    onChange={(e) => setCabinClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm border border-border outline-none"
                  >
                    {["Economy", "Premium Economy", "Business", "First"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Search Button */}
          <button
            type="submit"
            className="px-8 bg-primary text-primary-foreground font-semibold text-base hover:bg-coral-light transition-colors flex items-center gap-2 shrink-0"
          >
            Search
          </button>
        </div>

        {/* Checkboxes Row */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mt-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="nearbyFrom"
              checked={nearbyFrom}
              onCheckedChange={(v) => setNearbyFrom(v === true)}
            />
            <label htmlFor="nearbyFrom" className="text-sm text-foreground cursor-pointer">
              Add nearby airports
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="nearbyTo"
              checked={nearbyTo}
              onCheckedChange={(v) => setNearbyTo(v === true)}
            />
            <label htmlFor="nearbyTo" className="text-sm text-foreground cursor-pointer">
              Add nearby airports
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="directFlights"
              checked={directFlights}
              onCheckedChange={(v) => setDirectFlights(v === true)}
            />
            <label htmlFor="directFlights" className="text-sm text-foreground cursor-pointer">
              Direct flights
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="addHotel"
              checked={addHotel}
              onCheckedChange={(v) => setAddHotel(v === true)}
            />
            <label htmlFor="addHotel" className="text-sm text-foreground cursor-pointer">
              Add a hotel
            </label>
          </div>
        </div>
       </div>
      </div>
    </motion.form>
  );
};

export default SearchForm;
