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
            <p className="text-lg md:text-xl text-white/80 font-medium max-w-2xl mx-auto">
              Search hotels &amp; flights across LoveHolidays, Lastminute, Booking.com,
              Skyscanner and more — all in one place.
            </p>
          </motion.div>

          <SearchForm />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-6 mt-8 flex-wrap"
          >
            {["LoveHolidays", "Lastminute.com", "Booking.com", "Skyscanner", "TUI", "Jet2"].map(
              (brand) => (
                <span
                  key={brand}
                  className="text-xs font-semibold text-white/60 uppercase tracking-wider"
                >
                  {brand}
                </span>
              )
            )}
          </motion.div>
        </div>
      </section>

      <FeaturedDestinations />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
