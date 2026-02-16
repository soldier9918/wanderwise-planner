export interface Hotel {
  id: string;
  name: string;
  location: string;
  country: string;
  stars: number;
  rating: number;
  reviewCount: number;
  image: string;
  boardType: string;
  lat: number;
  lng: number;
  prices: { provider: string; price: number; url: string }[];
  amenities: string[];
  distanceToAirport: number;
  distanceToBeach: number;
  distanceToCenter: number;
}

export const mockHotels: Hotel[] = [
  {
    id: "1",
    name: "Hotel Lanzarote Village",
    location: "Puerto del Carmen, Lanzarote",
    country: "Spain",
    stars: 4,
    rating: 8.4,
    reviewCount: 2341,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
    boardType: "All Inclusive",
    lat: 28.9225,
    lng: -13.6653,
    prices: [
      { provider: "LoveHolidays", price: 489, url: "#" },
      { provider: "Lastminute.com", price: 512, url: "#" },
      { provider: "Booking.com", price: 498, url: "#" },
      { provider: "Skyscanner", price: 475, url: "#" },
      { provider: "TUI", price: 529, url: "#" },
    ],
    amenities: ["Pool", "Spa", "WiFi", "Restaurant", "Bar", "Gym"],
    distanceToAirport: 8.2,
    distanceToBeach: 0.3,
    distanceToCenter: 1.1,
  },
  {
    id: "2",
    name: "Seaside Los Jameos Playa",
    location: "Puerto del Carmen, Lanzarote",
    country: "Spain",
    stars: 4,
    rating: 8.9,
    reviewCount: 1876,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
    boardType: "Half Board",
    lat: 28.9189,
    lng: -13.6401,
    prices: [
      { provider: "LoveHolidays", price: 612, url: "#" },
      { provider: "Lastminute.com", price: 589, url: "#" },
      { provider: "Booking.com", price: 625, url: "#" },
      { provider: "Skyscanner", price: 598, url: "#" },
    ],
    amenities: ["Pool", "Spa", "WiFi", "Restaurant", "Beach Access"],
    distanceToAirport: 6.5,
    distanceToBeach: 0.1,
    distanceToCenter: 0.8,
  },
  {
    id: "3",
    name: "Arrecife Gran Hotel & Spa",
    location: "Arrecife, Lanzarote",
    country: "Spain",
    stars: 5,
    rating: 9.1,
    reviewCount: 943,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop",
    boardType: "Bed & Breakfast",
    lat: 28.9630,
    lng: -13.5477,
    prices: [
      { provider: "LoveHolidays", price: 745, url: "#" },
      { provider: "Booking.com", price: 698, url: "#" },
      { provider: "Skyscanner", price: 721, url: "#" },
      { provider: "TUI", price: 769, url: "#" },
    ],
    amenities: ["Pool", "Spa", "WiFi", "Restaurant", "Gym", "Rooftop Bar"],
    distanceToAirport: 4.3,
    distanceToBeach: 0.5,
    distanceToCenter: 0.2,
  },
  {
    id: "4",
    name: "Iberostar Selection Lanzarote Park",
    location: "Playa Blanca, Lanzarote",
    country: "Spain",
    stars: 5,
    rating: 9.3,
    reviewCount: 1254,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop",
    boardType: "All Inclusive",
    lat: 28.8602,
    lng: -13.8312,
    prices: [
      { provider: "LoveHolidays", price: 892, url: "#" },
      { provider: "Lastminute.com", price: 879, url: "#" },
      { provider: "Booking.com", price: 915, url: "#" },
      { provider: "Skyscanner", price: 865, url: "#" },
      { provider: "TUI", price: 925, url: "#" },
      { provider: "Jet2", price: 849, url: "#" },
    ],
    amenities: ["Pool", "Spa", "WiFi", "Restaurant", "Kids Club", "Gym", "Tennis"],
    distanceToAirport: 22.1,
    distanceToBeach: 0.2,
    distanceToCenter: 1.5,
  },
];
