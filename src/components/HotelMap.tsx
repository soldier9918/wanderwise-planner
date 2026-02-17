import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";

interface HotelMapProps {
  lat: number;
  lng: number;
  name: string;
}

const GOOGLE_MAPS_API_KEY = "AIzaSyBVtwVPrEBuROA_uKOlHYr9qLmBlvbFb4s";

const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9e7f2" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e0e0e0" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#d4edda" }] },
];

const HotelMap = ({ lat, lng, name }: HotelMapProps) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    id: "google-map-script",
  });

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-secondary rounded-xl">
        <p className="text-muted-foreground text-sm">Loading map...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={{ lat, lng }}
      zoom={14}
      options={{
        styles: mapStyles,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      }}
    >
      <MarkerF position={{ lat, lng }} title={name} />
    </GoogleMap>
  );
};

export default HotelMap;
