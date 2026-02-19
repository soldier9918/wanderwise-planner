import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AirportAutocompleteInput from "@/components/AirportAutocompleteInput";
import RangeDatePickerCalendar from "@/components/RangeDatePickerCalendar";

const PackageSearchForm = () => {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromIata, setFromIata] = useState("");
  const [toIata, setToIata] = useState("");
  const [depart, setDepart] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [cabinClass, setCabinClass] = useState("Economy");
  const [travellersOpen, setTravellersOpen] = useState(false);

  const totalTravellers = adults + children;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/results?from=${encodeURIComponent(fromIata || from)}&destination=${encodeURIComponent(toIata || to)}&checkIn=${depart ? format(depart, "yyyy-MM-dd") : ""}&checkOut=${returnDate ? format(returnDate, "yyyy-MM-dd") : ""}&guests=${totalTravellers}&cabin=${cabinClass}`
    );
  };

  const swapCities = () => {
    setFrom(to);
    setTo(from);
    setFromIata(toIata);
    setToIata(fromIata);
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
        <div className="flex items-stretch rounded-xl overflow-visible">
          {/* From */}
          <AirportAutocompleteInput
            label="From"
            placeholder="City or airport"
            value={from}
            onChange={(v) => { setFrom(v); if (!v) setFromIata(""); }}
            onSelect={(iata, display) => { setFrom(display); setFromIata(iata); }}
            className="flex-1"
          />

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
          <AirportAutocompleteInput
            label="To"
            placeholder="Country, city or airport"
            value={to}
            onChange={(v) => { setTo(v); if (!v) setToIata(""); }}
            onSelect={(iata, display) => { setTo(display); setToIata(iata); }}
            className="flex-1"
          />

          {/* Depart — unified dual-month calendar */}
          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="relative border-r border-border text-left flex-1 px-5 pt-10 pb-4 bg-card hover:bg-primary/5 transition-all cursor-pointer"
              >
                <span className="absolute left-5 top-3 text-base font-bold text-foreground">Depart</span>
                <span className={cn("text-lg", depart ? "text-foreground" : "text-muted-foreground")}>
                  {depart ? format(depart, "dd MMM yyyy") : "Add date"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto" align="start" sideOffset={8}>
              <RangeDatePickerCalendar
                departDate={depart}
                returnDate={returnDate}
                onDepartChange={(d) => { setDepart(d); setReturnDate(undefined); }}
                onReturnChange={(d) => setReturnDate(d)}
                onApply={() => setDatePopoverOpen(false)}
                hint="Select return date"
              />
            </PopoverContent>
          </Popover>

          {/* Return — opens same calendar */}
          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="relative border-r border-border text-left flex-1 px-5 pt-10 pb-4 bg-card hover:bg-primary/5 transition-all cursor-pointer"
              >
                <span className="absolute left-5 top-3 text-base font-bold text-foreground">Return</span>
                <span className={cn("text-lg", returnDate ? "text-foreground" : "text-muted-foreground")}>
                  {returnDate ? format(returnDate, "dd MMM yyyy") : "Add date"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto" align="start" sideOffset={8}>
              <RangeDatePickerCalendar
                departDate={depart}
                returnDate={returnDate}
                onDepartChange={(d) => { setDepart(d); setReturnDate(undefined); }}
                onReturnChange={(d) => setReturnDate(d)}
                onApply={() => setDatePopoverOpen(false)}
                hint="Select return date"
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
                    <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} disabled={adults <= 1} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-base font-semibold text-foreground w-6 text-center">{adults}</span>
                    <button type="button" onClick={() => setAdults(Math.min(9, adults + 1))} disabled={adults >= 9} className="w-9 h-9 rounded-lg border border-primary bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
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
                    <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} disabled={children <= 0} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-base font-semibold text-foreground w-6 text-center">{children}</span>
                    <button type="button" onClick={() => setChildren(Math.min(6, children + 1))} disabled={children >= 6} className="w-9 h-9 rounded-lg border border-primary bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
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
            className="px-10 bg-primary text-primary-foreground font-bold text-xl hover:bg-coral-light transition-colors flex items-center gap-2 shrink-0 rounded-r-xl"
          >
            Search
          </button>
        </div>
      </div>
    </motion.form>
  );
};

export default PackageSearchForm;
