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
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 leading-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.5)' }}>
              Find Your Perfect
              <br />
              <span className="text-coral">Package Holiday</span>
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-medium mt-4" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
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
