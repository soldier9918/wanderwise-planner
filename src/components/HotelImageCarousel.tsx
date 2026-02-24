import { useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HotelImageCarouselProps {
  hotelName: string;
  cityName?: string;
  className?: string;
}

const queries = ["hotel exterior", "hotel room", "hotel lobby", "hotel pool", "hotel restaurant"];

const HotelImageCarousel = ({ hotelName, cityName, className = "" }: HotelImageCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set());

  const scrollPrev = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const city = encodeURIComponent(cityName || hotelName);

  return (
    <div className={`relative group/carousel ${className}`}>
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {queries.map((q, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0 h-full">
              <img
                src={`https://source.unsplash.com/featured/600x400/?${city},${encodeURIComponent(q)}&sig=${i}`}
                alt={`${hotelName} - ${q}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  if (!failedIndexes.has(i)) {
                    setFailedIndexes(prev => new Set(prev).add(i));
                    (e.target as HTMLImageElement).src = `https://source.unsplash.com/featured/600x400/?hotel&sig=${i + 10}`;
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity hover:bg-card shadow-md z-10"
      >
        <ChevronLeft className="w-4 h-4 text-foreground" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity hover:bg-card shadow-md z-10"
      >
        <ChevronRight className="w-4 h-4 text-foreground" />
      </button>
    </div>
  );
};

export default HotelImageCarousel;
