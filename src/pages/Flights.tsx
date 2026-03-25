import flightsHeroBg1 from "@/assets/flights-hero-bg.jpg";
import flightsHeroBg2 from "@/assets/flights-hero-bg-2.jpg";
import flightsHeroBg3 from "@/assets/flights-hero-bg-3.jpg";
import flightsClouds from "@/assets/flights-dest-clouds.jpg";
import flightsTerminal from "@/assets/flights-dest-terminal.jpg";
import flightsTakeoff from "@/assets/flights-dest-takeoff.jpg";
import flightsAerial from "@/assets/flights-dest-aerial.jpg";
import flightsPlanes from "@/assets/flights-dest-planes.jpg";
import flightsWindow from "@/assets/flights-dest-window.jpg";
import flightsNight from "@/assets/flights-dest-night.jpg";
import flightsSunrise from "@/assets/flights-dest-sunrise.jpg";
import HeroBannerSlider, { type HeroSlide } from "@/components/HeroBannerSlider";
import SearchForm from "@/components/SearchForm";
import FlightDeals from "@/components/FlightDeals";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const flightSlides: HeroSlide[] = [
  { image: flightsHeroBg1, topLine: "FLASH SALE", mainText: "£50 OFF Flights", subText: "All European destinations • Book today", topLineClass: "text-lg md:text-xl font-black text-accent uppercase tracking-[0.3em]", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white", subTextClass: "text-lg md:text-2xl text-white/90 font-light", textPosition: "center" },
  { image: flightsClouds, topLine: "FLY FOR LESS", mainText: "Compare 500+ Airlines", subText: "Best price guaranteed • No booking fees", topLineClass: "text-base md:text-lg font-semibold text-white uppercase tracking-widest italic", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-black text-accent", subTextClass: "text-xl md:text-2xl text-white/85 font-medium", textPosition: "left" },
  { image: flightsHeroBg2, topLine: "SUMMER FLIGHTS", mainText: "From £29 One Way", subText: "Short-haul European getaways • Direct flights", topLineClass: "text-lg md:text-2xl font-extrabold text-white uppercase tracking-wide", mainTextClass: "font-display text-6xl md:text-8xl lg:text-9xl font-black text-white", subTextClass: "text-lg md:text-xl text-accent font-bold", textPosition: "center" },
  { image: flightsTerminal, topLine: "BUSINESS CLASS", mainText: "Save up to 60%", subText: "Premium cabins at economy prices", topLineClass: "text-sm md:text-base font-bold text-accent uppercase tracking-[0.4em]", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white italic", subTextClass: "text-xl md:text-2xl text-white/80 font-light", textPosition: "right" },
  { image: flightsTakeoff, topLine: "LONG-HAUL DEALS", mainText: "Asia from £299", subText: "Return flights • Top airlines • Flexible dates", topLineClass: "text-lg md:text-xl font-semibold text-white/90 uppercase tracking-widest", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-black text-white", subTextClass: "text-lg md:text-xl text-accent font-semibold", textPosition: "left" },
  { image: flightsAerial, topLine: "USA FLIGHTS", mainText: "New York £249", subText: "Direct from London • Multiple airlines", topLineClass: "text-lg md:text-xl font-bold text-accent uppercase tracking-[0.25em] italic", mainTextClass: "font-display text-6xl md:text-8xl lg:text-9xl font-extrabold text-white", subTextClass: "text-lg md:text-2xl text-white/85 font-medium", textPosition: "center" },
  { image: flightsHeroBg3, topLine: "LAST MINUTE", mainText: "Up to 70% OFF", subText: "Departing this week • Limited seats", topLineClass: "text-xl md:text-2xl font-black text-white uppercase tracking-wide", mainTextClass: "font-display text-6xl md:text-8xl lg:text-[8rem] font-black text-accent", subTextClass: "text-xl md:text-2xl text-white/90 font-medium italic", textPosition: "center" },
  { image: flightsPlanes, topLine: "MULTI-CITY", mainText: "Build Your Trip", subText: "Fly into one city, out of another • Flexible routing", topLineClass: "text-base md:text-lg font-semibold text-white uppercase tracking-[0.35em]", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white", subTextClass: "text-lg md:text-xl text-accent font-bold", textPosition: "left" },
  { image: flightsWindow, topLine: "WEEKEND ESCAPES", mainText: "Fly from £19", subText: "Friday to Sunday breaks • Budget airlines included", topLineClass: "text-lg md:text-xl font-extrabold text-accent uppercase tracking-widest", mainTextClass: "font-display text-6xl md:text-8xl lg:text-9xl font-black text-white italic", subTextClass: "text-lg md:text-2xl text-white/80 font-light", textPosition: "right" },
  { image: flightsNight, topLine: "RED-EYE DEALS", mainText: "Extra 20% OFF", subText: "Night flights • Arrive refreshed • Save more", topLineClass: "text-base md:text-lg font-bold text-white/90 uppercase tracking-[0.3em] italic", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white", subTextClass: "text-xl md:text-2xl text-accent font-semibold", textPosition: "center" },
  { image: flightsSunrise, topLine: "EARLY BIRD 2026", mainText: "Book Now, Fly Later", subText: "Next summer flights from £39 • Free changes", topLineClass: "text-lg md:text-xl font-semibold text-accent uppercase tracking-widest", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-black text-white", subTextClass: "text-lg md:text-xl text-white/90 font-medium", textPosition: "left" },
  { image: flightsHeroBg1, topLine: "CARIBBEAN FLIGHTS", mainText: "Jamaica £349", subText: "Direct flights • Premium economy available", topLineClass: "text-sm md:text-base font-black text-white uppercase tracking-[0.5em]", mainTextClass: "font-display text-6xl md:text-8xl lg:text-[7rem] font-extrabold text-accent", subTextClass: "text-xl md:text-2xl text-white/85 font-light italic", textPosition: "center" },
  { image: flightsClouds, topLine: "FIRST CLASS", mainText: "Fly in Style", subText: "Luxury airlines • Lie-flat seats • Lounge access", topLineClass: "text-lg md:text-xl font-bold text-accent uppercase tracking-[0.25em]", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-black text-white italic", subTextClass: "text-xl md:text-2xl text-white/80 font-medium", textPosition: "right" },
  { image: flightsTerminal, topLine: "STUDENT DISCOUNTS", mainText: "15% OFF All Flights", subText: "Valid student ID required • No minimum spend", topLineClass: "text-lg md:text-2xl font-extrabold text-white uppercase tracking-wide italic", mainTextClass: "font-display text-6xl md:text-8xl lg:text-9xl font-black text-accent", subTextClass: "text-lg md:text-xl text-white/90 font-semibold", textPosition: "center" },
  { image: flightsTakeoff, topLine: "FAMILY FARES", mainText: "Kids Fly Half Price", subText: "Under 12s • Selected routes • Summer 2026", topLineClass: "text-base md:text-lg font-semibold text-white uppercase tracking-widest", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white", subTextClass: "text-lg md:text-2xl text-accent font-bold", textPosition: "left" },
  { image: flightsAerial, topLine: "AFRICA SALE", mainText: "Cape Town £399", subText: "Return flights • Premium carriers • 10h direct", topLineClass: "text-lg md:text-xl font-bold text-accent uppercase tracking-[0.3em]", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-black text-white", subTextClass: "text-xl md:text-2xl text-white/85 font-light", textPosition: "center" },
  { image: flightsPlanes, topLine: "AUSTRALIA FLIGHTS", mainText: "Sydney from £499", subText: "Multiple stops available • Qantas & Emirates", topLineClass: "text-sm md:text-base font-extrabold text-white uppercase tracking-[0.4em] italic", mainTextClass: "font-display text-6xl md:text-8xl lg:text-[8rem] font-extrabold text-accent", subTextClass: "text-lg md:text-xl text-white/90 font-medium", textPosition: "right" },
  { image: flightsWindow, topLine: "PRICE DROP ALERT", mainText: "Prices Just Fell", subText: "Popular routes reduced • Book before they rise", topLineClass: "text-lg md:text-xl font-black text-accent uppercase tracking-wide", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white italic", subTextClass: "text-xl md:text-2xl text-white/80 font-semibold", textPosition: "center" },
  { image: flightsNight, topLine: "BANK HOLIDAY", mainText: "Extra £30 OFF", subText: "Code: BANKFLY30 • This weekend only", topLineClass: "text-lg md:text-2xl font-bold text-white uppercase tracking-widest", mainTextClass: "font-display text-6xl md:text-8xl lg:text-9xl font-black text-white", subTextClass: "text-lg md:text-2xl text-accent font-bold italic", textPosition: "left" },
  { image: flightsSunrise, topLine: "FLEXIBLE FLIGHTS", mainText: "Free Date Changes", subText: "Change your travel dates at no extra cost", topLineClass: "text-base md:text-lg font-semibold text-accent uppercase tracking-[0.35em]", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white", subTextClass: "text-xl md:text-2xl text-white/85 font-light", textPosition: "center" },
];

const Flights = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroBannerSlider slides={flightSlides}>
        <SearchForm />
      </HeroBannerSlider>
      <FlightDeals />
      <Footer />
    </div>
  );
};

export default Flights;
