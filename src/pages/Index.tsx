import heroBg1 from "@/assets/hero-bg.jpg";
import heroBg2 from "@/assets/hero-bg-2.jpg";
import heroBg3 from "@/assets/hero-bg-3.jpg";
import heroSantorini from "@/assets/hero-dest-santorini.jpg";
import heroBali from "@/assets/hero-dest-bali.jpg";
import heroDubai from "@/assets/hero-dest-dubai.jpg";
import heroMachuPicchu from "@/assets/hero-dest-machupicchu.jpg";
import heroMaldives from "@/assets/hero-dest-maldives.jpg";
import heroNewYork from "@/assets/hero-dest-newyork.jpg";
import heroPhuket from "@/assets/hero-dest-phuket.jpg";
import heroParis from "@/assets/hero-dest-paris.jpg";
import patternFloral from "@/assets/pattern-floral-tropical.jpg";
import patternRoses from "@/assets/pattern-floral-roses.jpg";
import patternGeometric from "@/assets/pattern-geometric.jpg";
import patternBotanical from "@/assets/pattern-botanical.jpg";
import patternWatercolor from "@/assets/pattern-watercolor.jpg";
import HeroBannerSlider, { type HeroSlide } from "@/components/HeroBannerSlider";
import PackageSearchForm from "@/components/PackageSearchForm";
import FeaturedDestinations from "@/components/FeaturedDestinations";
import TrustedBrandsSection from "@/components/TrustedBrandsSection";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const packageSlides: HeroSlide[] = [
  { image: heroBg1, topLine: "", mainText: "TRAVELZENTRA", subText: "", topLineClass: "hidden", mainTextClass: "font-bebas text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-[0.3em]", subTextClass: "hidden", textPosition: "center", showLogo: true },
  { image: heroSantorini, topLine: "SANTORINI ESCAPES", mainText: "From £399pp", subText: "Flights + Hotel • All-inclusive available", topLineClass: "text-lg md:text-xl font-bold text-white uppercase tracking-widest font-outfit", mainTextClass: "font-playfair text-6xl md:text-8xl lg:text-9xl font-black text-sky-300 italic", subTextClass: "text-lg md:text-2xl text-white/85 font-bold font-body", textPosition: "left" },
  { image: patternFloral, topLine: "TROPICAL PARADISE", mainText: "Bali from £499", subText: "14 nights • Beachfront villa • Return flights", topLineClass: "text-lg md:text-xl font-black text-white uppercase tracking-[0.3em] text-stroke-dark font-lora", mainTextClass: "font-bebas text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-wide", subTextClass: "text-lg md:text-2xl text-white font-bold text-stroke-dark font-outfit", textPosition: "center", overlayClass: "absolute inset-0 bg-black/50" },
  { image: heroDubai, topLine: "LUXURY AWAITS", mainText: "Dubai Packages", subText: "5-star hotels from £549pp • Direct flights", topLineClass: "text-lg md:text-xl font-black text-amber-300 uppercase tracking-[0.4em] font-body", mainTextClass: "font-lora text-6xl md:text-8xl lg:text-9xl font-black text-white italic", subTextClass: "text-lg md:text-2xl text-white/80 font-bold italic font-outfit", textPosition: "right" },
  { image: heroMachuPicchu, topLine: "ADVENTURE CALLS", mainText: "Peru from £699", subText: "Explore Machu Picchu • Guided tours included", topLineClass: "text-lg md:text-xl font-bold text-white uppercase tracking-widest font-lora", mainTextClass: "font-outfit text-6xl md:text-8xl lg:text-9xl font-extrabold text-emerald-300", subTextClass: "text-lg md:text-2xl text-white/90 font-bold font-body", textPosition: "left" },
  { image: patternGeometric, topLine: "EASTER GETAWAY", mainText: "From £199pp", subText: "Flights + Hotel included • Limited availability", topLineClass: "text-lg md:text-xl font-black text-white uppercase italic tracking-wide text-stroke-dark font-outfit", mainTextClass: "font-playfair text-6xl md:text-8xl lg:text-9xl font-black text-white italic", subTextClass: "text-lg md:text-2xl text-white font-bold text-stroke-dark font-body", textPosition: "center", overlayClass: "absolute inset-0 bg-black/55" },
  { image: heroMaldives, topLine: "MALDIVES DREAM", mainText: "Save 40%", subText: "Overwater bungalows • All-inclusive from £899pp", topLineClass: "text-lg md:text-xl font-black text-emerald-300 uppercase tracking-[0.3em] font-lora", mainTextClass: "font-bebas text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-wider", subTextClass: "text-lg md:text-2xl text-white/85 font-bold font-outfit", textPosition: "center" },
  { image: heroNewYork, topLine: "CITY BREAKS", mainText: "New York £349", subText: "3 nights • 4-star Manhattan hotel • Return flights", topLineClass: "text-lg md:text-xl font-bold text-white/90 uppercase tracking-widest font-body", mainTextClass: "font-outfit text-6xl md:text-8xl lg:text-9xl font-extrabold text-white", subTextClass: "text-lg md:text-2xl text-sky-300 font-bold font-lora", textPosition: "left" },
  { image: patternBotanical, topLine: "LAST MINUTE DEALS", mainText: "Up to 50% OFF", subText: "Book by midnight • Don't miss out!", topLineClass: "text-lg md:text-xl font-black text-white uppercase tracking-wide text-stroke-dark font-outfit", mainTextClass: "font-playfair text-6xl md:text-8xl lg:text-9xl font-black text-gradient-gold italic", subTextClass: "text-lg md:text-2xl text-white/90 font-bold italic text-stroke-dark font-body", textPosition: "center", overlayClass: "absolute inset-0 bg-black/50" },
  { image: heroParis, topLine: "ROMANTIC PARIS", mainText: "From £249pp", subText: "Eurostar + boutique hotel • Weekend breaks", topLineClass: "text-lg md:text-xl font-bold text-pink-300 uppercase tracking-[0.35em] font-lora", mainTextClass: "font-playfair text-6xl md:text-8xl lg:text-9xl font-black text-texture-watercolor text-stroke-dark", subTextClass: "text-lg md:text-2xl text-white/85 font-bold font-outfit", textPosition: "right" },
  { image: heroBg3, topLine: "FAMILY HOLIDAYS", mainText: "Kids Go Free", subText: "Selected all-inclusive resorts • Book now", topLineClass: "text-lg md:text-xl font-black text-white uppercase tracking-widest font-outfit", mainTextClass: "font-bebas text-6xl md:text-8xl lg:text-9xl font-black text-amber-300 tracking-wide", subTextClass: "text-lg md:text-2xl text-white/90 font-bold font-body", textPosition: "center" },
  { image: patternRoses, topLine: "GREEK ISLANDS", mainText: "7 Nights £449", subText: "Island-hopping packages • Ferry included", topLineClass: "text-lg md:text-xl font-black text-white uppercase tracking-[0.4em] text-stroke-dark font-lora", mainTextClass: "font-lora text-6xl md:text-8xl lg:text-9xl font-black text-white italic text-stroke-dark", subTextClass: "text-lg md:text-2xl text-white/90 font-bold text-stroke-dark font-outfit", textPosition: "left", overlayClass: "absolute inset-0 bg-black/55" },
  { image: heroDubai, topLine: "WINTER SUN", mainText: "Escape the Cold", subText: "Beach holidays from £299pp • Free cancellation", topLineClass: "text-lg md:text-xl font-bold text-white/90 uppercase tracking-widest italic font-body", mainTextClass: "font-outfit text-6xl md:text-8xl lg:text-9xl font-extrabold text-white", subTextClass: "text-lg md:text-2xl text-emerald-300 font-bold font-lora", textPosition: "center" },
  { image: heroBali, topLine: "HONEYMOON SPECIAL", mainText: "Save £500", subText: "Luxury couples retreats • Spa packages included", topLineClass: "text-lg md:text-xl font-black text-accent uppercase tracking-[0.25em] font-outfit", mainTextClass: "font-playfair text-6xl md:text-8xl lg:text-9xl font-black text-white italic", subTextClass: "text-lg md:text-2xl text-white/85 font-bold italic font-body", textPosition: "right" },
  { image: patternWatercolor, topLine: "BUCKET LIST", mainText: "Once in a Lifetime", subText: "Unique experiences worldwide • Expert-curated trips", topLineClass: "text-lg md:text-xl font-black text-white uppercase tracking-wide text-stroke-dark font-lora", mainTextClass: "font-bebas text-6xl md:text-8xl lg:text-9xl font-black text-texture-watercolor tracking-wider", subTextClass: "text-lg md:text-2xl text-white/90 font-bold text-stroke-dark font-outfit", textPosition: "center", overlayClass: "absolute inset-0 bg-black/50" },
  { image: heroMaldives, topLine: "PREMIUM COLLECTION", mainText: "5-Star Luxury", subText: "Handpicked resorts • VIP airport transfers", topLineClass: "text-lg md:text-xl font-bold text-sky-300 uppercase tracking-[0.5em] font-body", mainTextClass: "font-lora text-6xl md:text-8xl lg:text-9xl font-black text-white italic", subTextClass: "text-lg md:text-2xl text-white/80 font-bold font-outfit", textPosition: "left" },
  { image: heroBg1, topLine: "BANK HOLIDAY SALE", mainText: "Extra 15% OFF", subText: "Use code HOLIDAY15 at checkout • Ends Sunday", topLineClass: "text-lg md:text-xl font-black text-white uppercase tracking-widest font-outfit", mainTextClass: "font-bebas text-6xl md:text-8xl lg:text-9xl font-black text-accent tracking-wide", subTextClass: "text-lg md:text-2xl text-white/90 font-bold italic font-body", textPosition: "center" },
  { image: heroNewYork, topLine: "LONG WEEKENDS", mainText: "From £179pp", subText: "European city breaks • Flights + 2 nights hotel", topLineClass: "text-lg md:text-xl font-black text-white/90 uppercase tracking-[0.3em] font-lora", mainTextClass: "font-outfit text-6xl md:text-8xl lg:text-9xl font-extrabold text-white", subTextClass: "text-lg md:text-2xl text-amber-300 font-bold font-body", textPosition: "right" },
  { image: heroPhuket, topLine: "ALL-INCLUSIVE", mainText: "Thailand £599", subText: "10 nights • Beachfront resort • All meals & drinks", topLineClass: "text-lg md:text-xl font-bold text-emerald-300 uppercase tracking-widest italic font-body", mainTextClass: "font-playfair text-6xl md:text-8xl lg:text-9xl font-black text-white italic", subTextClass: "text-lg md:text-2xl text-white/85 font-bold font-outfit", textPosition: "left" },
  { image: heroBg2, topLine: "EARLY BIRD 2026", mainText: "Book Now, Save Big", subText: "Next summer holidays • Prices from £249pp", topLineClass: "text-lg md:text-xl font-black text-white uppercase tracking-wide italic font-outfit", mainTextClass: "font-bebas text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-wider", subTextClass: "text-lg md:text-2xl text-white/90 font-bold font-lora", textPosition: "center" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroBannerSlider slides={packageSlides}>
        <PackageSearchForm />
      </HeroBannerSlider>
      <FeaturedDestinations />
      <TrustedBrandsSection />
      <HowItWorks />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
