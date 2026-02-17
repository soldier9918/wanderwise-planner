import { GoogleMap, useJsApiLoader, MarkerF, PolylineF } from "@react-google-maps/api";

interface HotelMapProps {
  lat: number;
  lng: number;
  name: string;
  destination?: { lat: number; lng: number; name: string } | null;
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

const HotelMap = ({ lat, lng, name, destination }: HotelMapProps) => {
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

  // If destination is set, fit both points
  const center = destination
    ? {
        lat: (lat + destination.lat) / 2,
        lng: (lng + destination.lng) / 2,
      }
    : { lat, lng };

  const zoom = destination ? 10 : 14;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={center}
      zoom={zoom}
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
      {destination && (
        <>
          <MarkerF
            position={{ lat: destination.lat, lng: destination.lng }}
            title={destination.name}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
          <PolylineF
            path={[
              { lat, lng },
              { lat: destination.lat, lng: destination.lng },
            ]}
            options={{
              strokeColor: "#2563eb",
              strokeOpacity: 0.8,
              strokeWeight: 3,
              geodesic: true,
            }}
          />
        </>
      )}
    </GoogleMap>
  );
};

export default HotelMap;
