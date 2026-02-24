import { useState, useEffect } from "react";
import { Bell, Trash2, Plane, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";

interface PriceAlert {
  id: string;
  from_iata: string;
  to_iata: string;
  depart_date: string;
  return_date: string | null;
  adults: number;
  cabin: string;
  target_price: number | null;
  current_price: number | null;
  created_at: string | null;
  session_id: string;
}

const getSessionId = () => {
  let id = localStorage.getItem("price_alert_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("price_alert_session_id", id);
  }
  return id;
};

const PriceAlerts = () => {
  const { formatPrice } = useCurrency();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    const sessionId = getSessionId();
    const { data, error } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });

    if (!error && data) setAlerts(data);
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, []);

  const deleteAlert = async (id: string) => {
    await supabase.from("price_alerts").delete().eq("id", id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Price Alerts</h1>
              <p className="text-sm text-muted-foreground">Monitor flight prices and get notified when they drop</p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-secondary rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">No price alerts yet</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Search for flights and click the bell icon on any result to set up a price alert. We'll track the price for you.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border shadow-card"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Plane className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-foreground">
                    {alert.from_iata} → {alert.to_iata}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {alert.depart_date}{alert.return_date ? ` — ${alert.return_date}` : " (one way)"}
                    {" · "}{alert.adults} {alert.adults === 1 ? "adult" : "adults"}
                    {" · "}{alert.cabin}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {alert.current_price != null && (
                    <p className="font-display text-lg font-bold text-foreground">{formatPrice(alert.current_price)}</p>
                  )}
                  {alert.target_price != null && (
                    <p className="text-xs text-muted-foreground">Target: {formatPrice(alert.target_price)}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors shrink-0"
                  title="Delete alert"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PriceAlerts;
