export interface LiveHotelOffer {
  id: string;
  price: number;
  currency: string;
  roomType: string;
  boardType: string;
  cancellationDeadline?: string | null;
}

export interface LiveHotel {
  hotelId: string;
  name: string;
  cityCode: string;
  countryCode: string;
  stars: number;
  rating: number;
  lat: number;
  lng: number;
  offers: LiveHotelOffer[];
}
