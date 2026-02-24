import { useState } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TripStyleQuiz, { QuizAnswers } from "@/components/TripStyleQuiz";
import TripConfidenceCard, { TripRecommendation } from "@/components/TripConfidenceCard";
import WhatIfSliders, { WhatIfState } from "@/components/WhatIfSliders";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const AISuggestions = () => {
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);
  const [recommendations, setRecommendations] = useState<TripRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [whatIfLoading, setWhatIfLoading] = useState(false);

  const fetchRecommendations = async (quizAnswers: QuizAnswers, whatIf?: WhatIfState) => {
    const isWhatIf = !!whatIf;
    if (isWhatIf) setWhatIfLoading(true); else setLoading(true);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-trip-suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ answers: quizAnswers, whatIf }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to get recommendations");
        return;
      }

      setRecommendations(data.recommendations || []);
    } catch (err) {
      toast.error("Failed to connect to AI service");
      console.error(err);
    } finally {
      setLoading(false);
      setWhatIfLoading(false);
    }
  };

  const handleQuizComplete = (quizAnswers: QuizAnswers) => {
    setAnswers(quizAnswers);
    fetchRecommendations(quizAnswers);
  };

  const handleWhatIf = (state: WhatIfState) => {
    if (answers) {
      fetchRecommendations(answers, state);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            AI Trip Decision Engine
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Tell Us How You Want To <span className="text-primary">Feel</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Don't know where to go? We'll use AI to match your mood, budget, and constraints
            to the perfect destinations — with full reasoning on why they fit.
          </p>
        </motion.div>

        {/* Quiz or Results */}
        {!answers ? (
          <TripStyleQuiz onComplete={handleQuizComplete} isLoading={loading} />
        ) : (
          <div className="space-y-8">
            {/* Reset button */}
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-foreground">Your AI Recommendations</h2>
              <button
                onClick={() => { setAnswers(null); setRecommendations([]); }}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Start over
              </button>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center gap-3 text-primary">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span className="font-display text-lg animate-pulse">Analyzing your preferences…</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Recommendations */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendations.map((rec, i) => (
                    <TripConfidenceCard key={rec.destination} rec={rec} index={i} rank={i + 1} />
                  ))}
                </div>

                {/* What if sliders */}
                <div className="lg:col-span-1">
                  <WhatIfSliders onChange={handleWhatIf} isLoading={whatIfLoading} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AISuggestions;
