import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HotelImageCarouselProps {
  hotelName: string;
  cityName?: string;
  className?: string;
}

// Curated Unsplash photo IDs for hotel imagery
const HOTEL_PHOTOS = [
  "1566073771259-6a8506099945", // hotel exterior
  "1631049307264-da0ec9d70304", // hotel room
  "1551882547-ff40c63fe5fa", // hotel lobby
  "1582719508461-905c673771f1", // hotel pool
  "1414235077428-338989a2e8c0", // hotel restaurant
];

const HotelImageCarousel = ({ hotelName, cityName, className = "" }: HotelImageCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrevCb = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNextCb = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    emblaApi?.scrollNext();
  }, [emblaApi]);

  return (
    <div className={`relative group/carousel ${className}`}>
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {HOTEL_PHOTOS.map((photoId, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0 h-full">
              <img
                src={`https://images.unsplash.com/photo-${photoId}?w=800&h=500&fit=crop&auto=format`}
                alt={`${hotelName} - view ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={scrollPrevCb}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity hover:bg-card shadow-md z-10"
      >
        <ChevronLeft className="w-4 h-4 text-foreground" />
      </button>
      <button
        onClick={scrollNextCb}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity hover:bg-card shadow-md z-10"
      >
        <ChevronRight className="w-4 h-4 text-foreground" />
      </button>
    </div>
  );
};

export default HotelImageCarousel;
