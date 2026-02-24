import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

export interface QuizAnswers {
  mood: string;
  budget: string;
  flightDuration: string;
  crowds: string;
  climate: string;
  dates: string;
  origin: string;
  exclusions: string;
}

interface TripStyleQuizProps {
  onComplete: (answers: QuizAnswers) => void;
  isLoading?: boolean;
}

const questions = [
  {
    key: "mood",
    title: "How do you want to feel?",
    subtitle: "Pick the vibe that speaks to you",
    options: ["Relaxed & peaceful", "Adventure & thrills", "Cultural & enriching", "Party & nightlife", "Romantic & intimate"],
  },
  {
    key: "budget",
    title: "What's your budget per person?",
    subtitle: "Including flights and accommodation",
    options: ["Under £400", "£400 – £700", "£700 – £1,200", "£1,200 – £2,000", "No limit"],
  },
  {
    key: "flightDuration",
    title: "How long are you willing to fly?",
    subtitle: "Maximum flight duration from your origin",
    options: ["Under 2 hours", "2 – 4 hours", "4 – 7 hours", "7 – 12 hours", "Any duration"],
  },
  {
    key: "crowds",
    title: "How do you feel about crowds?",
    subtitle: "Tourist density preference",
    options: ["Avoid crowds completely", "Prefer quieter spots", "Don't mind either way", "Love the buzz of popular places"],
  },
  {
    key: "climate",
    title: "What climate do you prefer?",
    subtitle: "Temperature and weather preference",
    options: ["Hot & sunny (30°C+)", "Warm & pleasant (20–30°C)", "Mild & comfortable (15–20°C)", "Cool & crisp (below 15°C)", "Don't mind"],
  },
  {
    key: "dates",
    title: "When are you thinking of going?",
    subtitle: "Your travel window",
    options: ["Next 2 weeks", "Within a month", "In 2–3 months", "3–6 months away", "Flexible / anytime"],
  },
  {
    key: "origin",
    title: "Where are you flying from?",
    subtitle: "Your departure city",
    options: ["London", "Manchester", "Birmingham", "Edinburgh", "Other UK city"],
  },
];

const TripStyleQuiz = ({ onComplete, isLoading }: TripStyleQuizProps) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [exclusions, setExclusions] = useState("");

  const current = questions[step];
  const isLastQuestion = step === questions.length - 1;

  const selectOption = (option: string) => {
    const updated = { ...answers, [current.key]: option };
    setAnswers(updated);

    if (isLastQuestion) {
      // Show exclusions input
    } else {
      setTimeout(() => setStep(step + 1), 200);
    }
  };

  const handleSubmit = () => {
    onComplete({ ...answers, exclusions } as unknown as QuizAnswers);
  };

  const progress = ((step + 1) / (questions.length + 1)) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-secondary rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {step < questions.length ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-sm text-muted-foreground mb-1">Question {step + 1} of {questions.length}</p>
            <h2 className="font-display text-2xl font-bold text-foreground mb-1">{current.title}</h2>
            <p className="text-muted-foreground mb-6">{current.subtitle}</p>

            <div className="space-y-3">
              {current.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => selectOption(opt)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    answers[current.key] === opt
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card hover:border-primary/30 hover:bg-primary/5 text-foreground"
                  }`}
                >
                  <span className="font-medium">{opt}</span>
                </button>
              ))}
            </div>

            {/* Show exclusions input on last question after selection */}
            {isLastQuestion && answers[current.key] && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                <label className="text-sm font-semibold text-foreground block mb-2">
                  Any destinations you want to exclude? (optional)
                </label>
                <input
                  type="text"
                  value={exclusions}
                  onChange={(e) => setExclusions(e.target.value)}
                  placeholder="e.g. Spain, Turkey (places you've been)"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                />
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="animate-pulse">Finding your perfect trips…</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Get AI Recommendations
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* Back button */}
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="mt-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default TripStyleQuiz;
