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
  isAfter,
  startOfDay,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";

interface FlightPriceCalendarProps {
  origin: string;
  month: Date;
  onDaySelect: (date: Date) => void;
  selectedDate?: Date;
  returnDate?: Date;
  onReturnSelect?: (date: Date) => void;
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

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const FlightPriceCalendar = ({ origin, month, onDaySelect, selectedDate, returnDate, onReturnSelect }: FlightPriceCalendarProps) => {
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
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/amadeus-flight-inspiration?origin=${encodeURIComponent(iata)}`,
        {
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
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

    // If depart date is already set and this is a later date, treat as return date selection
    if (selectedDate && onReturnSelect && !isSameDay(date, selectedDate) && !isBefore(date, selectedDate)) {
      onReturnSelect(date);
      return;
    }
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
            <Skeleton key={i} className="h-[68px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full select-none">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPrev}
          disabled={isPrevDisabled}
          className={cn(
            "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
            isPrevDisabled
              ? "text-muted-foreground/30 cursor-not-allowed"
              : "text-foreground hover:bg-secondary"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-base font-bold text-foreground">
          {format(calendarMonth, "MMMM yyyy")}
        </span>

        <button
          type="button"
          onClick={goToNext}
          className="w-8 h-8 rounded-md flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-sm font-semibold text-muted-foreground py-1">
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
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          const isReturn = returnDate ? isSameDay(date, returnDate) : false;
          const isInRange = selectedDate && returnDate
            ? !isBefore(date, selectedDate) && !isAfter(date, returnDate) && !isSelected && !isReturn
            : false;
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
                "relative flex flex-col items-center justify-start rounded-lg pt-2 pb-1.5 px-0.5 min-h-[68px] text-xs transition-all border",
                isPast
                  ? "opacity-30 cursor-not-allowed border-transparent"
                  : "cursor-pointer hover:border-primary/30",
                isSelected || isReturn
                  ? "bg-primary text-primary-foreground border-primary"
                  : isInRange
                    ? "bg-primary/10 border-primary/20"
                    : isToday
                      ? "border-primary/50 bg-primary/5"
                      : "border-transparent hover:bg-primary/5"
              )}
            >
              {/* Day number */}
              <span className={cn(
                "font-bold leading-none text-base",
                isSelected || isReturn ? "text-primary-foreground" : "text-foreground"
              )}>
                {format(date, "d")}
              </span>

              {/* Price badge */}
              {price !== undefined && !isPast && (
                <span className={cn(
                  "mt-1 text-xs font-medium leading-none",
                  isSelected || isReturn
                    ? "text-primary-foreground/90"
                    : isInRange
                      ? "text-primary"
                      : priceColor === "cheap"
                        ? "text-success"
                        : priceColor === "mid"
                          ? "text-warning"
                          : "text-muted-foreground"
                )}>
                  {formatPrice(price)}
                </span>
              )}

              {/* Return label */}
              {isReturn && !isPast && (
                <span className="text-[9px] font-bold text-primary-foreground/80 leading-none mt-0.5">
                  Return
                </span>
              )}

              {/* Best price chip */}
              {isCheapest && !isPast && !isSelected && !isReturn && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-success text-white text-[8px] font-bold px-1 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingDown className="w-2 h-2" />
                  Best
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hint when depart selected but no return yet */}
      {selectedDate && !returnDate && onReturnSelect && (
        <p className="text-center text-xs text-primary font-medium mt-3 py-2">
          ✈ Now click a return date
        </p>
      )}

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
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-success inline-block" />
            Cheap
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" />
            Mid
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/50 inline-block" />
            Pricier
          </span>
        </div>
      )}
    </div>
  );
};

export default FlightPriceCalendar;
