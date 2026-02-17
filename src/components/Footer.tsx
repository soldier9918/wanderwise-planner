import { Plane } from "lucide-react";
import { Link } from "react-router-dom";
import CurrencySelector from "@/components/CurrencySelector";
import { useCurrency } from "@/contexts/CurrencyContext";

const footerLinks = [
  {
    title: "Support",
    links: [
      { label: "Help", href: "/help" },
      { label: "Trust & Safety", href: "/trust-safety" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Privacy Settings", href: "/privacy-settings" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log In", href: "/login" },
      { label: "Who We Are", href: "/who-we-are" },
    ],
  },
];

const Footer = () => {
  const { currency } = useCurrency();

  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <Link to="/" className="flex items-center gap-2 col-span-2 md:col-span-2">
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
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  {group.title === "Account" && (
                    <li>
                      <CurrencySelector>
                        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          Currency: {currency.symbol} {currency.code}
                        </button>
                      </CurrencySelector>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>

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
