import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useState } from "react";
import { Check } from "lucide-react";

const CurrencySelector = ({ children }: { children: React.ReactNode }) => {
  const { currency, setCurrency, currencies } = useCurrency();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Select Currency</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 mt-4 max-h-80 overflow-y-auto">
          {currencies.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                setCurrency(c);
                setOpen(false);
              }}
              className={`flex items-center justify-between p-3 rounded-lg text-left text-sm transition-colors ${
                currency.code === c.code
                  ? "bg-primary/10 border border-primary text-foreground"
                  : "border border-border hover:bg-muted text-foreground"
              }`}
            >
              <span>
                <span className="font-semibold">{c.symbol}</span>{" "}
                <span className="text-muted-foreground">{c.code}</span>
              </span>
              {currency.code === c.code && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CurrencySelector;
