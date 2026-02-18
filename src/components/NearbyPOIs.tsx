import { useState, useMemo } from "react";
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

// Haversine formula – returns distance in km between two lat/lng points
const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const RADIUS_KM = 8.047; // 5 miles in km

interface RawPOI { label: string; name: string; lat: number; lng: number }

const rawTouristHotspots: RawPOI[] = [
  { label: "Timanfaya National Park", name: "Timanfaya National Park", lat: 29.0167, lng: -13.7500 },
  { label: "Cueva de los Verdes", name: "Cueva de los Verdes", lat: 29.1583, lng: -13.4333 },
  { label: "Playa de Papagayo", name: "Playa de Papagayo", lat: 28.8472, lng: -13.7833 },
  { label: "César Manrique Foundation", name: "César Manrique Foundation", lat: 29.0408, lng: -13.5903 },
  { label: "Mirador del Río", name: "Mirador del Río", lat: 29.2136, lng: -13.4811 },
];

const rawPublicTransport: RawPOI[] = [
  { label: "Train / Metro Station", name: "Arrecife Intercambiador", lat: 28.9630, lng: -13.5500 },
  { label: "Bus Stop", name: "Nearest Bus Stop", lat: 28.9595, lng: -13.6020 },
  { label: "Taxi Stand", name: "Taxi Rank", lat: 28.9560, lng: -13.6060 },
];

const rawRestaurants: RawPOI[] = [
  { label: "La Tegala", name: "La Tegala", lat: 28.9570, lng: -13.6080 },
  { label: "El Golfo Restaurant", name: "El Golfo Restaurant", lat: 28.9555, lng: -13.6095 },
  { label: "Casa Roja", name: "Casa Roja", lat: 28.9610, lng: -13.6010 },
  { label: "Pizzeria Capri", name: "Pizzeria Capri", lat: 28.9625, lng: -13.5980 },
  { label: "Lani's Beach Bar", name: "Lani's Beach Bar", lat: 28.9540, lng: -13.6120 },
];

const rawShoppingMalls: RawPOI[] = [
  { label: "Biosfera Shopping Centre", name: "Biosfera Shopping Centre", lat: 28.9620, lng: -13.5950 },
  { label: "Deiland Plaza", name: "Deiland Plaza", lat: 28.9580, lng: -13.5870 },
  { label: "Marina Rubicón Market", name: "Marina Rubicón Market", lat: 28.8600, lng: -13.8100 },
  { label: "Arrecife Gran Hotel Mall", name: "Arrecife Gran Hotel Mall", lat: 28.9640, lng: -13.5500 },
  { label: "Teguise Market", name: "Teguise Market", lat: 29.0600, lng: -13.5600 },
];

const rawSpainAirports: RawPOI[] = [
  { label: "ACE – Lanzarote", name: "César Manrique–Lanzarote Airport (ACE)", lat: 28.9453, lng: -13.6052 },
  { label: "FUE – Fuerteventura", name: "Fuerteventura Airport (FUE)", lat: 28.4527, lng: -13.8638 },
  { label: "LPA – Gran Canaria", name: "Gran Canaria Airport (LPA)", lat: 27.9319, lng: -15.3866 },
  { label: "SPC – La Palma", name: "La Palma Airport (SPC)", lat: 28.6265, lng: -17.7556 },
  { label: "TFN – Tenerife North", name: "Tenerife North Airport (TFN)", lat: 28.4827, lng: -16.3415 },
  { label: "TFS – Tenerife South", name: "Tenerife South Airport (TFS)", lat: 28.0445, lng: -16.5725 },
  { label: "GMZ – La Gomera", name: "La Gomera Airport (GMZ)", lat: 28.0296, lng: -17.2146 },
  { label: "VDE – El Hierro", name: "El Hierro Airport (VDE)", lat: 27.8148, lng: -17.8871 },
  { label: "MAD – Madrid Barajas", name: "Madrid Barajas Airport (MAD)", lat: 40.4983, lng: -3.5676 },
  { label: "BCN – Barcelona", name: "Barcelona El Prat Airport (BCN)", lat: 41.2971, lng: 2.0785 },
  { label: "AGP – Málaga", name: "Málaga Airport (AGP)", lat: 36.6749, lng: -4.4991 },
  { label: "ALC – Alicante", name: "Alicante Airport (ALC)", lat: 38.2822, lng: -0.5582 },
  { label: "PMI – Palma de Mallorca", name: "Palma de Mallorca Airport (PMI)", lat: 39.5517, lng: 2.7388 },
  { label: "SVQ – Seville", name: "Seville Airport (SVQ)", lat: 37.4180, lng: -5.8931 },
  { label: "VLC – Valencia", name: "Valencia Airport (VLC)", lat: 39.4893, lng: -0.4816 },
  { label: "BIO – Bilbao", name: "Bilbao Airport (BIO)", lat: 43.3011, lng: -2.9106 },
  { label: "IBZ – Ibiza", name: "Ibiza Airport (IBZ)", lat: 38.8729, lng: 1.3731 },
];

