import { useState } from "react";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PriceAlertButtonProps {
  from: string;
  to: string;
  depart: string;
  returnDate?: string;
  adults: number;
  cabin: string;
  currentPrice?: number;
}

// Get or create a persistent anonymous session ID
function getSessionId(): string {
  let id = localStorage.getItem("price_alert_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("price_alert_session_id", id);
  }
  return id;
}

const PriceAlertButton = ({
  from,
  to,
  depart,
  returnDate,
  adults,
  cabin,
  currentPrice,
}: PriceAlertButtonProps) => {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAlert = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) return;

    setLoading(true);
    try {
      const sessionId = getSessionId();
      const { error } = await supabase.from("price_alerts").insert({
        session_id: sessionId,
        from_iata: from,
        to_iata: to,
        depart_date: depart,
        return_date: returnDate || null,
        adults,
        cabin,
        current_price: currentPrice ?? null,
      });

      if (error) throw error;

      setSaved(true);
      toast({
        title: "Price alert set! 🔔",
        description: `We'll track ${from} → ${to} on ${depart} and notify you if the price drops.`,
      });
    } catch (err) {
      toast({
        title: "Couldn't save alert",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAlert}
      disabled={loading}
      title={saved ? "Price alert saved" : "Set a price alert"}
      className={cn(
        "p-2 rounded-full border transition-all",
        saved
          ? "border-primary bg-primary/10 text-primary"
          : "border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary"
      )}
      aria-label={saved ? "Price alert saved" : "Set price alert"}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : saved ? (
        <BellRing className="w-4 h-4" />
      ) : (
        <Bell className="w-4 h-4" />
      )}
    </button>
  );
};

export default PriceAlertButton;
