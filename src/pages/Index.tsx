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
import HeroBannerSlider, { type HeroSlide } from "@/components/HeroBannerSlider";
import PackageSearchForm from "@/components/PackageSearchForm";
import FeaturedDestinations from "@/components/FeaturedDestinations";
import TrustedBrandsSection from "@/components/TrustedBrandsSection";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const packageSlides: HeroSlide[] = [
  { image: heroBg1, topLine: "SUMMER SALE", mainText: "Save up to £300", subText: "On package holidays to top destinations", topLineClass: "text-lg md:text-xl font-bold text-accent uppercase tracking-[0.25em] italic", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-black text-white", subTextClass: "text-xl md:text-2xl text-white/90 font-light", textPosition: "center" },
  { image: heroSantorini, topLine: "SANTORINI ESCAPES", mainText: "From £399pp", subText: "Flights + Hotel • All-inclusive available", topLineClass: "text-base md:text-lg font-semibold text-white uppercase tracking-widest", mainTextClass: "font-display text-6xl md:text-8xl lg:text-9xl font-extrabold text-accent", subTextClass: "text-lg md:text-xl text-white/85 font-medium", textPosition: "left" },
  { image: heroBali, topLine: "TROPICAL PARADISE", mainText: "Bali from £499", subText: "14 nights • Beachfront villa • Return flights", topLineClass: "text-lg md:text-xl font-bold text-white/90 uppercase tracking-[0.3em]", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white italic", subTextClass: "text-lg md:text-2xl text-accent font-semibold", textPosition: "center" },
  { image: heroDubai, topLine: "LUXURY AWAITS", mainText: "Dubai Packages", subText: "5-star hotels from £549pp • Direct flights", topLineClass: "text-sm md:text-base font-black text-accent uppercase tracking-[0.4em]", mainTextClass: "font-display text-5xl md:text-7xl lg:text-[7rem] font-extrabold text-white", subTextClass: "text-xl md:text-2xl text-white/80 font-light italic", textPosition: "right" },
  { image: heroMachuPicchu, topLine: "ADVENTURE CALLS", mainText: "Peru from £699", subText: "Explore Machu Picchu • Guided tours included", topLineClass: "text-lg md:text-xl font-semibold text-white uppercase tracking-widest", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-black text-accent", subTextClass: "text-lg md:text-xl text-white/90 font-medium", textPosition: "left" },
  { image: heroBg2, topLine: "EASTER GETAWAY", mainText: "From £199pp", subText: "Flights + Hotel included • Limited availability", topLineClass: "text-lg md:text-2xl font-extrabold text-white uppercase italic tracking-wide", mainTextClass: "font-display text-6xl md:text-8xl lg:text-9xl font-black text-white", subTextClass: "text-lg md:text-xl text-accent font-bold", textPosition: "center" },
  { image: heroMaldives, topLine: "MALDIVES DREAM", mainText: "Save 40%", subText: "Overwater bungalows • All-inclusive from £899pp", topLineClass: "text-base md:text-lg font-bold text-accent uppercase tracking-[0.3em]", mainTextClass: "font-display text-6xl md:text-8xl lg:text-[8rem] font-black text-white italic", subTextClass: "text-xl md:text-2xl text-white/85 font-light", textPosition: "center" },
  { image: heroNewYork, topLine: "CITY BREAKS", mainText: "New York £349", subText: "3 nights • 4-star Manhattan hotel • Return flights", topLineClass: "text-lg md:text-xl font-semibold text-white/90 uppercase tracking-widest", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white", subTextClass: "text-lg md:text-xl text-accent font-semibold", textPosition: "left" },
  { image: heroPhuket, topLine: "LAST MINUTE DEALS", mainText: "Up to 50% OFF", subText: "Book by midnight • Don't miss out!", topLineClass: "text-xl md:text-2xl font-black text-accent uppercase tracking-wide", mainTextClass: "font-display text-6xl md:text-8xl lg:text-9xl font-black text-white", subTextClass: "text-lg md:text-2xl text-white/90 font-medium italic", textPosition: "center" },
  { image: heroParis, topLine: "ROMANTIC PARIS", mainText: "From £249pp", subText: "Eurostar + boutique hotel • Weekend breaks", topLineClass: "text-base md:text-lg font-semibold text-white uppercase tracking-[0.35em] italic", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-accent", subTextClass: "text-xl md:text-2xl text-white/85 font-light", textPosition: "right" },
  { image: heroBg3, topLine: "FAMILY HOLIDAYS", mainText: "Kids Go Free", subText: "Selected all-inclusive resorts • Book now", topLineClass: "text-lg md:text-xl font-bold text-white uppercase tracking-widest", mainTextClass: "font-display text-6xl md:text-8xl lg:text-[7rem] font-black text-accent", subTextClass: "text-lg md:text-xl text-white/90 font-semibold", textPosition: "center" },
  { image: heroSantorini, topLine: "GREEK ISLANDS", mainText: "7 Nights £449", subText: "Island-hopping packages • Ferry included", topLineClass: "text-sm md:text-base font-extrabold text-accent uppercase tracking-[0.4em]", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white italic", subTextClass: "text-xl md:text-2xl text-white/80 font-medium", textPosition: "left" },
  { image: heroDubai, topLine: "WINTER SUN", mainText: "Escape the Cold", subText: "Beach holidays from £299pp • Free cancellation", topLineClass: "text-lg md:text-xl font-semibold text-white/90 uppercase tracking-widest italic", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-black text-white", subTextClass: "text-lg md:text-2xl text-accent font-bold", textPosition: "center" },
  { image: heroBali, topLine: "HONEYMOON SPECIAL", mainText: "Save £500", subText: "Luxury couples retreats • Spa packages included", topLineClass: "text-base md:text-lg font-bold text-accent uppercase tracking-[0.25em]", mainTextClass: "font-display text-6xl md:text-8xl lg:text-9xl font-extrabold text-white", subTextClass: "text-xl md:text-2xl text-white/85 font-light italic", textPosition: "right" },
  { image: heroMachuPicchu, topLine: "BUCKET LIST", mainText: "Once in a Lifetime", subText: "Unique experiences worldwide • Expert-curated trips", topLineClass: "text-lg md:text-2xl font-black text-white uppercase tracking-wide", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-accent italic", subTextClass: "text-lg md:text-xl text-white/90 font-medium", textPosition: "center" },
  { image: heroMaldives, topLine: "PREMIUM COLLECTION", mainText: "5-Star Luxury", subText: "Handpicked resorts • VIP airport transfers", topLineClass: "text-sm md:text-base font-semibold text-accent uppercase tracking-[0.5em]", mainTextClass: "font-display text-6xl md:text-8xl lg:text-[8rem] font-black text-white", subTextClass: "text-xl md:text-2xl text-white/80 font-light", textPosition: "left" },
  { image: heroBg1, topLine: "BANK HOLIDAY SALE", mainText: "Extra 15% OFF", subText: "Use code HOLIDAY15 at checkout • Ends Sunday", topLineClass: "text-lg md:text-xl font-extrabold text-white uppercase tracking-widest", mainTextClass: "font-display text-6xl md:text-8xl lg:text-9xl font-black text-accent", subTextClass: "text-lg md:text-2xl text-white/90 font-semibold italic", textPosition: "center" },
  { image: heroNewYork, topLine: "LONG WEEKENDS", mainText: "From £179pp", subText: "European city breaks • Flights + 2 nights hotel", topLineClass: "text-base md:text-lg font-bold text-white/90 uppercase tracking-[0.3em]", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white", subTextClass: "text-xl md:text-2xl text-accent font-bold", textPosition: "right" },
  { image: heroPhuket, topLine: "ALL-INCLUSIVE", mainText: "Thailand £599", subText: "10 nights • Beachfront resort • All meals & drinks", topLineClass: "text-lg md:text-xl font-semibold text-accent uppercase tracking-widest italic", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-black text-white", subTextClass: "text-lg md:text-xl text-white/85 font-medium", textPosition: "left" },
  { image: heroParis, topLine: "EARLY BIRD 2026", mainText: "Book Now, Save Big", subText: "Next summer holidays • Prices from £249pp", topLineClass: "text-lg md:text-2xl font-black text-white uppercase tracking-wide italic", mainTextClass: "font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-accent", subTextClass: "text-xl md:text-2xl text-white/90 font-light", textPosition: "center" },
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
