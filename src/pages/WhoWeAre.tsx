import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Plane, Users, Globe, ShieldCheck } from "lucide-react";

const values = [
  { icon: Globe, title: "Transparency", description: "We show you real prices from real providers — no hidden fees, no tricks." },
  { icon: Users, title: "Traveller-first", description: "Everything we build is designed to save you time and money on your next holiday." },
  { icon: ShieldCheck, title: "Trust", description: "We only partner with established, reputable travel brands you already know and love." },
];

const WhoWeAre = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24 max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-8">Who We Are</h1>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <p className="text-lg">FareFinder is a travel comparison platform that helps you find the best deals on package holidays and flights by searching across all major travel brands — all in one place.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Our Mission</h2>
            <p>We believe finding the perfect holiday shouldn't mean opening 20 browser tabs. FareFinder was built to bring every top travel provider together so you can compare prices instantly and book with confidence.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">What We Do</h2>
            <p>We aggregate pricing data from providers like TUI, Jet2holidays, easyJet holidays, loveholidays, lastminute.com, On the Beach, Expedia, Booking.com, and Trip.com. When you find a deal you love, we redirect you to the provider to complete your booking — we never charge you a penny.</p>
          </section>

          <div className="grid sm:grid-cols-3 gap-5 pt-4">
            {values.map((v) => (
              <div key={v.title} className="p-5 rounded-xl border border-border bg-card text-center">
                <v.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-display font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WhoWeAre;
