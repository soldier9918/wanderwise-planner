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
import patternFloral from "@/assets/pattern-floral-tropical.jpg";
import patternRoses from "@/assets/pattern-floral-roses.jpg";
import patternGeometric from "@/assets/pattern-geometric.jpg";
import patternBotanical from "@/assets/pattern-botanical.jpg";
import patternWatercolor from "@/assets/pattern-watercolor.jpg";
import HeroBannerSlider, { type HeroSlide } from "@/components/HeroBannerSlider";
import SearchForm from "@/components/SearchForm";
import FlightDeals from "@/components/FlightDeals";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const flightSlides: HeroSlide[] = [
  { image: flightsHeroBg1, topLine: "FLASH SALE", mainText: "£50 OFF Flights", subText: "All European destinations • Book today", topLineClass: "text-lg md:text-xl font-black text-amber-300 uppercase tracking-[0.3em] font-outfit", mainTextClass: "font-bebas text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-wide", subTextClass: "text-lg md:text-2xl text-white/90 font-bold font-body", textPosition: "center" },
  { image: flightsClouds, topLine: "FLY FOR LESS", mainText: "Compare 500+ Airlines", subText: "Best price guaranteed • No booking fees", topLineClass: "text-lg md:text-xl font-bold text-white uppercase tracking-widest italic font-lora", mainTextClass: "font-playfair text-6xl md:text-8xl lg:text-9xl font-black text-sky-300 italic", subTextClass: "text-lg md:text-2xl text-white/85 font-bold font-outfit", textPosition: "left" },
  { image: patternGeometric, topLine: "SUMMER FLIGHTS", mainText: "From £29 One Way", subText: "Short-haul European getaways • Direct flights", topLineClass: "text-lg md:text-xl font-black text-white uppercase tracking-wide text-stroke-dark font-outfit", mainTextClass: "font-bebas text-6xl md:text-8xl lg:text-9xl font-black text-gradient-fire tracking-wider", subTextClass: "text-lg md:text-2xl text-white font-bold text-stroke-dark font-body", textPosition: "center", overlayClass: "absolute inset-0 bg-black/55" },
  { image: flightsTerminal, topLine: "BUSINESS CLASS", mainText: "Save up to 60%", subText: "Premium cabins at economy prices", topLineClass: "text-lg md:text-xl font-black text-emerald-300 uppercase tracking-[0.4em] font-body", mainTextClass: "font-lora text-6xl md:text-8xl lg:text-9xl font-black text-white italic", subTextClass: "text-lg md:text-2xl text-white/80 font-bold font-outfit", textPosition: "right" },
  { image: flightsTakeoff, topLine: "LONG-HAUL DEALS", mainText: "Asia from £299", subText: "Return flights • Top airlines • Flexible dates", topLineClass: "text-lg md:text-xl font-bold text-white/90 uppercase tracking-widest font-lora", mainTextClass: "font-outfit text-6xl md:text-8xl lg:text-9xl font-extrabold text-white", subTextClass: "text-lg md:text-2xl text-amber-300 font-bold font-body", textPosition: "left" },
  { image: patternFloral, topLine: "USA FLIGHTS", mainText: "New York £249", subText: "Direct from London • Multiple airlines", topLineClass: "text-lg md:text-xl font-black text-white uppercase tracking-[0.25em] italic text-stroke-dark font-outfit", mainTextClass: "font-playfair text-6xl md:text-8xl lg:text-9xl font-black text-gradient-gold italic", subTextClass: "text-lg md:text-2xl text-white/90 font-bold text-stroke-dark font-body", textPosition: "center", overlayClass: "absolute inset-0 bg-black/50" },
  { image: flightsHeroBg3, topLine: "LAST MINUTE", mainText: "Up to 70% OFF", subText: "Departing this week • Limited seats", topLineClass: "text-lg md:text-xl font-black text-white uppercase tracking-wide font-lora", mainTextClass: "font-bebas text-6xl md:text-8xl lg:text-9xl font-black text-accent tracking-wide", subTextClass: "text-lg md:text-2xl text-white/90 font-bold italic font-outfit", textPosition: "center" },
  { image: flightsPlanes, topLine: "MULTI-CITY", mainText: "Build Your Trip", subText: "Fly into one city, out of another • Flexible routing", topLineClass: "text-lg md:text-xl font-bold text-white uppercase tracking-[0.35em] font-body", mainTextClass: "font-playfair text-6xl md:text-8xl lg:text-9xl font-black text-white italic", subTextClass: "text-lg md:text-2xl text-pink-300 font-bold font-lora", textPosition: "left" },
  { image: patternRoses, topLine: "WEEKEND ESCAPES", mainText: "Fly from £19", subText: "Friday to Sunday breaks • Budget airlines included", topLineClass: "text-lg md:text-xl font-black text-white uppercase tracking-widest text-stroke-dark font-outfit", mainTextClass: "font-lora text-6xl md:text-8xl lg:text-9xl font-black text-white italic text-stroke-dark", subTextClass: "text-lg md:text-2xl text-white/90 font-bold text-stroke-dark font-body", textPosition: "center", overlayClass: "absolute inset-0 bg-black/50" },
  { image: flightsNight, topLine: "RED-EYE DEALS", mainText: "Extra 20% OFF", subText: "Night flights • Arrive refreshed • Save more", topLineClass: "text-lg md:text-xl font-black text-sky-300 uppercase tracking-[0.3em] italic font-lora", mainTextClass: "font-outfit text-6xl md:text-8xl lg:text-9xl font-extrabold text-white", subTextClass: "text-lg md:text-2xl text-white/90 font-bold font-body", textPosition: "center" },
  { image: flightsSunrise, topLine: "EARLY BIRD 2026", mainText: "Book Now, Fly Later", subText: "Next summer flights from £39 • Free changes", topLineClass: "text-lg md:text-xl font-bold text-accent uppercase tracking-widest font-outfit", mainTextClass: "font-bebas text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-wider", subTextClass: "text-lg md:text-2xl text-white/90 font-bold font-lora", textPosition: "left" },
  { image: flightsHeroBg1, topLine: "CARIBBEAN FLIGHTS", mainText: "Jamaica £349", subText: "Direct flights • Premium economy available", topLineClass: "text-lg md:text-xl font-black text-white uppercase tracking-[0.5em] font-body", mainTextClass: "font-playfair text-6xl md:text-8xl lg:text-9xl font-black text-emerald-300 italic", subTextClass: "text-lg md:text-2xl text-white/85 font-bold italic font-outfit", textPosition: "center" },
  { image: patternBotanical, topLine: "FIRST CLASS", mainText: "Fly in Style", subText: "Luxury airlines • Lie-flat seats • Lounge access", topLineClass: "text-lg md:text-xl font-black text-white uppercase tracking-[0.25em] text-stroke-dark font-lora", mainTextClass: "font-bebas text-6xl md:text-8xl lg:text-9xl font-black text-white text-stroke-dark tracking-wide", subTextClass: "text-lg md:text-2xl text-white/90 font-bold text-stroke-dark font-outfit", textPosition: "center", overlayClass: "absolute inset-0 bg-black/55" },
  { image: flightsTerminal, topLine: "STUDENT DISCOUNTS", mainText: "15% OFF All Flights", subText: "Valid student ID required • No minimum spend", topLineClass: "text-lg md:text-xl font-black text-white uppercase tracking-wide italic font-outfit", mainTextClass: "font-lora text-6xl md:text-8xl lg:text-9xl font-black text-amber-300 italic", subTextClass: "text-lg md:text-2xl text-white/90 font-bold font-body", textPosition: "center" },
  { image: flightsTakeoff, topLine: "FAMILY FARES", mainText: "Kids Fly Half Price", subText: "Under 12s • Selected routes • Summer 2026", topLineClass: "text-lg md:text-xl font-bold text-white uppercase tracking-widest font-body", mainTextClass: "font-outfit text-6xl md:text-8xl lg:text-9xl font-extrabold text-white", subTextClass: "text-lg md:text-2xl text-pink-300 font-bold font-lora", textPosition: "left" },
  { image: patternWatercolor, topLine: "AFRICA SALE", mainText: "Cape Town £399", subText: "Return flights • Premium carriers • 10h direct", topLineClass: "text-lg md:text-xl font-black text-white uppercase tracking-[0.3em] text-stroke-dark font-outfit", mainTextClass: "font-playfair text-6xl md:text-8xl lg:text-9xl font-black text-white italic text-stroke-dark", subTextClass: "text-lg md:text-2xl text-white/90 font-bold text-stroke-dark font-body", textPosition: "center", overlayClass: "absolute inset-0 bg-black/50" },
  { image: flightsPlanes, topLine: "AUSTRALIA FLIGHTS", mainText: "Sydney from £499", subText: "Multiple stops available • Qantas & Emirates", topLineClass: "text-lg md:text-xl font-black text-white uppercase tracking-[0.4em] italic font-lora", mainTextClass: "font-bebas text-6xl md:text-8xl lg:text-9xl font-black text-accent tracking-wide", subTextClass: "text-lg md:text-2xl text-white/90 font-bold font-outfit", textPosition: "right" },
  { image: flightsWindow, topLine: "PRICE DROP ALERT", mainText: "Prices Just Fell", subText: "Popular routes reduced • Book before they rise", topLineClass: "text-lg md:text-xl font-black text-sky-300 uppercase tracking-wide font-outfit", mainTextClass: "font-lora text-6xl md:text-8xl lg:text-9xl font-black text-white italic", subTextClass: "text-lg md:text-2xl text-white/80 font-bold font-body", textPosition: "center" },
  { image: flightsNight, topLine: "BANK HOLIDAY", mainText: "Extra £30 OFF", subText: "Code: BANKFLY30 • This weekend only", topLineClass: "text-lg md:text-xl font-black text-white uppercase tracking-widest font-body", mainTextClass: "font-playfair text-6xl md:text-8xl lg:text-9xl font-black text-white italic", subTextClass: "text-lg md:text-2xl text-emerald-300 font-bold italic font-outfit", textPosition: "left" },
  { image: flightsSunrise, topLine: "FLEXIBLE FLIGHTS", mainText: "Free Date Changes", subText: "Change your travel dates at no extra cost", topLineClass: "text-lg md:text-xl font-bold text-amber-300 uppercase tracking-[0.35em] font-lora", mainTextClass: "font-outfit text-6xl md:text-8xl lg:text-9xl font-extrabold text-white", subTextClass: "text-lg md:text-2xl text-white/85 font-bold font-body", textPosition: "center" },
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
