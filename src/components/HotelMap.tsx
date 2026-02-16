import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface HotelMapProps {
  lat: number;
  lng: number;
  name: string;
}

const HotelMap = ({ lat, lng, name }: HotelMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current).setView([lat, lng], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapInstance.current);

    const icon = L.divIcon({
      html: `<div style="background: hsl(12, 100%, 64%); width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      className: "",
    });

    L.marker([lat, lng], { icon }).addTo(mapInstance.current).bindPopup(name);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [lat, lng, name]);

  return <div ref={mapRef} className="w-full h-full" />;
};

export default HotelMap;
