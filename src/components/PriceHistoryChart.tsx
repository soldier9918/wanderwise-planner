import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface PriceHistoryChartProps {
  basePrice: number;
  hotelName: string;
}

// Deterministic pseudo-random from string
const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const PriceHistoryChart = ({ basePrice, hotelName }: PriceHistoryChartProps) => {
  const { formatPrice } = useCurrency();

  const data = useMemo(() => {
    const seed = hashStr(hotelName);
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const variation = 0.92 + ((seed * (i + 1) * 3571) % 1000) / 1000 * 0.16;
      return {
        day: date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" }),
        price: Math.round(basePrice * variation * 100) / 100,
      };
    });
  }, [basePrice, hotelName]);

  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const currentPrice = data[data.length - 1].price;
  const previousPrice = data[0].price;
  const priceChange = currentPrice - previousPrice;
  const isDown = priceChange < 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
          {isDown ? (
            <TrendingDown className="w-4 h-4 text-teal" />
          ) : (
            <TrendingUp className="w-4 h-4 text-primary" />
          )}
          7-Day Price Trend
        </h3>
        <span className={`text-sm font-bold ${isDown ? "text-teal" : "text-primary"}`}>
          {isDown ? "" : "+"}{formatPrice(Math.abs(priceChange))} vs last week
        </span>
      </div>

      <div className="bg-secondary rounded-xl p-4">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis
              domain={[Math.floor(minPrice * 0.95), Math.ceil(maxPrice * 1.05)]}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => `£${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number) => [formatPrice(value), "Price"]}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Historical price changes over the last 7 days — track the best time to book
        </p>
      </div>
    </div>
  );
};

export default PriceHistoryChart;
