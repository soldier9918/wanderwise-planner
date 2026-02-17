import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, CalendarIcon, ChevronDown, Minus, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FlightLeg {
  from: string;
  to: string;
  depart: Date | undefined;
}

const SearchForm = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [departureCity, setDepartureCity] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [travellersOpen, setTravellersOpen] = useState(false);
  const [multiTravellersOpen, setMultiTravellersOpen] = useState(false);
  const [cabinClass, setCabinClass] = useState("Economy");
  const totalTravellers = adults + children;
  const [tripType, setTripType] = useState("Return");
  const [nearbyFrom, setNearbyFrom] = useState(false);
  const [nearbyTo, setNearbyTo] = useState(false);
  const [directFlights, setDirectFlights] = useState(false);
  const [addHotel, setAddHotel] = useState(false);
  const [distanceUnit] = useState<"km" | "mi">("km");
  const [multiCityLegs, setMultiCityLegs] = useState<FlightLeg[]>([
    { from: "", to: "", depart: undefined },
    { from: "", to: "", depart: undefined },
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/results?destination=${encodeURIComponent(destination)}&from=${encodeURIComponent(departureCity)}&checkIn=${checkIn ? format(checkIn, "yyyy-MM-dd") : ""}&checkOut=${checkOut ? format(checkOut, "yyyy-MM-dd") : ""}&guests=${totalTravellers}&unit=${distanceUnit}&cabin=${cabinClass}&direct=${directFlights}`
    );
  };

  const swapCities = () => {
    setDepartureCity(destination);
    setDestination(departureCity);
  };

  const swapMultiCityCities = (index: number) => {
    setMultiCityLegs((prev) => {
      const updated = [...prev];
      const temp = updated[index].from;
      updated[index] = { ...updated[index], from: updated[index].to, to: temp };
      return updated;
    });
  };

  const updateLeg = (index: number, field: keyof FlightLeg, value: string | Date | undefined) => {
    setMultiCityLegs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addLeg = () => {
    if (multiCityLegs.length < 6) {
      setMultiCityLegs((prev) => [...prev, { from: "", to: "", depart: undefined }]);
    }
  };

  const removeLeg = (index: number) => {
    if (multiCityLegs.length > 2) {
      setMultiCityLegs((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const isMultiCity = tripType === "Multi-city";

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      onSubmit={handleSearch}
      className="w-full max-w-7xl mx-auto"
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

        {/* Multi-city Legs */}
        {isMultiCity ? (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {multiCityLegs.map((leg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-stretch border border-border rounded-xl overflow-hidden">
                    {/* Flight number label */}
                    <div className="flex items-center justify-center w-10 bg-secondary text-xs font-bold text-muted-foreground shrink-0">
                      {index + 1}
                    </div>

                    {/* From */}
                    <div className="relative flex-1 border-r border-border">
                      <label className="absolute left-5 top-3 text-base font-bold text-foreground">From</label>
                      <input
                        type="text"
                        placeholder="City or airport"
                        value={leg.from}
                        onChange={(e) => updateLeg(index, "from", e.target.value)}
                        className="w-full px-5 pt-10 pb-4 bg-card text-foreground placeholder:text-muted-foreground text-lg outline-none transition-all focus:bg-primary/5"
                      />
                    </div>

                    {/* Swap */}
                    <button
                      type="button"
                      onClick={() => swapMultiCityCities(index)}
                      className="flex items-center justify-center w-12 bg-card border-r border-border hover:bg-secondary transition-colors shrink-0"
                      title="Swap cities"
                    >
                      <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
                    </button>

                    {/* To */}
                    <div className="relative flex-1 border-r border-border">
                      <label className="absolute left-5 top-3 text-base font-bold text-foreground">To</label>
                      <input
                        type="text"
                        placeholder="Country, city or airport"
                        value={leg.to}
                        onChange={(e) => updateLeg(index, "to", e.target.value)}
                        className="w-full px-5 pt-10 pb-4 bg-card text-foreground placeholder:text-muted-foreground text-lg outline-none transition-all focus:bg-primary/5"
                      />
                    </div>

                    {/* Depart */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="relative border-r border-border text-left flex-1 px-5 pt-10 pb-4 bg-card hover:bg-primary/5 transition-all cursor-pointer"
                        >
                          <span className="absolute left-5 top-3 text-base font-bold text-foreground">Depart</span>
                          <span className={cn("text-lg flex items-center gap-2", leg.depart ? "text-foreground" : "text-muted-foreground")}>
                            <CalendarIcon className="w-4 h-4" />
                            {leg.depart ? format(leg.depart, "dd/MM/yyyy") : "Add date"}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={leg.depart}
                          onSelect={(d) => updateLeg(index, "depart", d)}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>

                    {/* Remove leg button (only if more than 2 legs) */}
                    {multiCityLegs.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeLeg(index)}
                        className="flex items-center justify-center w-12 bg-card hover:bg-destructive/10 transition-colors shrink-0"
                        title="Remove flight"
                      >
                        <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add flight + Travellers + Search row */}
            <div className="flex items-stretch border border-border rounded-xl overflow-hidden">
              {/* Add another flight */}
              {multiCityLegs.length < 6 && (
                <button
                  type="button"
                  onClick={addLeg}
                  className="flex items-center gap-2 px-5 py-4 bg-card hover:bg-primary/5 transition-colors border-r border-border text-primary font-semibold text-sm shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add another flight
                </button>
              )}

              {/* Travellers & Cabin Class */}
              <Popover open={multiTravellersOpen} onOpenChange={setMultiTravellersOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="relative text-left flex-1 px-5 pt-10 pb-4 bg-card hover:bg-primary/5 transition-all cursor-pointer border-r border-border"
                  >
                    <span className="absolute left-5 top-3 text-base font-bold text-foreground">Travellers & cabin class</span>
                    <span className="text-lg text-foreground">
                      {totalTravellers} {totalTravellers === 1 ? "traveller" : "travellers"}, {cabinClass}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
                  <div className="p-5 space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-semibold text-foreground">Adults</p>
                        <p className="text-sm text-muted-foreground">Aged 18+</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} disabled={adults <= 1} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><Minus className="w-4 h-4" /></button>
                        <span className="text-base font-semibold text-foreground w-6 text-center">{adults}</span>
                        <button type="button" onClick={() => setAdults(Math.min(9, adults + 1))} disabled={adults >= 9} className="w-9 h-9 rounded-lg border border-primary bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-semibold text-foreground">Children</p>
                        <p className="text-sm text-muted-foreground">Aged 0 to 17</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} disabled={children <= 0} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><Minus className="w-4 h-4" /></button>
                        <span className="text-base font-semibold text-foreground w-6 text-center">{children}</span>
                        <button type="button" onClick={() => setChildren(Math.min(6, children + 1))} disabled={children >= 6} className="w-9 h-9 rounded-lg border border-primary bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">Your age at time of travel must be valid for the age category booked. Airlines have restrictions on under 18s travelling alone.</p>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">Cabin Class</label>
                      <select value={cabinClass} onChange={(e) => setCabinClass(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-secondary text-foreground text-sm border border-border outline-none">
                        {["Economy", "Premium Economy", "Business", "First"].map((c) => (<option key={c} value={c}>{c}</option>))}
                      </select>
                    </div>
                    <button type="button" onClick={() => setMultiTravellersOpen(false)} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">Apply</button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Search Button */}
              <button
                type="submit"
                className="px-10 bg-primary text-primary-foreground font-bold text-xl hover:bg-coral-light transition-colors flex items-center gap-2 shrink-0"
              >
                Search
              </button>
            </div>
          </div>
        ) : (
          /* Standard single-row layout */
          <div className="flex items-stretch border border-border rounded-xl overflow-hidden">
            {/* From */}
            <div className="relative flex-1 border-r border-border">
              <label className="absolute left-5 top-3 text-base font-bold text-foreground">From</label>
              <input
                type="text"
                placeholder="City or airport"
                value={departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
                className="w-full px-5 pt-10 pb-4 bg-card text-foreground placeholder:text-muted-foreground text-lg outline-none transition-all focus:bg-primary/5"
              />
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={swapCities}
              className="flex items-center justify-center w-12 bg-card border-r border-border hover:bg-secondary transition-colors shrink-0"
              title="Swap cities"
            >
              <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* To */}
            <div className="relative flex-1 border-r border-border">
              <label className="absolute left-5 top-3 text-base font-bold text-foreground">To</label>
              <input
                type="text"
                placeholder="Country, city or airport"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-5 pt-10 pb-4 bg-card text-foreground placeholder:text-muted-foreground text-lg outline-none transition-all focus:bg-primary/5"
              />
            </div>

            {/* Depart */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="relative border-r border-border text-left flex-1 px-5 pt-10 pb-4 bg-card hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <span className="absolute left-5 top-3 text-base font-bold text-foreground">Depart</span>
                  <span className={cn("text-lg flex items-center gap-2", checkIn ? "text-foreground" : "text-muted-foreground")}>
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
                    className="relative border-r border-border text-left flex-1 px-5 pt-10 pb-4 bg-card hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    <span className="absolute left-5 top-3 text-base font-bold text-foreground">Return</span>
                    <span className={cn("text-lg flex items-center gap-2", checkOut ? "text-foreground" : "text-muted-foreground")}>
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
            <Popover open={travellersOpen} onOpenChange={setTravellersOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="relative text-left flex-1 border-r border-border px-5 pt-10 pb-4 bg-card hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <span className="absolute left-5 top-3 text-base font-bold text-foreground">Travellers & cabin class</span>
                  <span className="text-lg text-foreground">
                    {totalTravellers} {totalTravellers === 1 ? "traveller" : "travellers"}, {cabinClass}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
                <div className="p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-foreground">Adults</p>
                      <p className="text-sm text-muted-foreground">Aged 18+</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} disabled={adults <= 1} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><Minus className="w-4 h-4" /></button>
                      <span className="text-base font-semibold text-foreground w-6 text-center">{adults}</span>
                      <button type="button" onClick={() => setAdults(Math.min(9, adults + 1))} disabled={adults >= 9} className="w-9 h-9 rounded-lg border border-primary bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-foreground">Children</p>
                      <p className="text-sm text-muted-foreground">Aged 0 to 17</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} disabled={children <= 0} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><Minus className="w-4 h-4" /></button>
                      <span className="text-base font-semibold text-foreground w-6 text-center">{children}</span>
                      <button type="button" onClick={() => setChildren(Math.min(6, children + 1))} disabled={children >= 6} className="w-9 h-9 rounded-lg border border-primary bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Your age at time of travel must be valid for the age category booked. Airlines have restrictions on under 18s travelling alone.</p>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1.5 block">Cabin Class</label>
                    <select value={cabinClass} onChange={(e) => setCabinClass(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-secondary text-foreground text-sm border border-border outline-none">
                      {["Economy", "Premium Economy", "Business", "First"].map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                  <button type="button" onClick={() => setTravellersOpen(false)} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">Apply</button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Search Button */}
            <button
              type="submit"
              className="px-10 bg-primary text-primary-foreground font-bold text-xl hover:bg-coral-light transition-colors flex items-center gap-2 shrink-0"
            >
              Search
            </button>
          </div>
        )}

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
