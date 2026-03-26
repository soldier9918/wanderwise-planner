import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import PackageSearchForm from "@/components/PackageSearchForm";
import FeaturedDestinations from "@/components/FeaturedDestinations";
import TrustedBrandsSection from "@/components/TrustedBrandsSection";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const heroImages = [
  heroBg1, heroSantorini, heroBg2, heroBali, heroDubai,
  heroMachuPicchu, heroBg3, heroMaldives, heroNewYork, heroPhuket, heroParis,
];

const Index = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden text-white">
        <div className="absolute inset-0">
          {/* Crossfade: all images stacked, only active one is visible */}
          {heroImages.map((src, index) => (
            <motion.img
              key={index}
              src={src}
              alt="Travel destination"
              className="w-full h-full object-cover absolute inset-0"
              initial={false}
              animate={{ opacity: index === currentImage ? 1 : 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          ))}
          <div className="absolute inset-0 bg-navy/35" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-transparent to-navy/50" />
        </div>

        <div className="relative z-10 container mx-auto px-4 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10"
          >
            <h1 className="font-display text-6xl md:text-8xl lg:text-[7rem] font-extrabold text-white mb-4 leading-[0.95] tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.5)' }}>
              Find Your Perfect
              <br />
              <span className="inline-block relative px-8 py-3 mt-2">
                {/* Floral vine border SVG */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Main border frame */}
                  <rect x="4" y="4" width="392" height="72" rx="12" stroke="white" strokeWidth="2.5" strokeOpacity="0.9" />
                  
                  {/* Top-left corner vine cluster */}
                  <path d="M30 4 C30 -8, 10 -5, 12 4" stroke="white" strokeWidth="1.8" strokeOpacity="0.85" fill="none" />
                  <path d="M12 4 C5 8, 2 18, 4 28" stroke="white" strokeWidth="1.8" strokeOpacity="0.85" fill="none" />
                  <circle cx="10" cy="2" r="3" fill="white" fillOpacity="0.7" />
                  <circle cx="5" cy="14" r="2.5" fill="white" fillOpacity="0.6" />
                  <path d="M18 4 C18 -4, 8 0, 10 4" stroke="white" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                  {/* Leaf shapes top-left */}
                  <ellipse cx="8" cy="8" rx="4" ry="2" transform="rotate(-45 8 8)" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="0.8" strokeOpacity="0.5" />
                  <ellipse cx="6" cy="20" rx="3.5" ry="1.8" transform="rotate(-70 6 20)" fill="white" fillOpacity="0.12" stroke="white" strokeWidth="0.8" strokeOpacity="0.5" />
                  
                  {/* Top swirl vine */}
                  <path d="M50 4 C55 -6, 70 -6, 75 4" stroke="white" strokeWidth="1.3" strokeOpacity="0.5" fill="none" />
                  <path d="M60 4 C62 -3, 68 -3, 70 4" stroke="white" strokeWidth="1" strokeOpacity="0.4" fill="none" />
                  <circle cx="62" cy="0" r="1.8" fill="white" fillOpacity="0.4" />
                  
                  <path d="M140 4 C145 -8, 160 -8, 165 4" stroke="white" strokeWidth="1.3" strokeOpacity="0.5" fill="none" />
                  <path d="M148 4 C150 -4, 157 -4, 159 4" stroke="white" strokeWidth="1" strokeOpacity="0.4" fill="none" />
                  <circle cx="152" cy="-1" r="2" fill="white" fillOpacity="0.35" />
                  
                  <path d="M240 4 C244 -7, 256 -7, 260 4" stroke="white" strokeWidth="1.3" strokeOpacity="0.5" fill="none" />
                  <circle cx="250" cy="0" r="1.5" fill="white" fillOpacity="0.4" />

                  <path d="M330 4 C335 -6, 348 -6, 352 4" stroke="white" strokeWidth="1.3" strokeOpacity="0.5" fill="none" />
                  <circle cx="340" cy="-1" r="1.8" fill="white" fillOpacity="0.35" />
                  
                  {/* Top-right corner vine cluster */}
                  <path d="M370 4 C378 -8, 398 -5, 396 4" stroke="white" strokeWidth="1.8" strokeOpacity="0.85" fill="none" />
                  <path d="M396 4 C400 10, 400 22, 396 30" stroke="white" strokeWidth="1.8" strokeOpacity="0.85" fill="none" />
                  <circle cx="392" cy="2" r="3" fill="white" fillOpacity="0.7" />
                  <circle cx="398" cy="16" r="2.5" fill="white" fillOpacity="0.6" />
                  <ellipse cx="394" cy="8" rx="4" ry="2" transform="rotate(45 394 8)" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="0.8" strokeOpacity="0.5" />
                  <ellipse cx="397" cy="22" rx="3.5" ry="1.8" transform="rotate(70 397 22)" fill="white" fillOpacity="0.12" stroke="white" strokeWidth="0.8" strokeOpacity="0.5" />

                  {/* Bottom-left corner vine cluster */}
                  <path d="M4 50 C0 56, 2 70, 12 76" stroke="white" strokeWidth="1.8" strokeOpacity="0.85" fill="none" />
                  <path d="M12 76 C20 82, 32 82, 38 76" stroke="white" strokeWidth="1.8" strokeOpacity="0.85" fill="none" />
                  <circle cx="6" cy="60" r="2.5" fill="white" fillOpacity="0.6" />
                  <circle cx="14" cy="78" r="3" fill="white" fillOpacity="0.7" />
                  <ellipse cx="6" cy="56" rx="3.5" ry="1.8" transform="rotate(60 6 56)" fill="white" fillOpacity="0.12" stroke="white" strokeWidth="0.8" strokeOpacity="0.5" />
                  <ellipse cx="20" cy="78" rx="4" ry="2" transform="rotate(20 20 78)" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="0.8" strokeOpacity="0.5" />
                  
                  {/* Bottom swirl vines */}
                  <path d="M80 76 C85 84, 98 84, 103 76" stroke="white" strokeWidth="1.3" strokeOpacity="0.5" fill="none" />
                  <circle cx="92" cy="81" r="1.8" fill="white" fillOpacity="0.4" />
                  
                  <path d="M180 76 C185 84, 198 84, 203 76" stroke="white" strokeWidth="1.3" strokeOpacity="0.5" fill="none" />
                  <circle cx="192" cy="81" r="2" fill="white" fillOpacity="0.35" />
                  
                  <path d="M280 76 C284 83, 296 83, 300 76" stroke="white" strokeWidth="1.3" strokeOpacity="0.5" fill="none" />
                  <circle cx="290" cy="80" r="1.5" fill="white" fillOpacity="0.4" />

                  {/* Bottom-right corner vine cluster */}
                  <path d="M396 50 C400 56, 400 68, 396 76" stroke="white" strokeWidth="1.8" strokeOpacity="0.85" fill="none" />
                  <path d="M396 76 C390 82, 376 82, 370 76" stroke="white" strokeWidth="1.8" strokeOpacity="0.85" fill="none" />
                  <circle cx="398" cy="60" r="2.5" fill="white" fillOpacity="0.6" />
                  <circle cx="390" cy="78" r="3" fill="white" fillOpacity="0.7" />
                  <ellipse cx="396" cy="56" rx="3.5" ry="1.8" transform="rotate(-60 396 56)" fill="white" fillOpacity="0.12" stroke="white" strokeWidth="0.8" strokeOpacity="0.5" />
                  <ellipse cx="382" cy="78" rx="4" ry="2" transform="rotate(-20 382 78)" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="0.8" strokeOpacity="0.5" />
                  
                  {/* Side vine accents */}
                  <path d="M4 38 C-4 40, -4 44, 4 46" stroke="white" strokeWidth="1.2" strokeOpacity="0.45" fill="none" />
                  <circle cx="0" cy="42" r="1.5" fill="white" fillOpacity="0.3" />
                  
                  <path d="M396 34 C404 36, 404 42, 396 44" stroke="white" strokeWidth="1.2" strokeOpacity="0.45" fill="none" />
                  <circle cx="400" cy="39" r="1.5" fill="white" fillOpacity="0.3" />
                </svg>
                <span className="relative z-10 text-white">Package Holiday</span>
              </span>
            </h1>
            <p className="text-white/90 text-xl md:text-2xl font-medium mt-6" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
              Search hotels & flights across all your favourite brands — all in one place.
            </p>
          </motion.div>

          <PackageSearchForm />
        </div>
      </section>

      <FeaturedDestinations />
      <TrustedBrandsSection />
      <HowItWorks />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
