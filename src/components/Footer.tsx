import { Plane } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = [
  {
    title: "Support",
    links: ["Help", "Trust & Safety", "Cookie Policy", "Privacy Settings"],
  },
  {
    title: "Legal",
    links: ["Terms of Service", "Privacy Policy", "Company Details"],
  },
  {
    title: "Account",
    links: ["Log In", "Select Currency"],
  },
];

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-10">
          {/* Top: Logo + Link columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Link to="/" className="flex items-center gap-2 col-span-2 md:col-span-1">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Plane className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold text-foreground">
                Fare<span className="text-primary">Finder</span>
              </span>
            </Link>

            {footerLinks.map((group) => (
              <div key={group.title}>
                <h4 className="font-display font-semibold text-foreground mb-3 text-sm">
                  {group.title}
                </h4>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
            <span className="text-sm text-muted-foreground">Compare. Book. Travel.</span>
            <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} FareFinder</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
