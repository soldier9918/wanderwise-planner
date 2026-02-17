import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import SearchForm from "@/components/SearchForm";
import FlightDeals from "@/components/FlightDeals";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const heroImages = [
  flightsHeroBg1, flightsClouds, flightsHeroBg2, flightsTerminal, flightsTakeoff,
  flightsAerial, flightsHeroBg3, flightsPlanes, flightsWindow, flightsNight, flightsSunrise,
];

const Flights = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 30000);
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
              alt="Flight destination"
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
              <span className="text-coral">Flights</span>
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-medium mt-4" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
              Find the cheapest flights across all major airlines and booking sites.
            </p>
          </motion.div>

          <SearchForm />
        </div>
      </section>

      <FlightDeals />
      <Footer />
    </div>
  );
};

export default Flights;
