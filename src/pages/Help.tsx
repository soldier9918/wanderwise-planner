import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Help = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24 max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-8">Help Centre</h1>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">How does FareFinder work?</h2>
            <p>FareFinder searches across all major travel brands — including TUI, Jet2holidays, easyJet holidays, loveholidays, lastminute.com, and more — to compare prices for flights and package holidays. We don't sell holidays directly; instead, we redirect you to the provider offering the best deal.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Is FareFinder free to use?</h2>
            <p>Yes, FareFinder is completely free. We earn a small commission from travel providers when you book through our links, at no extra cost to you.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">How do I book a holiday?</h2>
            <p>Simply search for your destination, compare prices across providers, and click through to the one offering the best deal. You'll complete your booking directly on the provider's website.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">I have an issue with my booking</h2>
            <p>Since bookings are made directly with travel providers, any issues with your booking should be directed to the provider you booked with. If you're unsure who you booked with, check your confirmation email.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">How do I contact FareFinder?</h2>
            <p>You can reach us via our <a href="/contact" className="text-primary hover:underline">Contact Us</a> page. We aim to respond within 24 hours.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Help;
