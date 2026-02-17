import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Login = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24 max-w-md text-center">
        <h1 className="font-display text-4xl font-bold text-foreground mb-4">Log In</h1>
        <p className="text-muted-foreground mb-8">
          Log in to save your favourite deals, set price alerts, and personalise your search experience.
        </p>
        <div className="p-8 rounded-2xl border border-border bg-card">
          <p className="text-muted-foreground text-sm">Login functionality coming soon. Stay tuned!</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
