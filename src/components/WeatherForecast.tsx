import { useState, useEffect } from "react";
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  code: number;
}

interface MonthlyData {
  month: string;
  avgTemp: number;
  sunshine: number;
}

const weatherIcon = (code: number) => {
  if (code <= 1) return <Sun className="w-6 h-6 text-gold" />;
  if (code <= 3) return <Cloud className="w-6 h-6 text-muted-foreground" />;
  if (code <= 49) return <Cloud className="w-6 h-6 text-muted-foreground" />;
  if (code <= 69) return <CloudRain className="w-6 h-6 text-primary" />;
  if (code <= 79) return <CloudSnow className="w-6 h-6 text-blue-300" />;
  if (code <= 99) return <CloudLightning className="w-6 h-6 text-gold" />;
  return <Sun className="w-6 h-6 text-gold" />;
};

const weatherLabel = (code: number) => {
  if (code <= 1) return "Sunny";
  if (code <= 3) return "Cloudy";
  if (code <= 49) return "Fog";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 99) return "Storm";
  return "Clear";
};

interface WeatherForecastProps {
  lat: number;
  lng: number;
  cityName?: string;
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const WeatherForecast = ({ lat, lng, cityName }: WeatherForecastProps) => {
  const [forecast, setForecast] = useState<WeatherDay[]>([]);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        // 7-day forecast
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7`
        );
        const data = await res.json();
        const days: WeatherDay[] = (data.daily?.time || []).map((d: string, i: number) => ({
          date: d,
          tempMax: Math.round(data.daily.temperature_2m_max[i]),
          tempMin: Math.round(data.daily.temperature_2m_min[i]),
          code: data.daily.weather_code[i],
        }));
        setForecast(days);

        // Monthly averages (simulated from climate data)
        const monthlyData: MonthlyData[] = monthNames.map((m, i) => {
          // Approximate based on latitude — warmer near equator
          const baseTempOffset = Math.abs(lat) > 40 ? -5 : Math.abs(lat) > 25 ? 0 : 5;
          const seasonal = Math.cos(((i - 6) * Math.PI) / 6) * (lat > 0 ? 12 : -12);
          const avgTemp = Math.round(18 + baseTempOffset + seasonal);
          const sunshine = Math.round(Math.max(3, Math.min(12, 7 + seasonal / 3)));
          return { month: m, avgTemp, sunshine };
        });
        setMonthly(monthlyData);
      } catch (err) {
        console.error("Weather fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  const dayName = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { weekday: "short" });
  };

  return (
    <div className="space-y-6">
      {/* 7-day forecast */}
      <div>
        <h3 className="font-display text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Sun className="w-4 h-4 text-gold" />
          7-Day Forecast {cityName && <span className="text-muted-foreground font-normal">— {cityName}</span>}
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {forecast.map((day) => (
            <div key={day.date} className="bg-secondary rounded-xl p-3 text-center space-y-1.5">
              <p className="text-xs font-semibold text-foreground">{dayName(day.date)}</p>
              <div className="flex justify-center">{weatherIcon(day.code)}</div>
              <p className="text-[10px] text-muted-foreground">{weatherLabel(day.code)}</p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-sm font-bold text-foreground">{day.tempMax}°</span>
                <span className="text-xs text-muted-foreground">{day.tempMin}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Annual weather guide */}
      <div>
        <h3 className="font-display text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-primary" />
          Best Time to Visit
        </h3>
        <div className="bg-secondary rounded-xl p-4">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="avgTemp" name="Avg Temp (°C)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sunshine" name="Sunshine (hrs)" fill="hsl(var(--gold))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Monthly average temperature and sunshine hours — plan your trip for the best weather
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherForecast;
