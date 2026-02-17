import { motion } from "framer-motion";

const brands = [
  { name: "Trip.com", color: "bg-blue-600" },
  { name: "easyJet holidays", color: "bg-orange-500" },
  { name: "Jet2holidays", color: "bg-yellow-500" },
  { name: "LoveHolidays", color: "bg-pink-500" },
  { name: "Lastminute.com", color: "bg-fuchsia-600" },
  { name: "On the Beach", color: "bg-sky-500" },
  { name: "TUI", color: "bg-red-600" },
  { name: "Expedia", color: "bg-indigo-600" },
  { name: "Booking.com", color: "bg-blue-700" },
  { name: "Skyscanner", color: "bg-teal-500" },
];

const TrustedBrands = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            We compare prices from the brands you trust
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            All your favourite travel sites in one search — so you never overpay.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 md:gap-5"
        >
          {brands.map((brand, i) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
              whileHover={{ scale: 1.05, y: -2 }}
              className={`${brand.color} text-white px-5 py-2.5 rounded-xl text-sm md:text-base font-bold shadow-md cursor-default select-none`}
            >
              {brand.name}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustedBrands;
