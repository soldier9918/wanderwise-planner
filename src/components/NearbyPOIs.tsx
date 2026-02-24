import { useState, useMemo, useEffect } from "react";
import { Plane, Train, Bus, Car, Utensils, ShoppingBag, Palmtree, Dumbbell, ChevronDown, Cross, Waves } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

// Fetch real POIs from Overpass API (OpenStreetMap)
const fetchOverpassPOIs = async (
  lat: number,
  lng: number,
  radiusM: number,
  query: string,
  tag: string
): Promise<RawPOI[]> => {
  try {
    const overpassQuery = `[out:json][timeout:10];(${query});out body ${50};`;
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.elements || [])
      .filter((el: any) => el.lat && el.lon && el.tags?.name)
      .map((el: any) => ({
        label: tag,
        name: el.tags.name,
        lat: el.lat,
        lng: el.lon,
      }));
  } catch {
    return [];
  }
};

type DropdownKey = "airport" | "transport" | "hotspot" | "restaurant" | "shopping";

const NearbyPOIs = ({ hotelLat, hotelLng, distanceUnit, dist, onSelectPOI, activePOI }: NearbyPOIsProps) => {
  const [loading, setLoading] = useState(true);
  const [rawAirports, setRawAirports] = useState<RawPOI[]>([]);
  const [rawTransport, setRawTransport] = useState<RawPOI[]>([]);
  const [rawRestaurants, setRawRestaurants] = useState<RawPOI[]>([]);
  const [rawShopping, setRawShopping] = useState<RawPOI[]>([]);
  const [rawHotspots, setRawHotspots] = useState<RawPOI[]>([]);
  const [rawBeaches, setRawBeaches] = useState<RawPOI[]>([]);
  const [rawHospitals, setRawHospitals] = useState<RawPOI[]>([]);
  const [rawSpa, setRawSpa] = useState<RawPOI[]>([]);

  useEffect(() => {
    const rad = Math.round(RADIUS_KM * 1000); // 5 miles in meters
    const bigRad = 50000; // 50km for airports
    const around = `(around:${rad},${hotelLat},${hotelLng})`;
    const airportAround = `(around:${bigRad},${hotelLat},${hotelLng})`;

    const fetches = Promise.all([
      fetchOverpassPOIs(hotelLat, hotelLng, bigRad,
        `node["aeroway"="aerodrome"]["iata"]${airportAround};`, "Airport"),
      fetchOverpassPOIs(hotelLat, hotelLng, rad,
        `node["highway"="bus_stop"]${around};node["railway"="station"]${around};node["amenity"="taxi"]${around};`, "Bus Stop"),
      fetchOverpassPOIs(hotelLat, hotelLng, rad,
        `node["amenity"="restaurant"]${around};`, "Restaurant"),
      fetchOverpassPOIs(hotelLat, hotelLng, rad,
        `node["shop"="mall"]${around};node["shop"="supermarket"]${around};node["shop"="department_store"]${around};`, "Shopping"),
      fetchOverpassPOIs(hotelLat, hotelLng, rad,
        `node["tourism"="attraction"]${around};node["tourism"="viewpoint"]${around};node["tourism"="museum"]${around};`, "Attraction"),
      fetchOverpassPOIs(hotelLat, hotelLng, rad,
        `node["natural"="beach"]${around};way["natural"="beach"]${around};`, "Beach"),
      fetchOverpassPOIs(hotelLat, hotelLng, rad,
        `node["amenity"="hospital"]${around};`, "Hospital"),
      fetchOverpassPOIs(hotelLat, hotelLng, rad,
        `node["leisure"="fitness_centre"]${around};node["leisure"="spa"]${around};node["amenity"="spa"]${around};`, "SPA/Fitness"),
    ]);

    setLoading(true);
    fetches.then(([airports, transport, restaurants, shopping, hotspots, beaches, hospitals, spa]) => {
      setRawAirports(airports);
      setRawTransport(transport.map(t => ({ ...t, label: t.name?.toLowerCase().includes("train") ? "Train Station" : t.name?.toLowerCase().includes("taxi") ? "Taxi Stand" : "Bus Stop" })));
      setRawRestaurants(restaurants);
      setRawShopping(shopping);
      setRawHotspots(hotspots);
      setRawBeaches(beaches);
      setRawHospitals(hospitals);
      setRawSpa(spa);
    }).finally(() => setLoading(false));
  }, [hotelLat, hotelLng]);

  // Computed lists
  const airports = useMemo(() => withDistance(hotelLat, hotelLng, rawAirports).slice(0, 2), [hotelLat, hotelLng, rawAirports]);
  const transport = useMemo(() => withDistance(hotelLat, hotelLng, rawTransport).filter(p => p.distance <= RADIUS_KM), [hotelLat, hotelLng, rawTransport]);
  const hotspots = useMemo(() => withDistance(hotelLat, hotelLng, rawHotspots).slice(0, 5), [hotelLat, hotelLng, rawHotspots]);
  const restaurantList = useMemo(() => withDistance(hotelLat, hotelLng, rawRestaurants).filter(p => p.distance <= RADIUS_KM).slice(0, 2), [hotelLat, hotelLng, rawRestaurants]);
  const shopping = useMemo(() => withDistance(hotelLat, hotelLng, rawShopping).filter(p => p.distance <= RADIUS_KM), [hotelLat, hotelLng, rawShopping]);
  const beach = useMemo(() => {
    const all = withDistance(hotelLat, hotelLng, rawBeaches).filter(p => p.distance <= RADIUS_KM);
    return all.length > 0 ? all[0] : null;
  }, [hotelLat, hotelLng, rawBeaches]);
  const hospital = useMemo(() => {
    const all = withDistance(hotelLat, hotelLng, rawHospitals).filter(p => p.distance <= RADIUS_KM);
    return all.length > 0 ? all[0] : null;
  }, [hotelLat, hotelLng, rawHospitals]);
  const spa = useMemo(() => {
    const all = withDistance(hotelLat, hotelLng, rawSpa).filter(p => p.distance <= RADIUS_KM);
    return all.length > 0 ? all[0] : null;
  }, [hotelLat, hotelLng, rawSpa]);

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
              key={`${item.name}-${item.lat}`}
              onClick={() => { onSelect(item); setOpenDropdown(null); onSelectPOI(item); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors flex justify-between items-center ${
                selected.name === item.name ? "bg-primary/5 text-primary font-semibold" : "text-foreground"
              }`}
            >
              <span className="truncate">{item.name}</span>
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

  const renderSkeleton = () => (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
      <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>{renderSkeleton()}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {airports.length > 0
        ? renderDropdown("airport", <Plane className="w-4 h-4 text-primary" />, "Nearest Airport", activeAirport, airports, setSelectedAirport)
        : renderDisabled("Nearest Airport", <Plane className="w-4 h-4 text-primary" />)}
      {renderDropdownOrDisabled("transport", <TransportIcon className="w-4 h-4 text-primary" />, "Public Transports", activeTransport, transport, setSelectedTransport)}
      {renderDropdownOrDisabled("restaurant", <Utensils className="w-4 h-4 text-primary" />, "Restaurants", activeRestaurant, restaurantList, setSelectedRestaurant)}
      {renderDropdownOrDisabled("shopping", <ShoppingBag className="w-4 h-4 text-primary" />, "Shopping", activeShopping, shopping, setSelectedShopping)}
      {hotspots.length > 0
        ? renderDropdown("hotspot", <Palmtree className="w-4 h-4 text-primary" />, "Tourist Hotspots", activeHotspot, hotspots, setSelectedHotspot)
        : renderDisabled("Tourist Hotspots", <Palmtree className="w-4 h-4 text-primary" />)}
      {hospital
        ? renderFixed(hospital, "Nearest Hospital", <Cross className="w-4 h-4 text-primary" />)
        : renderDisabled("Nearest Hospital", <Cross className="w-4 h-4 text-primary" />)}
      {beach
        ? renderFixed(beach, "Nearest Beach", <Waves className="w-4 h-4 text-primary" />)
        : renderDisabled("Nearest Beach", <Waves className="w-4 h-4 text-primary" />)}
      {spa
        ? renderFixed(spa, "SPA / Fitness", <Dumbbell className="w-4 h-4 text-primary" />)
        : renderDisabled("SPA / Fitness", <Dumbbell className="w-4 h-4 text-primary" />)}
    </div>
  );
};

export default NearbyPOIs;
