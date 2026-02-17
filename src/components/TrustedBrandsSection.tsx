import { motion } from "framer-motion";
import brandLogos from "@/assets/brand-logos-row.png";

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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <img
            src={brandLogos}
            alt="Trip.com, easyJet holidays, Jet2holidays, loveholidays, lastminute.com, On the Beach, TUI, Expedia"
            className="w-full max-w-5xl object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default TrustedBrandsSection;
