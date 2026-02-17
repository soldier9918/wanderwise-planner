import { motion } from "framer-motion";
import { ShieldCheck, BarChart3, Globe, Zap } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Real-Time Comparison",
    description: "Prices from LoveHolidays, Lastminute, Booking.com, Skyscanner & more — side by side.",
  },
  {
    icon: Globe,
    title: "Interactive Maps",
    description: "See hotels, airports, transport links, restaurants and tourist spots all on one map.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Lightning-fast search with smart filters for star rating, board type, distance & more.",
  },
  {
    icon: ShieldCheck,
    title: "Best Price Guarantee",
    description: "We surface the cheapest option every time — no hidden fees, no surprises.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Why FareFinder?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            We do the hard work, you pick the holiday.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-gradient-card rounded-2xl p-6 border border-border shadow-card hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feat.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {feat.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                {feat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
