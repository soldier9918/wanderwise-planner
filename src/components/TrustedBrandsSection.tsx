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

const TrustedBrandsSection = () => {
  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Holiday packages from your favourite travel brands
          </h2>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {brands.map((brand, i) => (
            <motion.img
              key={brand.name}
              src={brand.src}
              alt={brand.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="h-12 md:h-16 object-contain"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBrandsSection;
