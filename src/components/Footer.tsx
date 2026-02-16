import { Plane } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Plane className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              Fare<span className="text-primary">Finder</span>
            </span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>Compare. Book. Travel.</span>
            <span>© {new Date().getFullYear()} FareFinder</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
