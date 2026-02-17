import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24 max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-8">Cookie Policy</h1>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">What are cookies?</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and improve your experience.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">How we use cookies</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Essential cookies:</strong> Required for the website to function properly, such as remembering your currency preference.</li>
              <li><strong className="text-foreground">Analytics cookies:</strong> Help us understand how visitors interact with FareFinder so we can improve our service.</li>
              <li><strong className="text-foreground">Advertising cookies:</strong> Used by our partners to show you relevant travel deals based on your browsing activity.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Managing cookies</h2>
            <p>You can manage your cookie preferences through your browser settings or via our <a href="/privacy-settings" className="text-primary hover:underline">Privacy Settings</a> page. Please note that disabling certain cookies may affect your experience on FareFinder.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
