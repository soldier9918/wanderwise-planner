import { useState } from "react";
import { Plane, Train, Utensils, ShoppingBag, Palmtree, Dumbbell, ChevronDown } from "lucide-react";

export interface POILocation {
  label: string;
  name: string;
  distance: number;
  lat: number;
  lng: number;
}

interface NearbyPOIsProps {
  hotelLat: number;
  hotelLng: number;
  distanceUnit: "km" | "mi";
  dist: (km: number) => string;
  onSelectPOI: (poi: POILocation | null) => void;
  activePOI: POILocation | null;
}

const touristHotspots: POILocation[] = [
  { label: "Timanfaya National Park", name: "Timanfaya National Park", distance: 1.2, lat: 29.0167, lng: -13.7500 },
  { label: "Cueva de los Verdes", name: "Cueva de los Verdes", distance: 18.5, lat: 29.1583, lng: -13.4333 },
  { label: "Jameos del Agua", name: "Jameos del Agua", distance: 19.2, lat: 29.1575, lng: -13.4308 },
  { label: "Playa de Papagayo", name: "Playa de Papagayo", distance: 12.4, lat: 28.8472, lng: -13.7833 },
  { label: "Mirador del Río", name: "Mirador del Río", distance: 25.0, lat: 29.2136, lng: -13.4811 },
  { label: "César Manrique Foundation", name: "César Manrique Foundation", distance: 8.3, lat: 29.0408, lng: -13.5903 },
];

const spaFitness: POILocation[] = [
  { label: "Lanzarote Wellness Spa", name: "Lanzarote Wellness Spa", distance: 1.8, lat: 28.9650, lng: -13.6200 },
  { label: "FitLife Gym", name: "FitLife Gym", distance: 0.9, lat: 28.9580, lng: -13.6050 },
];

const fixedPOIs: { icon: typeof Plane; label: string; poi: POILocation }[] = [
  { icon: Plane, label: "Nearest Airport", poi: { label: "Nearest Airport", name: "ACE Airport", distance: 18.7, lat: 28.9453, lng: -13.6052 } },
  { icon: Train, label: "Public Transport", poi: { label: "Public Transport", name: "Bus Stop L1", distance: 0.6, lat: 28.9595, lng: -13.6020 } },
  { icon: Utensils, label: "Restaurants", poi: { label: "Restaurants", name: "La Tegala, El Golfo", distance: 0.3, lat: 28.9570, lng: -13.6080 } },
  { icon: ShoppingBag, label: "Shopping", poi: { label: "Shopping", name: "Biosfera Shopping Centre", distance: 0.8, lat: 28.9620, lng: -13.5950 } },
];

const NearbyPOIs = ({ hotelLat, hotelLng, distanceUnit, dist, onSelectPOI, activePOI }: NearbyPOIsProps) => {
  const [hotspotOpen, setHotspotOpen] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<POILocation>(touristHotspots[0]);
  const [spaOpen, setSpaOpen] = useState(false);
  const [selectedSpa, setSelectedSpa] = useState<POILocation>(spaFitness[0]);

  const isActive = (poi: POILocation) =>
    activePOI?.name === poi.name && activePOI?.lat === poi.lat;

  const handleClick = (poi: POILocation) => {
    onSelectPOI(isActive(poi) ? null : poi);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {fixedPOIs.map(({ icon: Icon, label, poi }) => (
        <button
          key={label}
          onClick={() => handleClick(poi)}
          className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
            isActive(poi)
              ? "bg-primary/10 border border-primary/30 ring-1 ring-primary/20"
              : "bg-secondary hover:bg-secondary/80"
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground">{poi.name}</p>
            <p className="text-xs text-primary font-semibold">{dist(poi.distance)}</p>
          </div>
        </button>
      ))}

      {/* Tourist Hotspots Dropdown */}
      <div className="relative">
        <button
          onClick={() => handleClick(selectedHotspot)}
          className={`flex items-center gap-3 p-3 rounded-xl w-full text-left transition-all ${
            isActive(selectedHotspot)
              ? "bg-primary/10 border border-primary/30 ring-1 ring-primary/20"
              : "bg-secondary hover:bg-secondary/80"
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Palmtree className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Tourist Hotspot</p>
            <p className="text-sm font-medium text-foreground truncate">{selectedHotspot.name}</p>
            <p className="text-xs text-primary font-semibold">{dist(selectedHotspot.distance)}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setHotspotOpen(!hotspotOpen);
              setSpaOpen(false);
            }}
            className="p-1 rounded-md hover:bg-background/50 transition-colors"
          >
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${hotspotOpen ? "rotate-180" : ""}`} />
          </button>
        </button>
        {hotspotOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-elevated z-50 py-1 max-h-48 overflow-y-auto">
            {touristHotspots.map((hs) => (
              <button
                key={hs.name}
                onClick={() => {
                  setSelectedHotspot(hs);
                  setHotspotOpen(false);
                  onSelectPOI(hs);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors flex justify-between items-center ${
                  selectedHotspot.name === hs.name ? "bg-primary/5 text-primary font-semibold" : "text-foreground"
                }`}
              >
                <span className="truncate">{hs.name}</span>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">{dist(hs.distance)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SPA / Fitness Dropdown */}
      <div className="relative">
        <button
          onClick={() => handleClick(selectedSpa)}
          className={`flex items-center gap-3 p-3 rounded-xl w-full text-left transition-all ${
            isActive(selectedSpa)
              ? "bg-primary/10 border border-primary/30 ring-1 ring-primary/20"
              : "bg-secondary hover:bg-secondary/80"
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Dumbbell className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">SPA / Fitness</p>
            <p className="text-sm font-medium text-foreground truncate">{selectedSpa.name}</p>
            <p className="text-xs text-primary font-semibold">{dist(selectedSpa.distance)}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSpaOpen(!spaOpen);
              setHotspotOpen(false);
            }}
            className="p-1 rounded-md hover:bg-background/50 transition-colors"
          >
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${spaOpen ? "rotate-180" : ""}`} />
          </button>
        </button>
        {spaOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-elevated z-50 py-1 max-h-48 overflow-y-auto">
            {spaFitness.map((sp) => (
              <button
                key={sp.name}
                onClick={() => {
                  setSelectedSpa(sp);
                  setSpaOpen(false);
                  onSelectPOI(sp);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors flex justify-between items-center ${
                  selectedSpa.name === sp.name ? "bg-primary/5 text-primary font-semibold" : "text-foreground"
                }`}
              >
                <span className="truncate">{sp.name}</span>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">{dist(sp.distance)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyPOIs;
