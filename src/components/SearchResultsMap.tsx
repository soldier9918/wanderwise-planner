import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Hotel } from "@/data/mockHotels";
import { useCurrency } from "@/contexts/CurrencyContext";

interface SearchResultsMapProps {
  hotels: Hotel[];
}

const SearchResultsMap = ({ hotels }: SearchResultsMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    if (hotels.length === 0) return;

    const center: [number, number] = [
      hotels.reduce((s, h) => s + h.lat, 0) / hotels.length,
      hotels.reduce((s, h) => s + h.lng, 0) / hotels.length,
    ];

    mapInstance.current = L.map(mapRef.current).setView(center, 11);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapInstance.current);

    hotels.forEach((hotel) => {
      const bestPrice = Math.min(...hotel.prices.map((p) => p.price));
      const priceLabel = formatPrice(bestPrice);

      const icon = L.divIcon({
        html: `<div style="
          background: hsl(0, 0%, 100%);
          color: hsl(216, 28%, 12%);
          font-weight: 700;
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          border: 2px solid hsl(12, 100%, 64%);
          white-space: nowrap;
          cursor: pointer;
        ">${priceLabel}</div>`,
        iconSize: [0, 0],
        iconAnchor: [30, 15],
        className: "",
      });

      L.marker([hotel.lat, hotel.lng], { icon })
        .addTo(mapInstance.current!)
        .bindPopup(`<strong>${hotel.name}</strong><br/>${hotel.location}<br/>${priceLabel} per person`);
    });

    const bounds = L.latLngBounds(hotels.map((h) => [h.lat, h.lng]));
    mapInstance.current.fitBounds(bounds, { padding: [30, 30] });

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [hotels, formatPrice]);

  return <div ref={mapRef} className="w-full h-full min-h-[500px] rounded-2xl" />;
};

export default SearchResultsMap;
