import { motion } from "framer-motion";
import brandLogos from "@/assets/brand-logos.png";

const TrustedBrands = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="mt-8"
    >
      <p className="text-white/80 text-base md:text-lg font-medium text-center mb-5">
        Search hotels & flights across all your favourite brands — all in one place.
      </p>
      <div className="flex justify-center bg-white/90 rounded-2xl px-6 py-4 mx-auto max-w-4xl">
        <img
          src={brandLogos}
          alt="Trip.com, easyJet holidays, Jet2holidays, loveholidays, lastminute.com, On the Beach, TUI, Expedia"
          className="max-w-full h-12 md:h-16 object-contain"
        />
      </div>
    </motion.div>
  );
};

export default TrustedBrands;
