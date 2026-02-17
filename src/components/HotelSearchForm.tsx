import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarIcon, ChevronDown } from "lucide-react";
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
  const [adults, setAdults] = useState("2");
  const [rooms, setRooms] = useState("1");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/results?destination=${encodeURIComponent(destination)}&checkIn=${checkIn ? format(checkIn, "yyyy-MM-dd") : ""}&checkOut=${checkOut ? format(checkOut, "yyyy-MM-dd") : ""}&guests=${adults}&rooms=${rooms}`
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
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="relative text-left flex-1 border-r border-border px-5 pt-10 pb-4 bg-card hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <span className="absolute left-5 top-3 text-base font-bold text-foreground">Guests and rooms</span>
                  <span className="text-lg text-foreground">
                    {adults} {Number(adults) === 1 ? "adult" : "adults"}, {rooms} {Number(rooms) === 1 ? "room" : "rooms"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="end">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1.5 block">Adults</label>
                    <select
                      value={adults}
                      onChange={(e) => setAdults(e.target.value)}
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
                    <label className="text-sm font-semibold text-foreground mb-1.5 block">Rooms</label>
                    <select
                      value={rooms}
                      onChange={(e) => setRooms(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm border border-border outline-none"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "Room" : "Rooms"}
                        </option>
                      ))}
                    </select>
                  </div>
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
