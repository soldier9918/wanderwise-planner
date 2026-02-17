import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24 max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-8">Terms of Service</h1>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">1. About FareFinder</h2>
            <p>FareFinder is a travel comparison platform that allows users to search and compare holiday packages and flights across multiple travel providers. We do not sell travel products directly — we redirect you to third-party providers where you complete your booking.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">2. Use of Service</h2>
            <p>By accessing FareFinder, you agree to use the service lawfully and in accordance with these terms. You must not misuse the platform, attempt to access it through automated means without permission, or interfere with its operation.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">3. Accuracy of Information</h2>
            <p>We strive to provide accurate and up-to-date pricing information. However, prices are sourced from third-party providers and may change between the time of your search and the time of booking. FareFinder is not responsible for pricing errors on provider websites.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">4. Third-Party Providers</h2>
            <p>Your booking is governed by the terms and conditions of the travel provider you book with. FareFinder is not a party to any booking transaction and accepts no liability for the services provided by third parties.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">5. Limitation of Liability</h2>
            <p>FareFinder shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability is limited to the amount you have paid to use the service (which is nil, as FareFinder is free).</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">6. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of FareFinder after changes constitutes acceptance of the updated terms.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
