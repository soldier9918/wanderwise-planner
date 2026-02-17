import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, CalendarIcon, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const PackageSearchForm = () => {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [depart, setDepart] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [guests, setGuests] = useState("2");
  const [cabinClass, setCabinClass] = useState("Economy");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/results?from=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&checkIn=${depart ? format(depart, "yyyy-MM-dd") : ""}&checkOut=${returnDate ? format(returnDate, "yyyy-MM-dd") : ""}&guests=${guests}&cabin=${cabinClass}`
    );
  };

  const swapCities = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      onSubmit={handleSearch}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="bg-navy/80 backdrop-blur-sm rounded-2xl p-3 shadow-elevated border border-white/10">
        <div className="flex items-stretch rounded-xl overflow-hidden">
          {/* From */}
          <div className="relative flex-1 bg-card border-r border-border">
            <label className="absolute left-4 top-2.5 text-xs font-bold text-muted-foreground">From</label>
            <input
              type="text"
              placeholder="City or airport"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-4 pt-7 pb-2.5 bg-card text-foreground placeholder:text-muted-foreground text-base outline-none transition-all focus:ring-2 focus:ring-primary/50 focus:ring-inset"
            />
          </div>

          {/* Swap */}
          <button
            type="button"
            onClick={swapCities}
            className="flex items-center justify-center w-10 bg-card border-r border-border hover:bg-secondary transition-colors shrink-0"
            title="Swap cities"
          >
            <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* To */}
          <div className="relative flex-1 bg-card border-r border-border">
            <label className="absolute left-4 top-2.5 text-xs font-bold text-muted-foreground">To</label>
            <input
              type="text"
              placeholder="City or airport"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-4 pt-7 pb-2.5 bg-card text-foreground placeholder:text-muted-foreground text-base outline-none transition-all focus:ring-2 focus:ring-primary/50 focus:ring-inset"
            />
          </div>

          {/* Depart */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="relative border-r border-border text-left flex-1 px-4 pt-7 pb-2.5 bg-card hover:bg-secondary/50 transition-all cursor-pointer"
              >
                <span className="absolute left-4 top-2.5 text-xs font-bold text-muted-foreground">Depart</span>
                <span className={cn("text-base flex items-center gap-1.5", depart ? "text-foreground" : "text-muted-foreground")}>
                  {depart ? format(depart, "dd/MM/yyyy") : "Add date"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={depart}
                onSelect={setDepart}
                disabled={(date) => date < new Date()}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Return */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="relative border-r border-border text-left flex-1 px-4 pt-7 pb-2.5 bg-card hover:bg-secondary/50 transition-all cursor-pointer"
              >
                <span className="absolute left-4 top-2.5 text-xs font-bold text-muted-foreground">Return</span>
                <span className={cn("text-base flex items-center gap-1.5", returnDate ? "text-foreground" : "text-muted-foreground")}>
                  {returnDate ? format(returnDate, "dd/MM/yyyy") : "Add date"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={returnDate}
                onSelect={setReturnDate}
                disabled={(date) => date < (depart || new Date())}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Travellers */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="relative text-left flex-1 border-r border-border px-4 pt-7 pb-2.5 bg-card hover:bg-secondary/50 transition-all cursor-pointer"
              >
                <span className="absolute left-4 top-2.5 text-xs font-bold text-muted-foreground">Travellers</span>
                <span className="text-base text-foreground flex items-center gap-1.5">
                  {guests} {Number(guests) === 1 ? "traveller" : "travellers"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-4" align="end">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Travellers</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm border border-border outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Traveller" : "Travellers"}
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

          {/* Search */}
          <button
            type="submit"
            className="px-8 bg-primary text-primary-foreground font-semibold text-base hover:bg-coral-light transition-colors flex items-center gap-2 shrink-0 rounded-r-xl"
          >
            Search
          </button>
        </div>
      </div>
    </motion.form>
  );
};

export default PackageSearchForm;
