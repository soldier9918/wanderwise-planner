import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, TrendingDown } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  addMonths,
  subMonths,
  isBefore,
  startOfDay,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";

interface FlightPriceCalendarProps {
  origin: string;
  month: Date;
  onDaySelect: (date: Date) => void;
  selectedDate?: Date;
}

// Monday-first weekday headers
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function getPriceColor(price: number, prices: number[]): "cheap" | "mid" | "expensive" {
  if (prices.length === 0) return "expensive";
  const sorted = [...prices].sort((a, b) => a - b);
  const third = Math.ceil(sorted.length / 3);
  const low = sorted[third - 1];
  const mid = sorted[third * 2 - 1];
  if (price <= low) return "cheap";
  if (price <= mid) return "mid";
  return "expensive";
}

// Convert JS Sunday=0 to Monday=0 index
function mondayIndex(date: Date): number {
  const day = getDay(date); // 0=Sun
  return day === 0 ? 6 : day - 1;
}

const FlightPriceCalendar = ({ origin, month, onDaySelect, selectedDate }: FlightPriceCalendarProps) => {
  const { formatPrice } = useCurrency();
  const [calendarMonth, setCalendarMonth] = useState<Date>(startOfMonth(month));
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = startOfDay(new Date());

  const fetchPrices = useCallback(async (iata: string) => {
    if (!iata) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("amadeus-flight-inspiration", {
        method: "GET",
        headers: {},
        // Pass query params by appending to the function name won't work with invoke,
        // so we use body to pass params and handle in GET edge function via URL
      });

      // supabase.functions.invoke doesn't support GET query params directly,
      // so we call the function URL manually
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/amadeus-flight-inspiration?origin=${encodeURIComponent(iata)}`,
        {
          headers: {
            "apikey": anonKey,
            "Authorization": `Bearer ${anonKey}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch price data");
      }
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setPrices(json.prices || {});
    } catch (err) {
      console.error("FlightPriceCalendar fetch error:", err);
      setError("Price data unavailable for this route");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (origin) {
      fetchPrices(origin);
    }
  }, [origin, calendarMonth, fetchPrices]);

  // Build the calendar grid cells
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start with empty cells (Monday-first)
  const startPad = mondayIndex(monthStart);
  const cells: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...daysInMonth,
  ];
  // Pad end to complete the last row
  while (cells.length % 7 !== 0) cells.push(null);

  const allPriceValues = Object.values(prices);
  const cheapestPrice = allPriceValues.length > 0 ? Math.min(...allPriceValues) : null;

  const isPrevDisabled = isSameMonth(calendarMonth, today) || isBefore(calendarMonth, today);

  const goToPrev = () => {
    if (!isPrevDisabled) setCalendarMonth((m) => subMonths(m, 1));
  };

  const goToNext = () => setCalendarMonth((m) => addMonths(m, 1));

  const handleDayClick = (date: Date) => {
    if (isBefore(date, today)) return;
    onDaySelect(date);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(35).fill(null).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 w-full select-none">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goToPrev}
          disabled={isPrevDisabled}
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
            isPrevDisabled
              ? "text-muted-foreground/30 cursor-not-allowed"
              : "text-foreground hover:bg-secondary"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-sm font-semibold text-foreground">
          {format(calendarMonth, "MMMM yyyy")}
        </span>

        <button
          type="button"
          onClick={goToNext}
          className="w-7 h-7 rounded-md flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} />;
          }

          const dateKey = format(date, "yyyy-MM-dd");
          const price = prices[dateKey];
          const isPast = isBefore(date, today);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const isCheapest = price !== null && price !== undefined && cheapestPrice !== null && price === cheapestPrice;

          let priceColor: "cheap" | "mid" | "expensive" = "expensive";
          if (price !== undefined) {
            priceColor = getPriceColor(price, allPriceValues);
          }

          return (
            <button
              key={dateKey}
              type="button"
              disabled={isPast}
              onClick={() => handleDayClick(date)}
              className={cn(
                "relative flex flex-col items-center justify-start rounded-lg pt-1.5 pb-1 px-0.5 min-h-[56px] text-xs transition-all border",
                isPast
                  ? "opacity-30 cursor-not-allowed border-transparent"
                  : "cursor-pointer hover:border-primary/30",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : isToday
                    ? "border-primary/50 bg-primary/5"
                    : "border-transparent hover:bg-primary/5"
              )}
            >
              {/* Day number */}
              <span className={cn(
                "font-semibold leading-none text-sm",
                isSelected ? "text-primary-foreground" : "text-foreground"
              )}>
                {format(date, "d")}
              </span>

              {/* Price badge */}
              {price !== undefined && !isPast && (
                <span className={cn(
                  "mt-1 text-[10px] font-medium leading-none",
                  isSelected
                    ? "text-primary-foreground/90"
                    : priceColor === "cheap"
                      ? "text-green-600 dark:text-green-400"
                      : priceColor === "mid"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-muted-foreground"
                )}>
                  {formatPrice(price)}
                </span>
              )}

              {/* Best price chip */}
              {isCheapest && !isPast && !isSelected && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-green-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingDown className="w-2 h-2" />
                  Best
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Error / empty state */}
      {error && (
        <p className="text-center text-xs text-muted-foreground mt-3 py-2">{error}</p>
      )}
      {!error && !loading && allPriceValues.length === 0 && (
        <p className="text-center text-xs text-muted-foreground mt-3 py-2">
          No price data available for this route
        </p>
      )}

      {/* Legend */}
      {allPriceValues.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-3 pt-2 border-t border-border">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            Cheap
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            Mid
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/50 inline-block" />
            Pricier
          </span>
        </div>
      )}
    </div>
  );
};

export default FlightPriceCalendar;
