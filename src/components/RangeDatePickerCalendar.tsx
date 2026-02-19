/**
 * RangeDatePickerCalendar
 * A dual-month range calendar matching Skyscanner's layout:
 * - Two months side-by-side (or stacked on mobile)
 * - Large fonts, generous spacing
 * - Click depart → click return, range highlighted in between
 * - "Apply" button at bottom
 */
import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isBefore,
  isAfter,
  isSameDay,
  startOfDay,
  getDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RangeDatePickerCalendarProps {
  departDate?: Date;
  returnDate?: Date;
  onDepartChange: (date: Date) => void;
  onReturnChange: (date: Date | undefined) => void;
  onApply: () => void;
  /** Label shown at bottom-left, e.g. "Search for return" */
  hint?: string;
}

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function mondayIndex(date: Date): number {
  const day = getDay(date);
  return day === 0 ? 6 : day - 1;
}

function buildCells(month: Date): (Date | null)[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const pad = mondayIndex(monthStart);
  const cells: (Date | null)[] = [...Array(pad).fill(null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

type SelectionStep = "depart" | "return";

export default function RangeDatePickerCalendar({
  departDate,
  returnDate,
  onDepartChange,
  onReturnChange,
  onApply,
  hint = "Search for return",
}: RangeDatePickerCalendarProps) {
  const today = startOfDay(new Date());
  const [leftMonth, setLeftMonth] = useState<Date>(
    startOfMonth(departDate || today)
  );
  const rightMonth = addMonths(leftMonth, 1);

  // Track whether next click sets depart or return
  const [step, setStep] = useState<SelectionStep>(
    departDate ? "return" : "depart"
  );

  // Hover for range preview
  const [hovered, setHovered] = useState<Date | null>(null);

  const handleDayClick = (date: Date) => {
    if (isBefore(date, today)) return;

    if (step === "depart") {
      onDepartChange(date);
      onReturnChange(undefined);
      setStep("return");
    } else {
      // If clicked before depart, reset depart
      if (departDate && isBefore(date, departDate)) {
        onDepartChange(date);
        onReturnChange(undefined);
        setStep("return");
      } else {
        onReturnChange(date);
        setStep("depart");
      }
    }
  };

  const isInRange = (date: Date): boolean => {
    const rangeEnd = returnDate || (step === "return" && hovered ? hovered : null);
    if (!departDate || !rangeEnd) return false;
    const [start, end] = isBefore(departDate, rangeEnd) ? [departDate, rangeEnd] : [rangeEnd, departDate];
    return isAfter(date, start) && isBefore(date, end);
  };

  const goLeft = () => {
    const prev = subMonths(leftMonth, 1);
    if (!isBefore(startOfMonth(prev), startOfMonth(today))) {
      setLeftMonth(prev);
    }
  };
  const goRight = () => setLeftMonth((m) => addMonths(m, 1));

  const canGoLeft = !isBefore(startOfMonth(subMonths(leftMonth, 1)), startOfMonth(today))
    && !isSameDay(startOfMonth(leftMonth), startOfMonth(today));

  function renderMonth(month: Date) {
    const cells = buildCells(month);
    return (
      <div className="flex-1 min-w-0">
        <h3 className="text-center text-lg font-bold text-foreground mb-4">
          {format(month, "MMMM yyyy")}
        </h3>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center text-sm font-semibold text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((date, i) => {
            if (!date) return <div key={`e-${i}`} className="h-11" />;

            const key = format(date, "yyyy-MM-dd");
            const isPast = isBefore(date, today);
            const isDepart = departDate ? isSameDay(date, departDate) : false;
            const isReturn = returnDate ? isSameDay(date, returnDate) : false;
            const isSelected = isDepart || isReturn;
            const inRange = isInRange(date);
            const isToday = isSameDay(date, today);

            return (
              <button
                key={key}
                type="button"
                disabled={isPast}
                onMouseEnter={() => setHovered(date)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleDayClick(date)}
                className={cn(
                  "h-11 w-full flex items-center justify-center text-base font-medium transition-all relative select-none",
                  isPast
                    ? "text-muted-foreground/40 cursor-not-allowed"
                    : "cursor-pointer",
                  isSelected
                    ? "bg-primary text-primary-foreground rounded-full z-10 font-bold"
                    : inRange
                      ? "bg-primary/15 text-foreground"
                      : isToday
                        ? "text-primary font-bold"
                        : !isPast
                          ? "hover:bg-secondary rounded-full text-foreground"
                          : ""
                )}
              >
                {format(date, "d")}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-2xl overflow-hidden" style={{ minWidth: 660 }}>
      {/* Navigation header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-2">
        <button
          type="button"
          onClick={goLeft}
          disabled={!canGoLeft}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
            canGoLeft ? "hover:bg-secondary text-foreground" : "text-muted-foreground/30 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={goRight}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary text-foreground transition-colors ml-auto"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Two months */}
      <div className="flex gap-6 px-6 pb-4">
        {renderMonth(leftMonth)}
        <div className="w-px bg-border shrink-0" />
        {renderMonth(rightMonth)}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-6 py-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{hint}</p>
        <button
          type="button"
          onClick={onApply}
          className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
