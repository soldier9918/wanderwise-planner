import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarIcon, ChevronDown, Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const HotelSearchForm = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [travellersOpen, setTravellersOpen] = useState(false);

  const totalGuests = adults + children;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/results?destination=${encodeURIComponent(destination)}&checkIn=${checkIn ? format(checkIn, "yyyy-MM-dd") : ""}&checkOut=${checkOut ? format(checkOut, "yyyy-MM-dd") : ""}&guests=${totalGuests}&rooms=${rooms}`
    );
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
        <div className="bg-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl font-semibold text-foreground">
              Find your perfect stay
            </h3>
          </div>

          {/* Main Search Row */}
          <div className="flex items-stretch border border-border rounded-xl overflow-hidden">
            {/* Destination */}
            <div className="relative flex-[2] border-r border-border">
              <label className="absolute left-5 top-3 text-base font-bold text-foreground">
                Where do you want to go?
              </label>
              <input
                type="text"
                placeholder="Enter a destination or hotel name"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-5 pt-10 pb-4 bg-card text-foreground placeholder:text-muted-foreground text-lg outline-none transition-all focus:bg-primary/5"
              />
            </div>

            {/* Check-in */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="relative border-r border-border text-left flex-1 px-5 pt-10 pb-4 bg-card hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <span className="absolute left-5 top-3 text-base font-bold text-foreground">Check-in</span>
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

            {/* Check-out */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="relative border-r border-border text-left flex-1 px-5 pt-10 pb-4 bg-card hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <span className="absolute left-5 top-3 text-base font-bold text-foreground">Check-out</span>
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

            {/* Guests and Rooms */}
            <Popover open={travellersOpen} onOpenChange={setTravellersOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="relative text-left flex-1 border-r border-border px-5 pt-10 pb-4 bg-card hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <span className="absolute left-5 top-3 text-base font-bold text-foreground">Guests & rooms</span>
                  <span className="text-lg text-foreground">
                    {totalGuests} {totalGuests === 1 ? "guest" : "guests"}, {rooms} {rooms === 1 ? "room" : "rooms"}
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

                  {/* Rooms */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-foreground">Rooms</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setRooms(Math.max(1, rooms - 1))}
                        disabled={rooms <= 1}
                        className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-base font-semibold text-foreground w-6 text-center">{rooms}</span>
                      <button
                        type="button"
                        onClick={() => setRooms(Math.min(5, rooms + 1))}
                        disabled={rooms >= 5}
                        className="w-9 h-9 rounded-lg border border-primary bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
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

            {/* Search Button */}
            <button
              type="submit"
              className="px-10 bg-primary text-primary-foreground font-bold text-xl hover:bg-coral-light transition-colors flex items-center gap-2 shrink-0"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </motion.form>
  );
};

export default HotelSearchForm;