// Real Lanzarote coastal beaches
const rawBeaches: RawPOI[] = [
  { label: "Playa de los Pocillos", name: "Playa de los Pocillos", lat: 28.9225, lng: -13.6535 },
  { label: "Playa Grande", name: "Playa Grande (Puerto del Carmen)", lat: 28.9183, lng: -13.6622 },
  { label: "Playa de Matagorda", name: "Playa de Matagorda", lat: 28.9345, lng: -13.6327 },
  { label: "Playa de Famara", name: "Playa de Famara", lat: 29.1115, lng: -13.5636 },
  { label: "Playa Blanca", name: "Playa Blanca", lat: 28.8628, lng: -13.8284 },
  { label: "Playa de la Garita", name: "Playa de la Garita", lat: 28.9640, lng: -13.4980 },
  { label: "Playa del Reducto", name: "Playa del Reducto (Arrecife)", lat: 28.9564, lng: -13.5581 },
  { label: "Playa de Papagayo", name: "Playa de Papagayo", lat: 28.8436, lng: -13.7806 },
  { label: "Playa de Caletón Blanco", name: "Playa de Caletón Blanco", lat: 29.1858, lng: -13.4375 },
];

// SPA / Fitness locations across Lanzarote
const rawSpaFitnessList: RawPOI[] = [
  { label: "FitLife Gym", name: "FitLife Gym", lat: 28.9580, lng: -13.6050 },
  { label: "Hesperia Lanzarote Spa", name: "Hesperia Lanzarote Spa", lat: 28.9210, lng: -13.6550 },
  { label: "Sandos Papagayo Spa", name: "Sandos Papagayo Spa", lat: 28.8630, lng: -13.8270 },
  { label: "Active Gym Arrecife", name: "Active Gym Arrecife", lat: 28.9620, lng: -13.5480 },
];

const rawHospital: RawPOI = { label: "Nearest Hospital", name: "Hospital José Molina Orosa", lat: 28.9580, lng: -13.5520 };

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

const withDistance = (hotelLat: number, hotelLng: number, pois: RawPOI[]): POILocation[] =>
  pois
    .map((p) => ({
      ...p,
      distance: Math.round(haversineKm(hotelLat, hotelLng, p.lat, p.lng) * 10) / 10,
    }))
    .sort((a, b) => a.distance - b.distance);

const singleWithDistance = (hotelLat: number, hotelLng: number, poi: RawPOI): POILocation => ({
  ...poi,
  distance: Math.round(haversineKm(hotelLat, hotelLng, poi.lat, poi.lng) * 10) / 10,
});

type DropdownKey = "airport" | "transport" | "hotspot" | "restaurant" | "shopping";

