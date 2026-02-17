import { motion } from "framer-motion";
import tripcomLogo from "@/assets/logos/tripcom.png";
import easyjetLogo from "@/assets/logos/easyjet.png";
import jet2Logo from "@/assets/logos/jet2holidays.png";
import loveholidaysLogo from "@/assets/logos/loveholidays.png";
import lastminuteLogo from "@/assets/logos/lastminute.png";
import onthebeachLogo from "@/assets/logos/onthebeach.png";
import tuiLogo from "@/assets/logos/tui.png";
import expediaLogo from "@/assets/logos/expedia.png";
import bookingLogo from "@/assets/logos/booking.png";

const brands = [
  { name: "Trip.com", src: tripcomLogo },
  { name: "easyJet holidays", src: easyjetLogo },
  { name: "Jet2holidays", src: jet2Logo },
  { name: "loveholidays", src: loveholidaysLogo },
  { name: "lastminute.com", src: lastminuteLogo },
  { name: "On the Beach", src: onthebeachLogo },
  { name: "TUI", src: tuiLogo },
  { name: "Expedia", src: expediaLogo },
  { name: "Booking.com", src: bookingLogo },
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
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
        {brands.map((brand, i) => (
          <motion.img
            key={brand.name}
            src={brand.src}
            alt={brand.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.05, duration: 0.3 }}
            className="h-10 md:h-14 object-contain hover:scale-105 transition-transform cursor-default"
          />
        ))}
      </div>
    </motion.div>
  );
};

export default TrustedBrands;
