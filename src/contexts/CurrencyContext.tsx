import { useState, createContext, useContext, useCallback } from "react";

// Approximate conversion rates from GBP
const conversionRates: Record<string, number> = {
  GBP: 1, EUR: 1.17, USD: 1.27, AED: 4.67, AUD: 1.94,
  CAD: 1.72, CHF: 1.12, JPY: 190.5, THB: 44.2, TRY: 38.5,
  INR: 105.8, SEK: 13.4,
};

type Currency = {
  code: string;
  symbol: string;
  name: string;
};

const currencies: Currency[] = [
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
];

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  currencies: Currency[];
  formatPrice: (gbpAmount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: currencies[0],
  setCurrency: () => {},
  currencies,
  formatPrice: (amount) => `£${Math.round(amount).toLocaleString()}`,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>(currencies[0]);

  const formatPrice = useCallback((gbpAmount: number) => {
    const rate = conversionRates[currency.code] || 1;
    const converted = Math.round(gbpAmount * rate);
    return `${currency.symbol}${converted.toLocaleString()}`;
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, currencies, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export { currencies };
export type { Currency };
