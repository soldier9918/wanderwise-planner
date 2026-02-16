export interface Hotel {
  id: string;
  name: string;
  location: string;
  country: string;
  stars: number;
  rating: number;
  reviewCount: number;
  reviewScore: "Exceptional" | "Superb" | "Very Good" | "Good" | "Pleasant";
  image: string;
  boardType: string;
  accommodationType: string;
  flightType: "Direct" | "1 Stop" | "2+ Stops";
  airline: string;
  lat: number;
  lng: number;
  prices: { provider: string; price: number; url: string }[];
  amenities: string[];
  distanceToAirport: number;
  distanceToBeach: number;
  distanceToCenter: number;
}

export const providers = [
  "On the Beach",
  "LoveHolidays",
  "Lastminute.com",
  "Expedia",
  "Trip.com",
  "Jet2holidays",
  "TUI",
  "easyJet holidays",
  "Skyscanner",
  "Booking.com",
];

export const airlines = [
  "Ryanair", "easyJet", "British Airways", "Jet2", "TUI Airways",
  "Wizz Air", "Lufthansa", "KLM", "Air France", "Emirates",
  "Turkish Airlines", "Iberia", "Vueling", "Norwegian", "Aer Lingus",
  "Virgin Atlantic", "Delta", "United Airlines", "American Airlines",
  "Qatar Airways", "Etihad Airways", "Singapore Airlines", "Thai Airways",
  "Cathay Pacific", "Swiss Air", "TAP Portugal", "SAS", "Finnair",
  "LOT Polish", "Aegean Airlines",
];

export const accommodationTypes = [
  "Hotel", "Apartment", "Resort", "Holiday Rental",
  "Guest House", "Hostel", "Unique Stay", "Residence Hotel",
  "Private Home",
];

export const boardTypes = [
  "Meals not included", "Breakfast included", "Half Board",
  "Full Board", "All Inclusive", "Self Catering",
];

const getReviewScore = (rating: number): Hotel["reviewScore"] => {
  if (rating >= 9) return "Exceptional";
  if (rating >= 8.5) return "Superb";
  if (rating >= 8) return "Very Good";
  if (rating >= 7) return "Good";
  return "Pleasant";
};

