import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24 max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Information we collect</h2>
            <p>When you use FareFinder, we may collect information such as your search queries, device type, browser information, and IP address. If you contact us, we also collect the information you provide in your message.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">How we use your information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and improve our travel comparison service</li>
              <li>To remember your preferences (e.g. currency selection)</li>
              <li>To analyse usage patterns and improve site performance</li>
              <li>To respond to your enquiries</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Sharing your information</h2>
            <p>We do not sell your personal data. We may share anonymised analytics data with trusted partners to improve our service. When you click through to a travel provider, that provider's own privacy policy will apply.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Your rights</h2>
            <p>You have the right to access, correct, or delete your personal data. You can also opt out of non-essential cookies via our <a href="/privacy-settings" className="text-primary hover:underline">Privacy Settings</a> page. For data requests, please contact us via our <a href="/contact" className="text-primary hover:underline">Contact Us</a> page.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Data retention</h2>
            <p>We retain your data only for as long as necessary to fulfil the purposes outlined in this policy. Analytics data is anonymised after 26 months.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
