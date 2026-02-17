import { motion } from "framer-motion";
import bookingLogo from "@/assets/logos/booking.png";
import tuiLogo from "@/assets/logos/tui.png";
import expediaLogo from "@/assets/logos/expedia.png";

const imageBrands = [
  { name: "Booking.com", src: bookingLogo },
  { name: "TUI", src: tuiLogo },
  { name: "Expedia", src: expediaLogo },
];

const svgBrands = [
  { name: "Trip.com", color: "#2872F0", fontWeight: 800 },
  { name: "easyJet holidays", color: "#FF6600", fontWeight: 700 },
  { name: "Jet2holidays", color: "#F7D417", fontWeight: 800, stroke: "#D4145A" },
  { name: "loveholidays", color: "#E91E8C", fontWeight: 700 },
  { name: "lastminute.com", color: "#E40087", fontWeight: 700 },
  { name: "On the Beach", color: "#FFD700", fontWeight: 700 },
  { name: "Skyscanner", color: "#0770E3", fontWeight: 700 },
];

const allBrands = [
  { type: "svg" as const, name: "Trip.com" },
  { type: "svg" as const, name: "easyJet holidays" },
  { type: "svg" as const, name: "Jet2holidays" },
  { type: "svg" as const, name: "loveholidays" },
  { type: "svg" as const, name: "lastminute.com" },
  { type: "svg" as const, name: "On the Beach" },
  { type: "img" as const, name: "TUI" },
  { type: "img" as const, name: "Expedia" },
  { type: "img" as const, name: "Booking.com" },
  { type: "svg" as const, name: "Skyscanner" },
];

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
      <div className="flex flex-wrap items-center justify-center gap-5 md:gap-8">
        {allBrands.map((brand, i) => {
          if (brand.type === "img") {
            const imgBrand = imageBrands.find((b) => b.name === brand.name);
            return (
              <motion.img
                key={brand.name}
                src={imgBrand?.src}
                alt={brand.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.05, duration: 0.3 }}
                className="h-7 md:h-9 object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
              />
            );
          }

          const svgBrand = svgBrands.find((b) => b.name === brand.name);
          return (
            <motion.span
              key={brand.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.05, duration: 0.3 }}
              className="text-sm md:text-base font-bold opacity-90 hover:opacity-100 transition-opacity cursor-default select-none"
              style={{
                color: svgBrand?.color,
                fontWeight: svgBrand?.fontWeight,
                textShadow: "0 1px 4px rgba(0,0,0,0.3)",
              }}
            >
              {brand.name}
            </motion.span>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TrustedBrands;
