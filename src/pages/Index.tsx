import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import SearchForm from "@/components/SearchForm";

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
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
              Compare. Book.
              <br />
              <span className="text-gradient-coral">Save Big.</span>
            </h1>
          </motion.div>

          

          <SearchForm />
        </div>
      </section>

      <FeaturedDestinations />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
