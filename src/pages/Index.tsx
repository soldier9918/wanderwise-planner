import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import PackageSearchForm from "@/components/PackageSearchForm";
import FeaturedDestinations from "@/components/FeaturedDestinations";
import HowItWorks from "@/components/HowItWorks";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden text-white">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Beautiful beach destination"
            className="w-full h-full object-cover"
          />
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
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.3)' }}>
              Find Your Perfect
              <br />
              <span className="text-gradient-coral">Package Holiday</span>
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-medium mt-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              Search hotels & flights across all your favourite brands — all in one place.
            </p>
          </motion.div>

          <PackageSearchForm />
        </div>
      </section>

      <FeaturedDestinations />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
