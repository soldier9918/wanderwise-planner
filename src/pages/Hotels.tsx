import heroBg1 from "@/assets/hero-bg.jpg";
import heroSantorini from "@/assets/hero-dest-santorini.jpg";
import heroBali from "@/assets/hero-dest-bali.jpg";
import heroDubai from "@/assets/hero-dest-dubai.jpg";
import heroMaldives from "@/assets/hero-dest-maldives.jpg";
import heroNewYork from "@/assets/hero-dest-newyork.jpg";
import heroPhuket from "@/assets/hero-dest-phuket.jpg";
import heroParis from "@/assets/hero-dest-paris.jpg";
import heroBg2 from "@/assets/hero-bg-2.jpg";
import heroBg3 from "@/assets/hero-bg-3.jpg";
import heroMachuPicchu from "@/assets/hero-dest-machupicchu.jpg";
import patternFloral from "@/assets/pattern-floral-tropical.jpg";
import patternRoses from "@/assets/pattern-floral-roses.jpg";
import patternGeometric from "@/assets/pattern-geometric.jpg";
import patternBotanical from "@/assets/pattern-botanical.jpg";
import patternWatercolor from "@/assets/pattern-watercolor.jpg";
import HeroBannerSlider, { type HeroSlide } from "@/components/HeroBannerSlider";
import HotelSearchForm from "@/components/HotelSearchForm";
import HotelDeals from "@/components/HotelDeals";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const hotelSlides: HeroSlide[] = [
  { image: heroBg1, topLine: "HOTEL DEALS", mainText: "Save 30% Today", subText: "On luxury stays worldwide • Limited time offer", topLineClass: "text-lg md:text-xl font-black text-accent uppercase tracking-[0.3em] font-outfit", mainTextClass: "font-bebas text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-wide", subTextClass: "text-lg md:text-2xl text-white/90 font-bold font-body", textPosition: "center" },
  { image: heroSantorini, topLine: "CITY BREAKS", mainText: "From £79/night", subText: "Top-rated hotels in Europe's best cities", topLineClass: "text-base md:text-lg font-bold text-white uppercase tracking-widest italic font-lora", mainTextClass: "font-playfair text-6xl md:text-8xl lg:text-9xl font-black text-accent italic", subTextClass: "text-xl md:text-2xl text-white/85 font-bold font-outfit", textPosition: "left" },
  { image: patternRoses, topLine: "BEACH RESORTS", mainText: "All-Inclusive", subText: "From £99/night • Beachfront properties • Spa included", topLineClass: "text-lg md:text-2xl font-black text-white uppercase tracking-wide text-stroke-dark font-outfit", mainTextClass: "font-lora text-5xl md:text-7xl lg:text-8xl font-bold text-gradient-gold italic text-stroke-dark", subTextClass: "text-lg md:text-xl text-white font-black text-stroke-dark font-body", textPosition: "center", overlayClass: "absolute inset-0 bg-black/50" },
  { image: heroDubai, topLine: "5-STAR LUXURY", mainText: "Dubai Hotels", subText: "Palm Jumeirah suites from £199/night", topLineClass: "text-sm md:text-base font-black text-accent uppercase tracking-[0.4em] font-body", mainTextClass: "font-outfit text-5xl md:text-7xl lg:text-[7rem] font-extrabold text-white", subTextClass: "text-xl md:text-2xl text-white/80 font-bold italic font-lora", textPosition: "right" },
  { image: heroMachuPicchu, topLine: "BOUTIQUE STAYS", mainText: "Unique Hotels", subText: "Handpicked boutique properties • Character & charm", topLineClass: "text-lg md:text-xl font-bold text-white/90 uppercase tracking-widest font-lora", mainTextClass: "font-playfair text-5xl md:text-7xl lg:text-8xl font-black text-accent italic", subTextClass: "text-lg md:text-xl text-white/90 font-bold font-outfit", textPosition: "left" },
  { image: patternFloral, topLine: "LAST MINUTE", mainText: "Up to 50% OFF", subText: "Tonight's stays at rock-bottom prices", topLineClass: "text-xl md:text-2xl font-black text-white uppercase tracking-wide text-stroke-dark font-body", mainTextClass: "font-bebas text-7xl md:text-9xl lg:text-[9rem] font-black text-gradient-fire tracking-wider", subTextClass: "text-lg md:text-2xl text-white/90 font-bold italic text-stroke-dark font-outfit", textPosition: "center", overlayClass: "absolute inset-0 bg-black/50" },
  { image: heroMaldives, topLine: "OVERWATER VILLAS", mainText: "Maldives £299", subText: "Per night • Private pool • Sunset views", topLineClass: "text-base md:text-lg font-black text-white uppercase tracking-[0.35em] font-outfit", mainTextClass: "font-lora text-6xl md:text-8xl lg:text-[8rem] font-bold text-accent italic", subTextClass: "text-lg md:text-xl text-white/85 font-bold font-body", textPosition: "center" },
  { image: heroNewYork, topLine: "MANHATTAN HOTELS", mainText: "New York £149", subText: "Per night • Times Square area • Free cancellation", topLineClass: "text-lg md:text-xl font-bold text-accent uppercase tracking-widest font-lora", mainTextClass: "font-outfit text-5xl md:text-7xl lg:text-8xl font-extrabold text-white", subTextClass: "text-lg md:text-xl text-white/90 font-bold font-body", textPosition: "left" },
  { image: patternGeometric, topLine: "TROPICAL RETREATS", mainText: "Thailand £59", subText: "Per night • 4-star beachfront • Breakfast included", topLineClass: "text-lg md:text-xl font-black text-white uppercase tracking-wide italic text-stroke-dark font-outfit", mainTextClass: "font-bebas text-7xl md:text-9xl lg:text-[9rem] font-black text-white text-stroke-dark tracking-wide", subTextClass: "text-xl md:text-2xl text-white font-black text-stroke-dark font-body", textPosition: "center", overlayClass: "absolute inset-0 bg-black/55" },
  { image: heroParis, topLine: "ROMANTIC GETAWAY", mainText: "Paris from £109", subText: "Boutique hotels • Eiffel Tower views available", topLineClass: "text-base md:text-lg font-bold text-white/90 uppercase tracking-[0.3em] font-body", mainTextClass: "font-playfair text-5xl md:text-7xl lg:text-8xl font-black text-accent italic", subTextClass: "text-xl md:text-2xl text-white/85 font-bold italic font-outfit", textPosition: "center" },
  { image: heroBg3, topLine: "FAMILY HOTELS", mainText: "Kids Stay Free", subText: "Selected family-friendly resorts • Pools & clubs", topLineClass: "text-lg md:text-xl font-black text-accent uppercase tracking-[0.25em] font-outfit", mainTextClass: "font-bebas text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-wide", subTextClass: "text-lg md:text-xl text-white/90 font-bold font-lora", textPosition: "left" },
  { image: patternBotanical, topLine: "SPA & WELLNESS", mainText: "Relax & Unwind", subText: "Spa hotels from £89/night • Treatments included", topLineClass: "text-sm md:text-base font-black text-white uppercase tracking-[0.5em] italic text-stroke-dark font-lora", mainTextClass: "font-lora text-6xl md:text-8xl lg:text-[7rem] font-bold text-white italic text-stroke-dark", subTextClass: "text-xl md:text-2xl text-white font-bold text-stroke-dark font-outfit", textPosition: "center", overlayClass: "absolute inset-0 bg-black/55" },
  { image: heroDubai, topLine: "APARTMENT STAYS", mainText: "Live Like a Local", subText: "Serviced apartments • Kitchen & lounge • Weekly rates", topLineClass: "text-lg md:text-xl font-bold text-white uppercase tracking-widest font-body", mainTextClass: "font-playfair text-5xl md:text-7xl lg:text-8xl font-black text-accent italic", subTextClass: "text-lg md:text-2xl text-white/80 font-bold font-outfit", textPosition: "right" },
  { image: heroBali, topLine: "HONEYMOON SUITES", mainText: "Save £200", subText: "Romantic packages • Champagne on arrival", topLineClass: "text-lg md:text-2xl font-black text-accent uppercase tracking-wide font-outfit", mainTextClass: "font-outfit text-6xl md:text-8xl lg:text-9xl font-extrabold text-white", subTextClass: "text-lg md:text-xl text-white/90 font-bold italic font-lora", textPosition: "center" },
  { image: patternWatercolor, topLine: "ADVENTURE LODGES", mainText: "Eco Stays", subText: "Mountain lodges & treehouses • Nature immersion", topLineClass: "text-base md:text-lg font-black text-white/90 uppercase tracking-[0.3em] text-stroke-dark font-lora", mainTextClass: "font-bebas text-6xl md:text-8xl lg:text-9xl font-black text-white text-stroke-dark tracking-wider", subTextClass: "text-xl md:text-2xl text-white font-black text-stroke-dark font-outfit", textPosition: "center", overlayClass: "absolute inset-0 bg-black/50" },
  { image: heroMaldives, topLine: "PRIVATE ISLANDS", mainText: "Ultimate Luxury", subText: "Exclusive island resorts • Butler service • From £599/night", topLineClass: "text-sm md:text-base font-bold text-accent uppercase tracking-[0.4em] italic font-body", mainTextClass: "font-lora text-6xl md:text-8xl lg:text-[8rem] font-bold text-white italic", subTextClass: "text-xl md:text-2xl text-white/85 font-bold font-outfit", textPosition: "center" },
  { image: heroNewYork, topLine: "HISTORIC HOTELS", mainText: "Stay in History", subText: "Castle hotels & heritage properties across Europe", topLineClass: "text-lg md:text-xl font-black text-white uppercase tracking-widest font-outfit", mainTextClass: "font-playfair text-5xl md:text-7xl lg:text-8xl font-black text-accent italic", subTextClass: "text-lg md:text-xl text-white/90 font-bold font-body", textPosition: "right" },
  { image: heroPhuket, topLine: "MEMBER EXCLUSIVE", mainText: "Extra 10% OFF", subText: "Sign up for free • Unlock secret hotel deals", topLineClass: "text-lg md:text-xl font-black text-accent uppercase tracking-[0.25em] font-lora", mainTextClass: "font-bebas text-7xl md:text-9xl lg:text-[9rem] font-black text-white tracking-wide", subTextClass: "text-lg md:text-2xl text-white/80 font-bold font-outfit", textPosition: "center" },
  { image: heroParis, topLine: "WINTER ESCAPES", mainText: "Cosy Hotels", subText: "Log cabins & ski chalets from £119/night", topLineClass: "text-base md:text-lg font-bold text-white uppercase tracking-[0.35em] font-body", mainTextClass: "font-outfit text-5xl md:text-7xl lg:text-8xl font-extrabold text-white", subTextClass: "text-xl md:text-2xl text-accent font-black italic font-lora", textPosition: "left" },
  { image: heroBg1, topLine: "PRICE MATCH", mainText: "Best Rate Guarantee", subText: "Find it cheaper elsewhere? We'll match it + 10%", topLineClass: "text-lg md:text-2xl font-black text-white uppercase tracking-wide italic font-outfit", mainTextClass: "font-playfair text-5xl md:text-7xl lg:text-8xl font-black text-accent italic", subTextClass: "text-lg md:text-xl text-white/90 font-bold font-body", textPosition: "center" },
];

const Hotels = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroBannerSlider slides={hotelSlides}>
        <HotelSearchForm />
      </HeroBannerSlider>
      <HotelDeals />
      <Footer />
    </div>
  );
};

export default Hotels;
