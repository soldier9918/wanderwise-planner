import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, Minus, Plus } from "lucide-react";
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
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [cabinClass, setCabinClass] = useState("Economy");
  const [travellersOpen, setTravellersOpen] = useState(false);

  const totalTravellers = adults + children;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/results?from=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&checkIn=${depart ? format(depart, "yyyy-MM-dd") : ""}&checkOut=${returnDate ? format(returnDate, "yyyy-MM-dd") : ""}&guests=${totalTravellers}&cabin=${cabinClass}`
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
      className="w-full max-w-7xl mx-auto"
    >
      <div className="bg-navy/80 backdrop-blur-sm rounded-2xl p-4 shadow-elevated border border-white/10">
        <div className="flex items-stretch rounded-xl overflow-hidden">
          {/* From */}
          <div className="relative flex-1 bg-card border-r border-border">
            <label className="absolute left-5 top-3 text-base font-bold text-foreground">From</label>
            <input
              type="text"
              placeholder="City or airport"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-5 pt-10 pb-4 bg-card text-foreground placeholder:text-muted-foreground text-lg outline-none transition-all focus:ring-2 focus:ring-primary/50 focus:ring-inset"
            />
          </div>

          {/* Swap */}
          <button
            type="button"
            onClick={swapCities}
            className="flex items-center justify-center w-12 bg-card border-r border-border hover:bg-secondary transition-colors shrink-0"
            title="Swap cities"
          >
            <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* To */}
          <div className="relative flex-1 bg-card border-r border-border">
            <label className="absolute left-5 top-3 text-base font-bold text-foreground">To</label>
            <input
              type="text"
              placeholder="City or airport"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-5 pt-10 pb-4 bg-card text-foreground placeholder:text-muted-foreground text-lg outline-none transition-all focus:ring-2 focus:ring-primary/50 focus:ring-inset"
            />
          </div>

          {/* Depart */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="relative border-r border-border text-left flex-1 px-5 pt-10 pb-4 bg-card hover:bg-secondary/50 transition-all cursor-pointer"
              >
                <span className="absolute left-5 top-3 text-base font-bold text-foreground">Depart</span>
                <span className={cn("text-lg flex items-center gap-1.5", depart ? "text-foreground" : "text-muted-foreground")}>
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
                className="relative border-r border-border text-left flex-1 px-5 pt-10 pb-4 bg-card hover:bg-secondary/50 transition-all cursor-pointer"
              >
                <span className="absolute left-5 top-3 text-base font-bold text-foreground">Return</span>
                <span className={cn("text-lg flex items-center gap-1.5", returnDate ? "text-foreground" : "text-muted-foreground")}>
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
          <Popover open={travellersOpen} onOpenChange={setTravellersOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="relative text-left flex-1 border-r border-border px-5 pt-10 pb-4 bg-card hover:bg-secondary/50 transition-all cursor-pointer"
              >
                <span className="absolute left-5 top-3 text-base font-bold text-foreground">Travellers</span>
                <span className="text-lg text-foreground flex items-center gap-1.5">
                  {totalTravellers} {totalTravellers === 1 ? "traveller" : "travellers"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
              <div className="p-5 space-y-5">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-foreground">Adults</p>
                    <p className="text-sm text-muted-foreground">Aged 18+</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      disabled={adults <= 1}
                      className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-base font-semibold text-foreground w-6 text-center">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults(Math.min(9, adults + 1))}
                      disabled={adults >= 9}
                      className="w-9 h-9 rounded-lg border border-primary bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-foreground">Children</p>
                    <p className="text-sm text-muted-foreground">Aged 0 to 17</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      disabled={children <= 0}
                      className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-base font-semibold text-foreground w-6 text-center">{children}</span>
                    <button
                      type="button"
                      onClick={() => setChildren(Math.min(6, children + 1))}
                      disabled={children >= 6}
                      className="w-9 h-9 rounded-lg border border-primary bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your age at time of travel must be valid for the age category booked. Airlines have restrictions on under 18s travelling alone.
                </p>

                {/* Cabin Class */}
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Cabin Class</label>
                  <select
                    value={cabinClass}
                    onChange={(e) => setCabinClass(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary text-foreground text-sm border border-border outline-none"
                  >
                    {["Economy", "Premium Economy", "Business", "First"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setTravellersOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                  Apply
                </button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Search */}
          <button
            type="submit"
            className="px-10 bg-primary text-primary-foreground font-semibold text-lg hover:bg-coral-light transition-colors flex items-center gap-2 shrink-0 rounded-r-xl"
          >
            Search
          </button>
        </div>
      </div>
    </motion.form>
  );
};

export default PackageSearchForm;