const NearbyPOIs = ({ hotelLat, hotelLng, distanceUnit, dist, onSelectPOI, activePOI }: NearbyPOIsProps) => {
  // Cap airports at 5 nearest
  const airports = useMemo(
    () => withDistance(hotelLat, hotelLng, rawSpainAirports).slice(0, 5),
    [hotelLat, hotelLng]
  );

  // Public transport — filtered to 5-mile (8.047 km) radius
  const transport = useMemo(
    () => withDistance(hotelLat, hotelLng, rawPublicTransport).filter((p) => p.distance <= RADIUS_KM),
    [hotelLat, hotelLng]
  );

  const hotspots = useMemo(() => withDistance(hotelLat, hotelLng, rawTouristHotspots), [hotelLat, hotelLng]);

  // Restaurants — filtered to 5-mile radius
  const restaurantList = useMemo(
    () => withDistance(hotelLat, hotelLng, rawRestaurants).filter((p) => p.distance <= RADIUS_KM),
    [hotelLat, hotelLng]
  );

  const shopping = useMemo(() => withDistance(hotelLat, hotelLng, rawShoppingMalls), [hotelLat, hotelLng]);

  // Nearest beach from the full list
  const beach = useMemo(
    () => withDistance(hotelLat, hotelLng, rawBeaches)[0],
    [hotelLat, hotelLng]
  );

  // Hospital — single, dynamic distance
  const hospital = useMemo(() => singleWithDistance(hotelLat, hotelLng, rawHospital), [hotelLat, hotelLng]);

  // SPA/Fitness — nearest within 5-mile radius; fallback to nearest overall
  const spa = useMemo(() => {
    const all = withDistance(hotelLat, hotelLng, rawSpaFitnessList);
    const nearby = all.filter((p) => p.distance <= RADIUS_KM);
    return nearby.length > 0 ? nearby[0] : all[0];
  }, [hotelLat, hotelLng]);

  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<POILocation | null>(null);
  const [selectedTransport, setSelectedTransport] = useState<POILocation | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<POILocation | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<POILocation | null>(null);
  const [selectedShopping, setSelectedShopping] = useState<POILocation | null>(null);

  const activeAirport = selectedAirport ?? airports[0];
  const activeTransport = selectedTransport ?? transport[0];
  const activeHotspot = selectedHotspot ?? hotspots[0];
  const activeRestaurant = selectedRestaurant ?? restaurantList[0];
  const activeShopping = selectedShopping ?? shopping[0];

  const isActive = (poi: POILocation) =>
    activePOI?.name === poi.name && activePOI?.lat === poi.lat;

  const handleClick = (poi: POILocation) => {
    onSelectPOI(isActive(poi) ? null : poi);
  };

  const toggleDropdown = (key: DropdownKey) => {
    setOpenDropdown(prev => prev === key ? null : key);
  };

  const TransportIcon = transport.length > 0 ? getTransportIcon(activeTransport?.label ?? "") : Car;

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

  // Greyed-out tile for when no POIs are within radius
  const renderDisabled = (label: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-3 p-3 rounded-xl opacity-50 cursor-not-allowed bg-secondary">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">None nearby</p>
        <p className="text-xs text-muted-foreground">No results within 5 miles</p>
      </div>
    </div>
  );

  // Dropdown that falls back to greyed-out if list is empty
  const renderDropdownOrDisabled = (
    key: DropdownKey,
    icon: React.ReactNode,
    label: string,
    selected: POILocation | undefined,
    items: POILocation[],
    onSelect: (poi: POILocation) => void,
  ) => {
    if (items.length === 0 || !selected) return renderDisabled(label, icon);
    return renderDropdown(key, icon, label, selected, items, onSelect);
  };

  const renderFixed = (poi: POILocation, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => handleClick(poi)}
      className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
        isActive(poi)
          ? "bg-primary/10 border border-primary/30 ring-1 ring-primary/20"
          : "bg-secondary hover:bg-secondary/80"
      }`}
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{poi.name}</p>
        <p className="text-xs text-primary font-semibold">{dist(poi.distance)} · {estimateTime(poi.distance)}</p>
      </div>
    </button>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {renderDropdown("airport", <Plane className="w-4 h-4 text-primary" />, "Nearest Airport", activeAirport, airports, setSelectedAirport)}
      {renderDropdownOrDisabled("transport", <TransportIcon className="w-4 h-4 text-primary" />, "Public Transports", activeTransport, transport, setSelectedTransport)}
      {renderDropdownOrDisabled("restaurant", <Utensils className="w-4 h-4 text-primary" />, "Restaurants", activeRestaurant, restaurantList, setSelectedRestaurant)}
      {renderDropdown("shopping", <ShoppingBag className="w-4 h-4 text-primary" />, "Shopping", activeShopping, shopping, setSelectedShopping)}
      {renderDropdown("hotspot", <Palmtree className="w-4 h-4 text-primary" />, "Tourist Hotspots", activeHotspot, hotspots, setSelectedHotspot)}
      {renderFixed(hospital, "Nearest Hospital", <Cross className="w-4 h-4 text-primary" />)}
      {renderFixed(beach, "Nearest Beach", <Waves className="w-4 h-4 text-primary" />)}
      {renderFixed(spa, "SPA / Fitness", <Dumbbell className="w-4 h-4 text-primary" />)}
    </div>
  );
};

export default NearbyPOIs;
