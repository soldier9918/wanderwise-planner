import { motion } from "framer-motion";
import { MapPin, Plane, TrendingUp, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Curated Unsplash photo IDs for common destinations
const DESTINATION_PHOTOS: Record<string, string> = {
  "bali": "1537996194471-e657df975ab4",
  "paris": "1502602898657-3e91760cbb34",
  "santorini": "1570077188670-e3a8d69ac5ff",
  "dubai": "1512453913172-22eca5e2cf11",
  "maldives": "1514282401047-d79a71a590e8",
  "rome": "1552832230-c0197dd311b5",
  "tokyo": "1540959733332-eab352fad40d",
  "barcelona": "1583422409516-2895a77efded",
  "new york": "1496442226666-8d4d0e62e6e9",
  "london": "1513635269975-59663e0ac1ad",
  "istanbul": "1541432901042-2d8bd64b4a9b",
  "lisbon": "1548707309459-c3b3e4ae1e1d",
  "amsterdam": "1534351590666-13e3e96b5017",
  "prague": "1519677100203-a0e668c92439",
  "marrakech": "1489749798305-4fea3ae63d43",
  "bangkok": "1508009603885-50cf7c579365",
  "cairo": "1539768942893-daf53e448371",
  "athens": "1555993539-1732b0258235",
  "cape town": "1580060839134-75a5edca2e99",
  "cancun": "1510097467424-e59d0f36e10c",
  "sydney": "1506973035872-a4ec16b8e8d9",
  "rio de janeiro": "1483729558449-99ef09a8c325",
  "hawaii": "1507876466758-bc54f384809c",
  "costa rica": "1518259102261-b40117eabbc9",
  "vietnam": "1528127269322-539152534f3d",
  "croatia": "1555990793-5db1da37e6f5",
  "iceland": "1504829857797-dab3bf379b6b",
  "mexico city": "1518105779142-d975f22f1b0a",
  "florence": "1541370976299-4d24ebbc9077",
  "phuket": "1537956965359-7573183d1f57",
  "tenerife": "1500930287596-c1ecb920e12e",
  "lanzarote": "1500930287596-c1ecb920e12e",
  "gran canaria": "1500930287596-c1ecb920e12e",
  "antalya": "1568700942090-19dc36fab0c4",
  "malaga": "1509840841025-9088ba78a826",
  "zanzibar": "1547471080-7cc2caa01a7e",
  "morocco": "1489749798305-4fea3ae63d43",
  "portugal": "1555881400-74d7acaacd8b",
  "greece": "1555993539-1732b0258235",
  "spain": "1509840841025-9088ba78a826",
  "italy": "1552832230-c0197dd311b5",
  "thailand": "1508009603885-50cf7c579365",
  "japan": "1540959733332-eab352fad40d",
  "india": "1524492412937-b28074a5d7da",
  "turkey": "1568700942090-19dc36fab0c4",
  "mexico": "1518105779142-d975f22f1b0a",
  "colombia": "1533042942-a0d8cc17f0a0",
  "peru": "1526392060635-9d6019884377",
  "kenya": "1547471080-7cc2caa01a7e",
  "south africa": "1580060839134-75a5edca2e99",
  "sri lanka": "1586500887080-e74f0b5d5883",
};

// Diverse fallback images for unmapped destinations
const FALLBACK_PHOTOS = [
  "1507525428034-b723cf961d3e", // beach
  "1469854523086-cc02fe5d8800", // travel
  "1476514525535-07fb3b4ae5f1", // tropical
  "1530789253388-582c481c54b0", // adventure
  "1488646953014-85cb44e25828", // landscape
  "1501785888041-af3ef285b470", // mountains
  "1528164344705-47542687000d", // city
  "1502920917128-1aa500764cbd", // nature
];

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
          src={`https://images.unsplash.com/photo-${DESTINATION_PHOTOS[rec.destination.toLowerCase()] || FALLBACK_PHOTOS[index % FALLBACK_PHOTOS.length]}?w=800&h=400&fit=crop&auto=format`}
          alt={rec.destination}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-${FALLBACK_PHOTOS[(index + 1) % FALLBACK_PHOTOS.length]}?w=800&h=400&fit=crop&auto=format`;
          }}
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
