import { motion } from "framer-motion";
import { MapPin, Plane, TrendingUp, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface TripRecommendation {
  destination: string;
  country: string;
  confidence: number;
  scores: {
    budget: number;
    weather: number;
    crowds: number;
    flightComfort: number;
  };
  reasoning: string;
  whyNotAlternative?: string;
  imageQuery: string;
}

interface TripConfidenceCardProps {
  rec: TripRecommendation;
  index: number;
  rank: number;
}

const ScoreBar = ({ label, score }: { label: string; score: number }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-primary rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
    </div>
    <span className="text-xs font-bold text-foreground w-10 text-right">{score}%</span>
  </div>
);

const TripConfidenceCard = ({ rec, index, rank }: TripConfidenceCardProps) => {
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/flight-results?to=${encodeURIComponent(rec.destination)}&from=LHR`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={`https://source.unsplash.com/featured/800x400/?${encodeURIComponent(rec.imageQuery)}`}
          alt={rec.destination}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <p className="text-white/70 text-xs flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {rec.country}
          </p>
          <h3 className="font-display text-2xl font-bold text-white">{rec.destination}</h3>
        </div>
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm">
          #{rank} — {rec.confidence}% Match
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Scores */}
        <div className="space-y-2">
          <ScoreBar label="Budget fit" score={rec.scores.budget} />
          <ScoreBar label="Weather" score={rec.scores.weather} />
          <ScoreBar label="Crowd level" score={rec.scores.crowds} />
          <ScoreBar label="Flight comfort" score={rec.scores.flightComfort} />
        </div>

        {/* Reasoning */}
        <div className="bg-secondary rounded-xl p-4">
          <p className="text-sm text-foreground leading-relaxed">{rec.reasoning}</p>
        </div>

        {/* Why not alternative */}
        {rec.whyNotAlternative && (
          <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
            <p className="text-xs text-muted-foreground">{rec.whyNotAlternative}</p>
          </div>
        )}

        {/* Action */}
        <button
          onClick={handleSearch}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plane className="w-4 h-4" />
          Search flights to {rec.destination}
        </button>
      </div>
    </motion.div>
  );
};

export default TripConfidenceCard;
