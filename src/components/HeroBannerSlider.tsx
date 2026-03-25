import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export interface HeroSlide {
  image: string;
  topLine: string;
  mainText: string;
  subText: string;
  topLineClass?: string;
  mainTextClass?: string;
  subTextClass?: string;
  textPosition?: "center" | "left" | "right";
  overlayClass?: string;
}

interface HeroBannerSliderProps {
  slides: HeroSlide[];
  children?: React.ReactNode; // search form
}

const HeroBannerSlider = ({ slides, children }: HeroBannerSliderProps) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 10000);
    return () => clearInterval(id);
  }, [paused, next]);

  const slide = slides[current];
  const align =
    slide.textPosition === "left"
      ? "items-start text-left"
      : slide.textPosition === "right"
        ? "items-end text-right"
        : "items-center text-center";

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden">
      {/* Background images with crossfade */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.img
            key={current}
            src={slide.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </AnimatePresence>
        <div className={slide.overlayClass || "absolute inset-0 bg-navy/40"} />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/30 via-transparent to-navy/60" />
      </div>

      {/* Slide text */}
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-48 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className={`flex flex-col gap-2 ${align} max-w-4xl ${slide.textPosition === "right" ? "ml-auto" : slide.textPosition === "left" ? "mr-auto" : "mx-auto"}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7 }}
          >
            <motion.p
              className={slide.topLineClass || "text-lg md:text-xl font-semibold text-white/90 uppercase tracking-widest"}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}
            >
              {slide.topLine}
            </motion.p>
            <motion.h2
              className={slide.mainTextClass || "font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-tight"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{ textShadow: "0 4px 24px rgba(0,0,0,0.7)" }}
            >
              {slide.mainText}
            </motion.h2>
            <motion.p
              className={slide.subTextClass || "text-lg md:text-2xl text-white/85 font-medium mt-2"}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
            >
              {slide.subText}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="absolute bottom-52 left-0 right-0 z-20 flex items-center justify-center gap-3">
        <button
          onClick={prev}
          className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={() => setPaused((p) => !p)}
          className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors"
          aria-label={paused ? "Play" : "Pause"}
        >
          {paused ? <Play className="w-4 h-4 text-white" /> : <Pause className="w-4 h-4 text-white" />}
        </button>

        {/* Dots */}
        <div className="flex gap-1.5 items-center">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 h-2.5 bg-accent"
                  : "w-2.5 h-2.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Search form overlay at bottom */}
      {children && (
        <div className="relative z-20 -mt-32 container mx-auto px-4 pb-8">
          {children}
        </div>
      )}
    </section>
  );
};

export default HeroBannerSlider;