export const mockHotels: Hotel[] = [
  {
    id: "1",
    name: "Hotel Lanzarote Village",
    location: "Puerto del Carmen, Lanzarote",
    country: "Spain",
    stars: 4,
    rating: 8.4,
    reviewCount: 2341,
    reviewScore: getReviewScore(8.4),
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
    boardType: "All Inclusive",
    accommodationType: "Hotel",
    flightType: "Direct",
    airline: "Jet2",
    lat: 28.9225,
    lng: -13.6653,
    prices: [
      { provider: "On the Beach", price: 469, url: "#" },
      { provider: "LoveHolidays", price: 489, url: "#" },
      { provider: "Lastminute.com", price: 512, url: "#" },
      { provider: "Booking.com", price: 498, url: "#" },
      { provider: "Skyscanner", price: 475, url: "#" },
      { provider: "TUI", price: 529, url: "#" },
      { provider: "Expedia", price: 495, url: "#" },
      { provider: "easyJet holidays", price: 482, url: "#" },
      { provider: "Trip.com", price: 501, url: "#" },
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
    reviewScore: getReviewScore(8.9),
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
    boardType: "Half Board",
    accommodationType: "Resort",
    flightType: "Direct",
    airline: "Ryanair",
    lat: 28.9189,
    lng: -13.6401,
    prices: [
      { provider: "LoveHolidays", price: 612, url: "#" },
      { provider: "Lastminute.com", price: 589, url: "#" },
      { provider: "Booking.com", price: 625, url: "#" },
      { provider: "Skyscanner", price: 598, url: "#" },
      { provider: "On the Beach", price: 579, url: "#" },
      { provider: "Jet2holidays", price: 605, url: "#" },
      { provider: "Expedia", price: 615, url: "#" },
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
    reviewScore: getReviewScore(9.1),
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop",
    boardType: "Breakfast included",
    accommodationType: "Hotel",
    flightType: "Direct",
    airline: "British Airways",
    lat: 28.9630,
    lng: -13.5477,
    prices: [
      { provider: "LoveHolidays", price: 745, url: "#" },
      { provider: "Booking.com", price: 698, url: "#" },
      { provider: "Skyscanner", price: 721, url: "#" },
      { provider: "TUI", price: 769, url: "#" },
      { provider: "Expedia", price: 710, url: "#" },
      { provider: "Trip.com", price: 689, url: "#" },
      { provider: "On the Beach", price: 715, url: "#" },
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
    reviewScore: getReviewScore(9.3),
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop",
    boardType: "All Inclusive",
    accommodationType: "Resort",
    flightType: "Direct",
    airline: "TUI Airways",
    lat: 28.8602,
    lng: -13.8312,
    prices: [
      { provider: "LoveHolidays", price: 892, url: "#" },
      { provider: "Lastminute.com", price: 879, url: "#" },
      { provider: "Booking.com", price: 915, url: "#" },
      { provider: "Skyscanner", price: 865, url: "#" },
      { provider: "TUI", price: 925, url: "#" },
      { provider: "Jet2holidays", price: 849, url: "#" },
      { provider: "On the Beach", price: 859, url: "#" },
      { provider: "easyJet holidays", price: 875, url: "#" },
      { provider: "Expedia", price: 899, url: "#" },
      { provider: "Trip.com", price: 889, url: "#" },
    ],
    amenities: ["Pool", "Spa", "WiFi", "Restaurant", "Kids Club", "Gym", "Tennis"],
    distanceToAirport: 22.1,
    distanceToBeach: 0.2,
    distanceToCenter: 1.5,
  },
  {
    id: "5",
    name: "Casa del Sol Apartments",
    location: "Costa Teguise, Lanzarote",
    country: "Spain",
    stars: 3,
    rating: 7.8,
    reviewCount: 654,
    reviewScore: getReviewScore(7.8),
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
    boardType: "Self Catering",
    accommodationType: "Apartment",
    flightType: "Direct",
    airline: "easyJet",
    lat: 28.9981,
    lng: -13.5623,
    prices: [
      { provider: "On the Beach", price: 299, url: "#" },
      { provider: "LoveHolidays", price: 325, url: "#" },
      { provider: "Booking.com", price: 312, url: "#" },
      { provider: "Expedia", price: 339, url: "#" },
      { provider: "Trip.com", price: 305, url: "#" },
    ],
    amenities: ["Pool", "WiFi", "Kitchen", "Balcony"],
    distanceToAirport: 10.5,
    distanceToBeach: 0.4,
    distanceToCenter: 0.6,
  },
  {
    id: "6",
    name: "Lanzarote Retreat Guest House",
    location: "Haría, Lanzarote",
    country: "Spain",
    stars: 2,
    rating: 7.2,
    reviewCount: 189,
    reviewScore: getReviewScore(7.2),
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop",
    boardType: "Breakfast included",
    accommodationType: "Guest House",
    flightType: "1 Stop",
    airline: "Vueling",
    lat: 29.1456,
    lng: -13.5012,
    prices: [
      { provider: "Booking.com", price: 215, url: "#" },
      { provider: "LoveHolidays", price: 239, url: "#" },
      { provider: "Expedia", price: 225, url: "#" },
      { provider: "Trip.com", price: 209, url: "#" },
    ],
    amenities: ["WiFi", "Garden", "Breakfast", "Parking"],
    distanceToAirport: 25.3,
    distanceToBeach: 3.2,
    distanceToCenter: 0.3,
  },
  {
    id: "7",
    name: "Volcano View Hostel",
    location: "Tinajo, Lanzarote",
    country: "Spain",
    stars: 1,
    rating: 6.5,
    reviewCount: 312,
    reviewScore: getReviewScore(6.5),
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop",
    boardType: "Meals not included",
    accommodationType: "Hostel",
    flightType: "1 Stop",
    airline: "Ryanair",
    lat: 29.0635,
    lng: -13.6738,
    prices: [
      { provider: "Booking.com", price: 149, url: "#" },
      { provider: "On the Beach", price: 165, url: "#" },
      { provider: "Trip.com", price: 155, url: "#" },
    ],
    amenities: ["WiFi", "Shared Kitchen", "Lounge", "Laundry"],
    distanceToAirport: 18.7,
    distanceToBeach: 5.1,
    distanceToCenter: 0.5,
  },
  {
    id: "8",
    name: "Eco Cave Unique Stay",
    location: "Tahiche, Lanzarote",
    country: "Spain",
    stars: 3,
    rating: 9.0,
    reviewCount: 87,
    reviewScore: getReviewScore(9.0),
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=400&fit=crop",
    boardType: "Self Catering",
    accommodationType: "Unique Stay",
    flightType: "Direct",
    airline: "Jet2",
    lat: 29.0012,
    lng: -13.5534,
    prices: [
      { provider: "Booking.com", price: 425, url: "#" },
      { provider: "Expedia", price: 449, url: "#" },
      { provider: "LoveHolidays", price: 439, url: "#" },
      { provider: "Trip.com", price: 415, url: "#" },
    ],
    amenities: ["WiFi", "Private Pool", "BBQ", "Garden", "Parking"],
    distanceToAirport: 7.8,
    distanceToBeach: 2.1,
    distanceToCenter: 1.8,
  },
];
