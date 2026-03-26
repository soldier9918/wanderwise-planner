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
              <span className="relative inline-block border-4 border-primary text-white px-6 py-2 rounded-lg mt-2 overflow-hidden">
                {/* Faint floral accents */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.12] pointer-events-none" viewBox="0 0 400 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                  {/* Left floral cluster */}
                  <circle cx="30" cy="25" r="8" fill="hsl(348,83%,58%)" />
                  <circle cx="22" cy="18" r="5" fill="hsl(348,83%,58%)" />
                  <circle cx="38" cy="18" r="5" fill="hsl(348,83%,58%)" />
                  <circle cx="25" cy="32" r="5" fill="hsl(348,83%,58%)" />
                  <circle cx="35" cy="32" r="5" fill="hsl(348,83%,58%)" />
                  <ellipse cx="30" cy="50" rx="3" ry="12" fill="hsl(348,70%,65%)" transform="rotate(-15 30 50)" />
                  <ellipse cx="36" cy="48" rx="3" ry="10" fill="hsl(348,70%,65%)" transform="rotate(15 36 48)" />
                  {/* Right floral cluster */}
                  <circle cx="370" cy="55" r="8" fill="hsl(348,83%,58%)" />
                  <circle cx="362" cy="48" r="5" fill="hsl(348,83%,58%)" />
                  <circle cx="378" cy="48" r="5" fill="hsl(348,83%,58%)" />
                  <circle cx="365" cy="62" r="5" fill="hsl(348,83%,58%)" />
                  <circle cx="375" cy="62" r="5" fill="hsl(348,83%,58%)" />
                  <ellipse cx="370" cy="35" rx="2.5" ry="10" fill="hsl(348,70%,65%)" transform="rotate(20 370 35)" />
                  {/* Scattered petals */}
                  <ellipse cx="120" cy="15" rx="6" ry="3" fill="hsl(348,83%,58%)" transform="rotate(-30 120 15)" />
                  <ellipse cx="130" cy="20" rx="5" ry="2.5" fill="hsl(348,83%,58%)" transform="rotate(40 130 20)" />
                  <ellipse cx="280" cy="60" rx="6" ry="3" fill="hsl(348,83%,58%)" transform="rotate(25 280 60)" />
                  <ellipse cx="270" cy="55" rx="5" ry="2.5" fill="hsl(348,83%,58%)" transform="rotate(-35 270 55)" />
                  {/* Tiny accent dots */}
                  <circle cx="80" cy="40" r="2" fill="hsl(348,70%,65%)" />
                  <circle cx="200" cy="10" r="2" fill="hsl(348,70%,65%)" />
                  <circle cx="320" cy="35" r="2" fill="hsl(348,70%,65%)" />
                  <circle cx="160" cy="65" r="1.5" fill="hsl(348,70%,65%)" />
                  <circle cx="240" cy="70" r="1.5" fill="hsl(348,70%,65%)" />
                </svg>
                Package Holiday
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
