import { Link, useLocation, useNavigate } from "react-router-dom";
import { Plane, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Flights + Hotels", path: "/" },
  { label: "Flights", path: "/flights" },
  { label: "Hotels", path: "/results" },
  { label: "Trending Destinations", path: "/#trending-destinations" },
  { label: "Deals", path: "/results" },
  { label: "How It Works", path: "/#how-it-works" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    if (path.includes("#")) {
      e.preventDefault();
      const hash = path.split("#")[1];
      if (location.pathname === "/") {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(() => {
          document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
      setMobileOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy border-b border-navy-lighter">
      <div className="container mx-auto px-4 h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Plane className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-white">
            Fare<span className="text-primary">Finder</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={(e) => handleNavClick(e, item.path)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                location.pathname === item.path && item.label === "Flights + Hotels"
                  ? "text-primary bg-primary/10"
                  : "text-white/70 hover:text-white hover:bg-navy-lighter"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button
          className="md:hidden text-white ml-auto"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-navy border-t border-navy-lighter"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={(e) => { handleNavClick(e, item.path); setMobileOpen(false); }}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-navy-lighter transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/results"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold text-center"
              >
                Compare Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
