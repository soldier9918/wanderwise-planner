import { useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader, OverlayViewF, OverlayView } from "@react-google-maps/api";
import { Hotel } from "@/data/mockHotels";
import { useCurrency } from "@/contexts/CurrencyContext";

interface SearchResultsMapProps {
  hotels: Hotel[];
}

const GOOGLE_MAPS_API_KEY = "AIzaSyBVtwVPrEBuROA_uKOlHYr9qLmBlvbFb4s";

const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9e7f2" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e0e0e0" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#d4edda" }] },
];

const containerStyle = { width: "100%", height: "100%" };

const SearchResultsMap = ({ hotels }: SearchResultsMapProps) => {
  const { formatPrice } = useCurrency();
  const [activeHotel, setActiveHotel] = useState<string | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    id: "google-map-script",
  });

  const getCenter = useCallback(() => {
    if (hotels.length === 0) return { lat: 28.96, lng: -13.6 };
    return {
      lat: hotels.reduce((s, h) => s + h.lat, 0) / hotels.length,
      lng: hotels.reduce((s, h) => s + h.lng, 0) / hotels.length,
    };
  }, [hotels]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full min-h-[500px] rounded-2xl bg-secondary flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-border shadow-card">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={getCenter()}
        zoom={11}
        options={{
          styles: mapStyles,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        {hotels.map((hotel) => {
          const bestPrice = Math.min(...hotel.prices.map((p) => p.price));
          const isActive = activeHotel === hotel.id;

          return (
            <OverlayViewF
              key={hotel.id}
              position={{ lat: hotel.lat, lng: hotel.lng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div
                onClick={() => setActiveHotel(isActive ? null : hotel.id)}
                className="cursor-pointer relative"
                style={{ transform: "translate(-50%, -100%)" }}
              >
                <div
                  className={`px-2.5 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all shadow-lg ${
                    isActive
                      ? "bg-primary text-primary-foreground scale-110"
                      : "bg-card text-foreground border-2 border-primary/60 hover:border-primary hover:scale-105"
                  }`}
                >
                  {formatPrice(bestPrice)}
                </div>
                <div
                  className={`w-2 h-2 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 ${
                    isActive ? "bg-primary" : "bg-card border-r-2 border-b-2 border-primary/60"
                  }`}
                />
                {isActive && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-card rounded-xl shadow-elevated border border-border p-3 z-50">
                    <p className="font-display text-sm font-bold text-foreground truncate">{hotel.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{hotel.location}</p>
                    <p className="text-primary font-bold text-sm mt-1">{formatPrice(bestPrice)} <span className="text-xs font-normal text-muted-foreground">per person</span></p>
                  </div>
                )}
              </div>
            </OverlayViewF>
          );
        })}
      </GoogleMap>
    </div>
  );
};

export default SearchResultsMap;
