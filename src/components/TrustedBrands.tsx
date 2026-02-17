import { motion } from "framer-motion";

const brands = [
  { name: "Trip.com", bg: "#003580", text: "#fff", accent: "#FF6B00" },
  { name: "easyJet holidays", bg: "#FF6600", text: "#fff" },
  { name: "Jet2holidays", bg: "#F7D417", text: "#D4145A" },
  { name: "loveholidays", bg: "#E91E8C", text: "#fff" },
  { name: "lastminute.com", bg: "#E40087", text: "#fff" },
  { name: "On the Beach", bg: "#FFD700", text: "#1A1A2E" },
  { name: "TUI", bg: "#D40E14", text: "#fff" },
  { name: "Expedia", bg: "#FBCC33", text: "#1A1A2E" },
  { name: "Booking.com", bg: "#003580", text: "#fff" },
  { name: "Skyscanner", bg: "#0770E3", text: "#fff" },
];

const TrustedBrands = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="mt-8"
    >
      <p className="text-white/50 text-xs font-semibold uppercase tracking-widest text-center mb-4">
        Comparing prices from your favourite brands
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {brands.map((brand, i) => (
          <motion.div
            key={brand.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.08, y: -2 }}
            className="px-4 py-2 rounded-lg text-xs md:text-sm font-bold shadow-lg cursor-default select-none backdrop-blur-sm"
            style={{
              backgroundColor: brand.bg,
              color: brand.text,
            }}
          >
            {brand.name}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TrustedBrands;
