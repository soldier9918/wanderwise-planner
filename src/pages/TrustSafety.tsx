import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TrustSafety = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24 max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-8">Trust & Safety</h1>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Your safety matters</h2>
            <p>At FareFinder, we take the safety and security of our users seriously. We only partner with established, reputable travel brands that meet our quality and trust standards.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">ATOL & ABTA Protection</h2>
            <p>Many of the providers listed on FareFinder are ATOL-protected, meaning your money is safeguarded if a travel company ceases trading. We recommend always checking for ATOL or ABTA protection when booking.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Secure browsing</h2>
            <p>Our website uses HTTPS encryption to ensure your browsing activity is secure. We never store your payment details — all transactions are handled directly by the travel provider.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Reporting concerns</h2>
            <p>If you encounter suspicious activity, misleading information, or have safety concerns, please contact us immediately via our <a href="/contact" className="text-primary hover:underline">Contact Us</a> page.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrustSafety;
