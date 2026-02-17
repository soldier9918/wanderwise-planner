import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import HotelSearchForm from "@/components/HotelSearchForm";
import HotelDeals from "@/components/HotelDeals";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const heroImages = [
  heroBg1, heroSantorini, heroBg2, heroBali, heroDubai,
  heroMachuPicchu, heroBg3, heroMaldives, heroNewYork, heroPhuket, heroParis,
];

const Hotels = () => {
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
          {heroImages.map((src, index) => (
            <motion.img
              key={index}
              src={src}
              alt="Hotel destination"
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
              Search & Compare
              <br />
              <span className="text-coral">Hotels</span>
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-medium mt-4" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
              Find the best hotel deals across all major booking sites.
            </p>
          </motion.div>

          <HotelSearchForm />
        </div>
      </section>

      <HotelDeals />
      <Footer />
    </div>
  );
};

export default Hotels;
