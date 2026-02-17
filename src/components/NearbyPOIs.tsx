import { useState } from "react";
import { Plane, Train, Bus, Car, Utensils, ShoppingBag, Palmtree, Dumbbell, ChevronDown, Cross, Waves } from "lucide-react";

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
  { label: "Playa de Papagayo", name: "Playa de Papagayo", distance: 12.4, lat: 28.8472, lng: -13.7833 },
  { label: "César Manrique Foundation", name: "César Manrique Foundation", distance: 8.3, lat: 29.0408, lng: -13.5903 },
  { label: "Mirador del Río", name: "Mirador del Río", distance: 25.0, lat: 29.2136, lng: -13.4811 },
];

const publicTransport: POILocation[] = [
  { label: "Train / Metro Station", name: "Arrecife Metro Station", distance: 5.2, lat: 28.9630, lng: -13.5500 },
  { label: "Bus Stop", name: "Bus Stop L1", distance: 0.6, lat: 28.9595, lng: -13.6020 },
  { label: "Taxi Stand", name: "Taxi Rank Puerto del Carmen", distance: 0.4, lat: 28.9560, lng: -13.6060 },
];

const restaurants: POILocation[] = [
  { label: "La Tegala", name: "La Tegala", distance: 0.3, lat: 28.9570, lng: -13.6080 },
  { label: "El Golfo Restaurant", name: "El Golfo Restaurant", distance: 0.5, lat: 28.9555, lng: -13.6095 },
  { label: "Casa Roja", name: "Casa Roja", distance: 0.8, lat: 28.9610, lng: -13.6010 },
  { label: "Pizzeria Capri", name: "Pizzeria Capri", distance: 1.1, lat: 28.9625, lng: -13.5980 },
  { label: "Lani's Beach Bar", name: "Lani's Beach Bar", distance: 1.4, lat: 28.9540, lng: -13.6120 },
];

const shoppingMalls: POILocation[] = [
  { label: "Biosfera Shopping Centre", name: "Biosfera Shopping Centre", distance: 0.8, lat: 28.9620, lng: -13.5950 },
  { label: "Deiland Plaza", name: "Deiland Plaza", distance: 2.1, lat: 28.9580, lng: -13.5870 },
  { label: "Marina Rubicón Market", name: "Marina Rubicón Market", distance: 4.5, lat: 28.8600, lng: -13.8100 },
  { label: "Arrecife Gran Hotel Mall", name: "Arrecife Gran Hotel Mall", distance: 6.3, lat: 28.9640, lng: -13.5500 },
  { label: "Teguise Market", name: "Teguise Market", distance: 12.0, lat: 29.0600, lng: -13.5600 },
];

// All airports in Spain (sorted by distance from hotel - Lanzarote)
const spainAirports: POILocation[] = [
  { label: "ACE – Lanzarote", name: "César Manrique–Lanzarote Airport (ACE)", distance: 18.7, lat: 28.9453, lng: -13.6052 },
  { label: "FUE – Fuerteventura", name: "Fuerteventura Airport (FUE)", distance: 60.0, lat: 28.4527, lng: -13.8638 },
  { label: "SPC – La Palma", name: "La Palma Airport (SPC)", distance: 210.0, lat: 28.6265, lng: -17.7556 },
  { label: "TFN – Tenerife North", name: "Tenerife North Airport (TFN)", distance: 270.0, lat: 28.4827, lng: -16.3415 },
  { label: "TFS – Tenerife South", name: "Tenerife South Airport (TFS)", distance: 290.0, lat: 28.0445, lng: -16.5725 },
  { label: "LPA – Gran Canaria", name: "Gran Canaria Airport (LPA)", distance: 180.0, lat: 27.9319, lng: -15.3866 },
  { label: "GMZ – La Gomera", name: "La Gomera Airport (GMZ)", distance: 300.0, lat: 28.0296, lng: -17.2146 },
  { label: "VDE – El Hierro", name: "El Hierro Airport (VDE)", distance: 350.0, lat: 27.8148, lng: -17.8871 },
  { label: "MAD – Madrid Barajas", name: "Madrid Barajas Airport (MAD)", distance: 1950.0, lat: 40.4983, lng: -3.5676 },
  { label: "BCN – Barcelona", name: "Barcelona El Prat Airport (BCN)", distance: 2700.0, lat: 41.2971, lng: 2.0785 },
  { label: "AGP – Málaga", name: "Málaga Airport (AGP)", distance: 1800.0, lat: 36.6749, lng: -4.4991 },
  { label: "ALC – Alicante", name: "Alicante Airport (ALC)", distance: 2100.0, lat: 38.2822, lng: -0.5582 },
  { label: "PMI – Palma de Mallorca", name: "Palma de Mallorca Airport (PMI)", distance: 2500.0, lat: 39.5517, lng: 2.7388 },
  { label: "SVQ – Seville", name: "Seville Airport (SVQ)", distance: 1750.0, lat: 37.4180, lng: -5.8931 },
  { label: "VLC – Valencia", name: "Valencia Airport (VLC)", distance: 2200.0, lat: 39.4893, lng: -0.4816 },
  { label: "BIO – Bilbao", name: "Bilbao Airport (BIO)", distance: 2300.0, lat: 43.3011, lng: -2.9106 },
  { label: "IBZ – Ibiza", name: "Ibiza Airport (IBZ)", distance: 2400.0, lat: 38.8729, lng: 1.3731 },
];

const nearestHospital: POILocation = {
  label: "Nearest Hospital", name: "Hospital José Molina Orosa", distance: 12.5, lat: 28.9580, lng: -13.5520,
};

const nearestBeach: POILocation = {
  label: "Nearest Beach", name: "Playa de la Garita", distance: 0.7, lat: 28.9530, lng: -13.6100,
};

const spaFitness: POILocation = {
  label: "SPA / Fitness", name: "FitLife Gym", distance: 0.9, lat: 28.9580, lng: -13.6050,
};

const estimateTime = (km: number) => {
  if (km <= 1) return `${Math.max(1, Math.round(km * 12))} min walk`;
  if (km <= 3) return `${Math.max(1, Math.round(km * 3))} min drive`;
  if (km <= 50) return `${Math.max(1, Math.round(km * 1.5))} min drive`;
  return `${Math.round(km / 80 * 60)} min flight`;
};

const getTransportIcon = (label: string) => {
  if (label.includes("Train")) return Train;
  if (label.includes("Bus")) return Bus;
  return Car;
};

type DropdownKey = "airport" | "transport" | "hotspot" | "restaurant" | "shopping";

const NearbyPOIs = ({ hotelLat, hotelLng, distanceUnit, dist, onSelectPOI, activePOI }: NearbyPOIsProps) => {
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<POILocation>(spainAirports[0]);
  const [selectedTransport, setSelectedTransport] = useState<POILocation>(publicTransport[0]);
  const [selectedHotspot, setSelectedHotspot] = useState<POILocation>(touristHotspots[0]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<POILocation>(restaurants[0]);
  const [selectedShopping, setSelectedShopping] = useState<POILocation>(shoppingMalls[0]);

  const isActive = (poi: POILocation) =>
    activePOI?.name === poi.name && activePOI?.lat === poi.lat;

  const handleClick = (poi: POILocation) => {
    onSelectPOI(isActive(poi) ? null : poi);
  };

  const toggleDropdown = (key: DropdownKey) => {
    setOpenDropdown(prev => prev === key ? null : key);
  };

  const TransportIcon = getTransportIcon(selectedTransport.label);

  const renderDropdown = (
    key: DropdownKey,
    icon: React.ReactNode,
    label: string,
    selected: POILocation,
    items: POILocation[],
    onSelect: (poi: POILocation) => void,
  ) => (
    <div className="relative">
      <button
        onClick={() => handleClick(selected)}
        className={`flex items-center gap-3 p-3 rounded-xl w-full text-left transition-all ${
          isActive(selected)
            ? "bg-primary/10 border border-primary/30 ring-1 ring-primary/20"
            : "bg-secondary hover:bg-secondary/80"
        }`}
      >
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium text-foreground truncate">{selected.name}</p>
          <p className="text-xs text-primary font-semibold">{dist(selected.distance)} · {estimateTime(selected.distance)}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleDropdown(key); }}
          className="p-1 rounded-md hover:bg-background/50 transition-colors"
        >
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openDropdown === key ? "rotate-180" : ""}`} />
        </button>
      </button>
      {openDropdown === key && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-elevated z-50 py-1 max-h-56 overflow-y-auto">
          {items.map((item) => (
            <button
              key={item.name}
              onClick={() => { onSelect(item); setOpenDropdown(null); onSelectPOI(item); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors flex justify-between items-center ${
                selected.name === item.name ? "bg-primary/5 text-primary font-semibold" : "text-foreground"
              }`}
            >
              <span className="truncate">{item.label}</span>
              <span className="text-xs text-muted-foreground shrink-0 ml-2">{dist(item.distance)} · {estimateTime(item.distance)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Airport Dropdown */}
      {renderDropdown(
        "airport",
        <Plane className="w-4 h-4 text-primary" />,
        "Airports",
        selectedAirport,
        spainAirports,
        setSelectedAirport,
      )}

      {/* Public Transport Dropdown */}
      {renderDropdown(
        "transport",
        <TransportIcon className="w-4 h-4 text-primary" />,
        "Public Transport",
        selectedTransport,
        publicTransport,
        setSelectedTransport,
      )}

      {/* Restaurants Dropdown */}
      {renderDropdown(
        "restaurant",
        <Utensils className="w-4 h-4 text-primary" />,
        "Restaurants",
        selectedRestaurant,
        restaurants,
        setSelectedRestaurant,
      )}

      {/* Shopping Dropdown */}
      {renderDropdown(
        "shopping",
        <ShoppingBag className="w-4 h-4 text-primary" />,
        "Shopping",
        selectedShopping,
        shoppingMalls,
        setSelectedShopping,
      )}

      {/* Tourist Hotspots Dropdown */}
      {renderDropdown(
        "hotspot",
        <Palmtree className="w-4 h-4 text-primary" />,
        "Tourist Hotspot",
        selectedHotspot,
        touristHotspots,
        setSelectedHotspot,
      )}

      {/* Nearest Hospital - fixed */}
      <button
        onClick={() => handleClick(nearestHospital)}
        className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
          isActive(nearestHospital)
            ? "bg-primary/10 border border-primary/30 ring-1 ring-primary/20"
            : "bg-secondary hover:bg-secondary/80"
        }`}
      >
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Cross className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Nearest Hospital</p>
          <p className="text-sm font-medium text-foreground">{nearestHospital.name}</p>
          <p className="text-xs text-primary font-semibold">{dist(nearestHospital.distance)} · {estimateTime(nearestHospital.distance)}</p>
        </div>
      </button>

      {/* Nearest Beach - fixed */}
      <button
        onClick={() => handleClick(nearestBeach)}
        className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
          isActive(nearestBeach)
            ? "bg-primary/10 border border-primary/30 ring-1 ring-primary/20"
            : "bg-secondary hover:bg-secondary/80"
        }`}
      >
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Waves className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Nearest Beach</p>
          <p className="text-sm font-medium text-foreground">{nearestBeach.name}</p>
          <p className="text-xs text-primary font-semibold">{dist(nearestBeach.distance)} · {estimateTime(nearestBeach.distance)}</p>
        </div>
      </button>

      {/* SPA / Fitness - fixed, nearest 1 */}
      <button
        onClick={() => handleClick(spaFitness)}
        className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
          isActive(spaFitness)
            ? "bg-primary/10 border border-primary/30 ring-1 ring-primary/20"
            : "bg-secondary hover:bg-secondary/80"
        }`}
      >
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Dumbbell className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">SPA / Fitness</p>
          <p className="text-sm font-medium text-foreground">{spaFitness.name}</p>
          <p className="text-xs text-primary font-semibold">{dist(spaFitness.distance)} · {estimateTime(spaFitness.distance)}</p>
        </div>
      </button>
    </div>
  );
};

export default NearbyPOIs;
